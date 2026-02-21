/**
 * Momentum Ghost Machine Indicator
 *
 * Translated from: "Momentum Ghost Machine [ChartPrime]" (Pine Script v5)
 * Original by ChartPrime, MPL-2.0 license
 *
 * A sinc-kernel (Lanczos/windowed) smoothed momentum oscillator:
 * 1. LTI sinc filter: convolves price with windowed-sinc (Blackman) coefficients
 *    to extract a noise-free trend baseline
 * 2. Momentum delta: (price - sinc) / offset, then post-smoothed with WMA
 * 3. Signal MA: smoothed momentum via configurable MA (EMA/DEMA/TEMA/WMA/SMA)
 * 4. Convergence/Divergence: delta - MA (like MACD histogram but from sinc momentum)
 * 5. Ghost projection: extrapolates 2 bars forward using velocity averaging
 *
 * Signal logic:
 *   BUY  = momentum positive + CD rising + projection bullish
 *   SELL = momentum negative + CD falling + projection bearish
 *   Confidence = CD strength × momentum magnitude × projection alignment
 */

import type {
  Indicator,
  IndicatorConfig,
  IndicatorInput,
  IndicatorOutput,
  OHLCV,
} from '../types.js';

// ─── Config ──────────────────────────────────────────────────

export class MomentumGhostIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'momentum-ghost',
    description:
      'Momentum Ghost Machine — sinc-kernel momentum with CD histogram and ghost projection',
    defaultParams: {
      momentumLength: 50,
      momentumSmoothing: 50,
      postSmoothing: 4,
      maLength: 24,
    },
    timeframe: '15m',
    minCandles: 120,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const { momentumLength, momentumSmoothing, postSmoothing, maLength } =
      params;
    const len = candles.length;
    const lengthCorrection = momentumLength * 2;
    const sincOffset = Math.floor((lengthCorrection - 1) / 2);

    if (len < lengthCorrection + maLength + 10) {
      return neutral({});
    }

    // ── 1. Compute sinc coefficients (once per param set) ───
    const coefficients = sincCoefficients(lengthCorrection, momentumSmoothing);
    const coeffSum = coefficients.reduce((s, v) => s + v, 0);

    // ── 2. Compute momentum delta for recent history ────────
    // We need enough delta values for the MA calculation
    const historyNeeded = maLength + postSmoothing + 10;
    const deltaValues: number[] = [];

    for (let t = len - historyNeeded; t < len; t++) {
      if (t < lengthCorrection) {
        deltaValues.push(0);
        continue;
      }

      // Gather data window for sinc convolution
      const data: number[] = [];
      for (let i = 0; i < lengthCorrection; i++) {
        data.push(candles[t - i].close);
      }

      // Convolve: toeplitz valid convolution → first row result
      const sinc = convolve(data, coefficients, coeffSum);
      const rawDelta = sincOffset > 0 ? (candles[t].close - sinc) / sincOffset : 0;
      deltaValues.push(rawDelta);
    }

    // ── 3. Post-smooth the delta with WMA ───────────────────
    const smoothedDelta = wmaSmooth(deltaValues, postSmoothing);

    // ── 4. Signal MA: EMA of smoothed delta ─────────────────
    // Double smooth: first EMA(2), then EMA(maLength) — matches Pine's filter(filter(delta,2,ma),ma_length,ma)
    const preSmoothed = emaSmooth(smoothedDelta, 2);
    const maValues = emaSmooth(preSmoothed, maLength);

    // ── 5. Convergence/Divergence histogram ─────────────────
    const cdValues: number[] = [];
    for (let i = 0; i < smoothedDelta.length; i++) {
      cdValues.push(smoothedDelta[i] - maValues[i]);
    }

    // ── 6. Ghost projection ─────────────────────────────────
    const n = smoothedDelta.length;
    const delta = smoothedDelta[n - 1];
    const deltaPrev1 = smoothedDelta[n - 2];
    const deltaPrev2 = smoothedDelta[n - 3];
    const ma = maValues[n - 1];
    const maPrev1 = maValues[n - 2];
    const maPrev2 = maValues[n - 3];
    const momo = cdValues[n - 1];
    const momoPrev = cdValues[n - 2];

    // Projection velocity (averaged over 1 and 2 bar momentum)
    const deltaProjection = (delta - deltaPrev1 + (delta - deltaPrev2) / 2) / 2;
    const maProjection = (ma - maPrev1 + (ma - maPrev2) / 2) / 2;

    const projDelta1 = delta + deltaProjection;
    const projDelta2 = delta + deltaProjection * 2;
    const projMa1 = ma + maProjection;
    const projMa2 = ma + maProjection * 2;

    const projCD1 = projDelta1 - projMa1;
    const projCD2 = projDelta2 - projMa2;

    // ── 7. CD coloring state (matches Pine exactly) ─────────
    let cdState: 'bullish_rising' | 'bullish_falling' | 'bearish_falling' | 'bearish_rising';
    if (momo > 0) {
      cdState = momo > momoPrev ? 'bullish_rising' : 'bullish_falling';
    } else {
      cdState = momo < momoPrev ? 'bearish_falling' : 'bearish_rising';
    }

    // Projected CD states
    let projState1: string;
    if (projCD1 > 0) {
      projState1 = projCD1 > momo ? 'bullish_rising' : 'bullish_falling';
    } else {
      projState1 = projCD1 < momo ? 'bearish_falling' : 'bearish_rising';
    }

    // ── 8. Generate signal ──────────────────────────────────
    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.5;

    // Normalize delta and momo for confidence scoring
    const recentDeltas = smoothedDelta.slice(-30);
    const maxAbsDelta = Math.max(...recentDeltas.map(Math.abs), 0.0001);
    const deltaNorm = Math.abs(delta) / maxAbsDelta;

    const recentMomo = cdValues.slice(-30);
    const maxAbsMomo = Math.max(...recentMomo.map(Math.abs), 0.0001);
    const momoNorm = Math.abs(momo) / maxAbsMomo;

    // Signal conditions
    const momentumBullish = delta > 0;
    const momentumRising = delta > deltaPrev1;
    const cdBullish = momo > 0;
    const cdRising = momo > momoPrev;
    const projectionBullish = projCD1 > momo && projCD2 > projCD1;
    const projectionBearish = projCD1 < momo && projCD2 < projCD1;

    // Cross detection: momentum crossing above/below MA
    const crossAbove = delta > ma && deltaPrev1 <= maPrev1;
    const crossBelow = delta < ma && deltaPrev1 >= maPrev1;

    // Strong buy: momentum positive + CD rising + projection confirms
    if (momentumBullish && cdBullish && cdRising) {
      signal = 'buy';
      confidence = 0.55 + deltaNorm * 0.15 + momoNorm * 0.1;
      if (projectionBullish) confidence += 0.1;
      if (crossAbove) confidence += 0.05;
    }
    // Moderate buy: momentum turning positive or CD turning bullish
    else if (momentumBullish && cdRising) {
      signal = 'buy';
      confidence = 0.5 + deltaNorm * 0.1 + momoNorm * 0.05;
      if (projectionBullish) confidence += 0.05;
    }
    // Cross above = fresh buy signal
    else if (crossAbove) {
      signal = 'buy';
      confidence = 0.55 + deltaNorm * 0.1;
      if (projectionBullish) confidence += 0.1;
    }
    // Strong sell: momentum negative + CD falling + projection confirms
    else if (!momentumBullish && !cdBullish && !cdRising) {
      signal = 'sell';
      confidence = 0.55 + deltaNorm * 0.15 + momoNorm * 0.1;
      if (projectionBearish) confidence += 0.1;
      if (crossBelow) confidence += 0.05;
    }
    // Moderate sell
    else if (!momentumBullish && !cdRising) {
      signal = 'sell';
      confidence = 0.5 + deltaNorm * 0.1 + momoNorm * 0.05;
      if (projectionBearish) confidence += 0.05;
    }
    // Cross below = fresh sell signal
    else if (crossBelow) {
      signal = 'sell';
      confidence = 0.55 + deltaNorm * 0.1;
      if (projectionBearish) confidence += 0.1;
    }

    return {
      signal,
      confidence: clamp(confidence, 0, 1),
      values: {
        delta: round(delta),
        ma: round(ma),
        momo: round(momo),
        momoPrev: round(momoPrev),
        projDelta1: round(projDelta1),
        projDelta2: round(projDelta2),
        projMA1: round(projMa1),
        projMA2: round(projMa2),
        projCD1: round(projCD1),
        projCD2: round(projCD2),
        deltaNorm: round(deltaNorm),
        momoNorm: round(momoNorm),
      },
      metadata: {
        cdState,
        projectedState: projState1,
        momentumBullish,
        cdBullish,
        crossAbove,
        crossBelow,
        projectionBullish,
        projectionBearish,
      },
    };
  }
}

