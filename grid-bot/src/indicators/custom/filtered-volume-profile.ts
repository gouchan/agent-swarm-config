/**
 * Filtered Volume Profile (FVP) Indicator
 *
 * Translated from: "Filtered Volume Profile [ChartPrime]" (Pine Script v5)
 * Original by ChartPrime, MPL-2.0 license
 *
 * Builds a smoothed volume profile with peak detection:
 * 1. Distributes volume across 100 price bins proportionally
 * 2. Smooths with sinc-kernel regression (Lanczos-style)
 * 3. Finds volume peaks (POC + secondary peaks) using local maxima
 * 4. Scores peaks via Student's t-distribution probability
 *
 * Signal logic (added for grid-bot):
 *   BUY  = price at/below POC or support peak + bullish volume ratio
 *   SELL = price at/above POC or resistance peak + bearish volume ratio
 *   Confidence = peak volume strength × proximity × mean score
 */

import type {
  Indicator,
  IndicatorConfig,
  IndicatorInput,
  IndicatorOutput,
  OHLCV,
} from '../types.js';

// ─── Constants ───────────────────────────────────────────────

const NUM_BINS = 100;

// Lanczos gamma coefficients (Stirling's approximation)
const GAMMA_DK = [
  2.48574089138753565546e-5,
  1.0514237858172197421,
  -3.45687097222016235469,
  4.512277094668948237,
  -2.98285225323576655721,
  1.05639711577126713077,
  -1.95428773191645869583e-1,
  1.70970543404441224307e-2,
  -5.71926117404305781283e-4,
  4.63399473359905636708e-6,
  -2.71994908488607703910e-9,
];
const GAMMA_N = 10;
const GAMMA_R = 10.900511;
const TWO_SQRT_E_OVER_PI = 1.8603827342052657;

// ─── Config ──────────────────────────────────────────────────