// ─── Sinc Filter (LTI) ──────────────────────────────────────

/**
 * Blackman window function.
 * w(n) = 0.42 - 0.5·cos(2πn/(N-1)) + 0.08·cos(4πn/(N-1))
 */
function blackman(n: number, N: number): number {
  return (
    0.42 -
    0.5 * Math.cos((2 * Math.PI * n) / (N - 1)) +
    0.08 * Math.cos((4 * Math.PI * n) / (N - 1))
  );
}

/**
 * sinc(x) = sin(πx) / (πx), sinc(0) = 1
 */
function sinc(x: number): number {
  if (x === 0) return 1;
  const pix = Math.PI * x;
  return Math.sin(pix) / pix;
}

/**
 * Compute windowed-sinc filter coefficients.
 * Matches Pine's sinc_coefficients() exactly.
 */
function sincCoefficients(length: number, fc: number): number[] {
  const coefficients: number[] = [];
  const mid = Math.floor((length - 1) / 2);
  const cutoff = 1 / fc;
  const isEven = length % 2 === 0;

  for (let i = 0; i < length; i++) {
    const n = i - mid;
    const k = i;
    const window = isEven ? blackman(k + 0.5, length) : blackman(k, length);
    coefficients.push(sinc(2 * cutoff * n) * window);
  }

  return coefficients;
}