export class FilteredVolumeProfileIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'filtered-volume-profile',
    description:
      'Filtered Volume Profile — kernel-smoothed volume with peak detection and mean scoring',
    defaultParams: {
      lookback: 200,
      smoothing: 3,
      peakSensitivity: 3,
      peakThreshold: 80,
      meanScoreLength: 20,
    },
    timeframe: '15m',
    minCandles: 50,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const {
      lookback,
      smoothing,
      peakSensitivity,
      peakThreshold,
      meanScoreLength,
    } = params;
    const len = candles.length;
    const effectiveLookback = Math.min(lookback, len);

    if (effectiveLookback < 20) {
      return neutral(0, {});
    }

    const recentCandles = candles.slice(len - effectiveLookback);
    const currentPrice = candles[len - 1].close;

    // ── 1. Price range ──────────────────────────────────────
    let top = -Infinity;
    let bot = Infinity;
    for (const c of recentCandles) {
      if (c.high > top) top = c.high;
      if (c.low < bot) bot = c.low;
    }

    if (top <= bot) return neutral(0, {});

    const step = (top - bot) / NUM_BINS;
    const range = step * peakSensitivity;

    // Build level boundaries
    const levels: number[] = [];
    for (let i = 0; i <= NUM_BINS; i++) {
      levels.push(bot + step * i);
    }

    // ── 2. Distribute volume across bins ────────────────────
    const rawVolumes = new Float64Array(NUM_BINS);
    const bullishVolumes = new Float64Array(NUM_BINS);

    for (const c of recentCandles) {
      const isBull = c.close > c.open;
      for (let x = 0; x < NUM_BINS; x++) {
        const vol = getVolumeProportion(
          levels[x],
          levels[x + 1],
          c.low,
          c.high,
          c.volume,
        );
        rawVolumes[x] += vol;
        if (isBull) bullishVolumes[x] += vol;
      }
    }

    // ── 3. Kernel smooth the volume profile ─────────────────
    const smoothedVolumes = sincKernelSmooth(
      Array.from(rawVolumes),
      smoothing,
    );

    // ── 4. Find POC and peaks ───────────────────────────────
    const maxSmoothed = Math.max(...smoothedVolumes);
    const pocIdx = smoothedVolumes.indexOf(maxSmoothed);
    const pocPrice = (levels[pocIdx] + levels[Math.min(pocIdx + 1, NUM_BINS)]) / 2;

    // Percentile threshold for peak detection
    const sortedVols = [...smoothedVolumes].sort((a, b) => a - b);
    const threshIdx = Math.floor(
      (peakThreshold / 100) * (sortedVols.length - 1),
    );
    const thresholdValue = sortedVols[threshIdx];

    const peaks = findPeaks(
      smoothedVolumes,
      levels,
      peakSensitivity,
      thresholdValue,
      range,
    );

    // ── 5. Mean score (t-distribution probability) ──────────
    const { mean, offset } = computeMeanScore(candles, meanScoreLength);

    const pocZScore = offset > 0 ? (pocPrice - mean) / (offset * 1.5) : 0;
    const pocMeanScore = tDistPdf(pocZScore, meanScoreLength - 1);

    // ── 6. Bull/Bear ratio in volume ────────────────────────
    const totalVol = rawVolumes.reduce((s, v) => s + v, 0);
    const totalBullVol = bullishVolumes.reduce((s, v) => s + v, 0);
    const bullRatio = totalVol > 0 ? totalBullVol / totalVol : 0.5;
    const isBullish = bullRatio > 0.5;

    // ── 7. Color ratio per bin (for proximity scoring) ──────
    const colorArray = new Float64Array(NUM_BINS);
    for (let i = 0; i < NUM_BINS; i++) {
      colorArray[i] = rawVolumes[i] > 0 ? bullishVolumes[i] / rawVolumes[i] : 0.5;
    }

    // ── 8. Generate signal ──────────────────────────────────
    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.5;

    // Find nearest peak to current price
    const nearestPeak = findNearestPeak(peaks, currentPrice, pocPrice);
    const distToPoc = Math.abs(currentPrice - pocPrice);
    const distToNearest = nearestPeak
      ? Math.abs(currentPrice - nearestPeak.price)
      : Infinity;

    const nearPoc = distToPoc < range * 2;
    const nearPeak = distToNearest < range * 2;

    // Determine which bin the current price is in
    const currentBin = Math.min(
      Math.floor((currentPrice - bot) / step),
      NUM_BINS - 1,
    );
    const localBullRatio = currentBin >= 0 ? colorArray[currentBin] : 0.5;

    if (nearPoc || nearPeak) {
      const activeLevel = nearPoc ? pocPrice : nearestPeak!.price;
      const activeDist = nearPoc ? distToPoc : distToNearest;
      const activeVolume = nearPoc
        ? maxSmoothed
        : nearestPeak!.volume;
      const volumeStrength =
        maxSmoothed > 0 ? activeVolume / maxSmoothed : 0;

      // Price below high-volume level = support (buy zone)
      // Price above high-volume level = resistance (sell zone)
      const priceRelative = currentPrice - activeLevel;

      if (priceRelative <= 0 && (isBullish || localBullRatio > 0.5)) {
        // At or below volume node + bullish = buy
        signal = 'buy';
        const proximity = 1 - Math.min(activeDist / (range * 2), 1);
        confidence =
          0.5 +
          volumeStrength * 0.15 +
          proximity * 0.15 +
          (bullRatio - 0.5) * 0.3;
      } else if (
        priceRelative >= 0 &&
        (!isBullish || localBullRatio < 0.5)
      ) {
        // At or above volume node + bearish = sell
        signal = 'sell';
        const proximity = 1 - Math.min(activeDist / (range * 2), 1);
        confidence =
          0.5 +
          volumeStrength * 0.15 +
          proximity * 0.15 +
          (0.5 - bullRatio) * 0.3;
      }

      // Mean score boost — higher t-dist probability = more reliable
      if (signal !== 'neutral' && pocMeanScore > 0) {
        confidence += Math.min(pocMeanScore * 0.1, 0.05);
      }
    }

    return {
      signal,
      confidence: clamp(confidence, 0, 1),
      values: {
        poc: round(pocPrice),
        pocVolume: round(maxSmoothed),
        pocMeanScore: round(pocMeanScore * 100),
        bullRatio: round(bullRatio),
        peakCount: peaks.length,
        nearestPeakPrice: nearestPeak ? round(nearestPeak.price) : 0,
        nearestPeakDist: round(nearPeak ? distToNearest : 0),
        distToPoc: round(distToPoc),
        rangeHigh: round(top),
        rangeLow: round(bot),
        localBullRatio: round(localBullRatio),
      },
      metadata: {
        peaks: peaks.map((p) => ({
          price: round(p.price),
          volume: round(p.volume),
        })),
        nearPoc,
        effectiveLookback,
      },
    };
  }
}

// ─── Volume Distribution ─────────────────────────────────────

/**
 * Proportionally distribute volume based on how much of the
 * candle body intersects the price bin [a, b].
 * Matches Pine Script get_vol() exactly.
 */
function getVolumeProportion(
  a: number,
  b: number,
  low: number,
  high: number,
  volume: number,
): number {
  // Bar completely below or above the range
  if (high < a || low > b) return 0;

  // Entire bar inside range but doesn't span it
  if (low >= a && high <= b) {
    const pRange = b - a > 0 ? ((high - low) / (b - a)) * volume : 0;
    return pRange;
  }

  // Bar completely covers the range
  if (low <= a && high >= b) {
    const pBar = high - low > 0 ? ((b - a) / (high - low)) * volume : volume;
    return pBar;
  }

  // Top of bar inside range
  if (low < a && high <= b) {
    const pBar = high - low > 0 ? ((high - a) / (high - low)) * volume : 0;
    return pBar;
  }

  // Bottom of bar inside range
  if (low >= a && high > b) {
    const pBar = high - low > 0 ? ((b - low) / (high - low)) * volume : 0;
    return pBar;
  }

  return volume;
}

// ─── Sinc Kernel Smoothing ───────────────────────────────────

/**
 * Sinc (Lanczos) kernel regression for smoothing volume profile.
 * Translates Pine's multi_kernel_regression using sinc + Hamming window.
 */
function sincKernelSmooth(source: number[], bandwidth: number): number[] {
  const n = source.length;
  const result = new Array(n);

  for (let i = 0; i < n; i++) {
    let sum = 0;
    let sumw = 0;
    for (let j = 0; j < n; j++) {
      const diff = i - j;
      const weight = sinc(diff, bandwidth);
      sum += source[j] * weight;
      sumw += weight;
    }
    result[i] = sumw > 0 ? Math.max(sum / sumw, 0) : 0;
  }

  return result;
}

function sinc(x: number, bandwidth: number): number {
  if (x === 0) return 1;
  const v = (Math.PI * x) / bandwidth;
  return Math.sin(v) / v;
}

// ─── Peak Detection ──────────────────────────────────────────

interface VolumePeak {
  price: number;
  volume: number;
  binIdx: number;
}

/**
 * Find local maxima in the smoothed volume profile.
 * Matches Pine's peak detection logic with sensitivity check.
 */
function findPeaks(
  volumes: number[],
  levels: number[],
  sensitivity: number,
  threshold: number,
  range: number,
): VolumePeak[] {
  const peaks: VolumePeak[] = [];
  const n = volumes.length;

  for (let i = 0; i < n; i++) {
    const val = volumes[i];
    if (val < threshold) continue;

    // Check if this is a local maximum within sensitivity window
    let isPeak = true;
    for (let j = 1; j <= sensitivity; j++) {
      const left = i - j >= 0 ? volumes[i - j] : 0;
      const right = i + j < n ? volumes[i + j] : 0;
      if (val < left || val < right) {
        isPeak = false;
        break;
      }
    }

    if (!isPeak) continue;

    const price =
      (levels[i] + levels[Math.min(i + 1, levels.length - 1)]) / 2;

    // Check if too close to existing peak
    let tooClose = false;
    for (const existing of peaks) {
      if (Math.abs(price - existing.price) < range * 2) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
      peaks.push({ price, volume: val, binIdx: i });
    }
  }

  return peaks.sort((a, b) => b.volume - a.volume);
}

function findNearestPeak(
  peaks: VolumePeak[],
  price: number,
  pocPrice: number,
): VolumePeak | null {
  if (peaks.length === 0) return null;

  let nearest: VolumePeak | null = null;
  let minDist = Infinity;

  for (const peak of peaks) {
    // Skip the main POC — we handle it separately
    if (Math.abs(peak.price - pocPrice) < 0.001) continue;
    const dist = Math.abs(price - peak.price);
    if (dist < minDist) {
      minDist = dist;
      nearest = peak;
    }
  }

  return nearest;
}

// ─── Gamma + t-Distribution ──────────────────────────────────