/**
 * Valid convolution: convolves data with coefficients.
 * Equivalent to Pine's toeplitz matrix multiplication (first row only).
 * data is in reverse chronological order (newest first).
 */
function convolve(
  data: number[],
  coefficients: number[],
  coeffSum: number,
): number {
  const N = coefficients.length;
  let sum = 0;

  for (let c = 0; c < N && c < data.length; c++) {
    sum += data[c] * coefficients[c];
  }

  return coeffSum !== 0 ? sum / coeffSum : 0;
}

// ─── Smoothing Functions ─────────────────────────────────────

/**
 * EMA smooth over an array of values.
 */
function emaSmooth(values: number[], length: number): number[] {
  const alpha = 2.0 / (length + 1);
  const result: number[] = [values[0]];

  for (let i = 1; i < values.length; i++) {
    result.push(alpha * values[i] + (1 - alpha) * result[i - 1]);
  }

  return result;
}

/**
 * WMA smooth over an array of values.
 */
function wmaSmooth(values: number[], length: number): number[] {
  const result: number[] = [];
  const weightSum = (length * (length + 1)) / 2;

  for (let i = 0; i < values.length; i++) {
    if (i < length - 1) {
      // Not enough data, use simple average of available
      let sum = 0;
      let ws = 0;
      for (let j = 0; j <= i; j++) {
        const w = i - j + 1;
        sum += values[j] * w;
        ws += w;
      }
      result.push(ws > 0 ? sum / ws : values[i]);
    } else {
      let sum = 0;
      for (let j = 0; j < length; j++) {
        sum += values[i - j] * (length - j);
      }
      result.push(sum / weightSum);
    }
  }

  return result;
}

// ─── Helpers ─────────────────────────────────────────────────

function neutral(values: Record<string, number>): IndicatorOutput {
  return { signal: 'neutral', confidence: 0.5, values };
}

function round(n: number): number {
  return Math.round(n * 100000) / 100000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