/** Lanczos approximation of the Gamma function */
function gamma(z: number): number {
  if (z < 0.5) {
    let s = GAMMA_DK[0];
    for (let i = 1; i <= GAMMA_N; i++) {
      s += GAMMA_DK[i] / (i - z);
    }
    return (
      (Math.PI / Math.sin(Math.PI * z)) *
      s *
      TWO_SQRT_E_OVER_PI *
      Math.pow((0.5 - z + GAMMA_R) / Math.E, 0.5 - z)
    );
  } else {
    let s = GAMMA_DK[0];
    for (let i = 1; i <= GAMMA_N; i++) {
      s += GAMMA_DK[i] / (z + i - 1.0);
    }
    return (
      s *
      TWO_SQRT_E_OVER_PI *
      Math.pow((z - 0.5 + GAMMA_R) / Math.E, z - 0.5)
    );
  }
}

/** Student's t-distribution PDF */
function tDistPdf(x: number, v: number): number {
  if (v <= 0) return 0;
  return (
    (gamma((v + 1) / 2) / (Math.sqrt(v * Math.PI) * gamma(v / 2))) *
    Math.pow(1 + (x * x) / v, -(v + 1) / 2)
  );
}

// ─── Mean Score Calculation ──────────────────────────────────

/**
 * Compute SMA and prediction interval offset using
 * t-distribution confidence intervals (99% level).
 */
function computeMeanScore(
  candles: OHLCV[],
  length: number,
): { mean: number; offset: number } {
  const len = candles.length;
  if (len < length + 1) return { mean: 0, offset: 0 };

  // SMA of closes
  const closes = candles.slice(len - length).map((c) => c.close);
  const mean = closes.reduce((s, v) => s + v, 0) / length;

  // Squared differences using open (matches Pine: math.pow(open - mean, 2))
  const opens = candles.slice(len - length).map((c) => c.open);
  const squaredDiffs = opens.map((o) => (o - mean) ** 2);
  const sumSquares = squaredDiffs.reduce((s, v) => s + v, 0);
  const mse = sumSquares / (length - 1);
  const rmse = Math.sqrt(mse);

  // t-value for 99% CI via bisection (matches Pine's while loop)
  const p = (1 - 0.99) / 2;
  const tValue = Math.abs(tInvApprox(p, length - 1));

  // Root standard error for the latest point
  const latestSquaredDiff = squaredDiffs[squaredDiffs.length - 1] || 0;
  const rootStdErr = Math.sqrt(
    1 + 1 / length + (sumSquares > 0 ? latestSquaredDiff / sumSquares : 0),
  );

  const offset = tValue * rmse * rootStdErr;
  return { mean, offset };
}

/**
 * Approximate inverse t-distribution CDF via bisection.
 * Finds t where CDF(t, df) ≈ p.
 */
function tInvApprox(p: number, df: number): number {
  let lower = -100;
  let upper = 100;
  let mid = (lower + upper) / 2;

  for (let iter = 0; iter < 100; iter++) {
    const cdf = tDistCdf(mid, df);
    if (Math.abs(cdf - p) < 0.000001) break;
    if (cdf > p) upper = mid;
    else lower = mid;
    mid = (lower + upper) / 2;
  }

  return mid;
}

/** Student's t-distribution CDF (simplified 2-term hypergeometric) */
function tDistCdf(x: number, v: number): number {
  return (
    0.5 +
    x *
      gamma((v + 1) / 2) *
      (hypergeometric(0.5, (v + 1) / 2, 1.5, (x * x) / v) /
        (Math.sqrt(v * Math.PI) * gamma(v / 2)))
  );
}

/** Rising factorial: c * (c+1) * ... * (c+n-1) */
function risingFactorial(c: number, n: number): number {
  let product = 1.0;
  for (let i = 0; i < n; i++) {
    product *= c + i;
  }
  return product;
}

/** Hypergeometric 2F1 — 3-term approximation (matches Pine) */
function hypergeometric(
  a: number,
  b: number,
  c: number,
  z: number,
): number {
  let sum = 0;
  for (let i = 0; i <= 2; i++) {
    sum +=
      (risingFactorial(a, i) *
        risingFactorial(b, i) *
        Math.pow(z, i)) /
      (risingFactorial(c, i) * risingFactorial(i, i));
  }
  return sum;
}

// ─── Helpers ─────────────────────────────────────────────────

function neutral(
  confidence: number,
  values: Record<string, number>,
): IndicatorOutput {
  return { signal: 'neutral', confidence, values };
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
