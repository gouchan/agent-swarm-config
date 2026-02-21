/**
 * Fibonacci Levels with Volume Profile (FIVP) Indicator
 *
 * Translated from: "Fibo Levels with Volume Profile [ChartPrime]" (Pine Script v5)
 * Original by ChartPrime, MPL-2.0 license
 *
 * Combines pivot-point Fibonacci levels with volume distribution:
 * 1. Higher-timeframe pivot point (PP) from previous period H/L/C
 * 2. Six Fibonacci extensions: ±0.382, ±0.618, ±1.000
 * 3. Volume profile across levels — finds Point of Control (POC)
 * 4. Bull vs Bear volume ratio for directional bias
 * 5. Target projection based on price position + volume bias
 *
 * Signal logic:
 *   BUY  = price below midpoint + bullish volume dominance + near fibo support
 *   SELL = price above midpoint + bearish volume dominance + near fibo resistance
 *   Confidence scales with volume ratio and proximity to fibo level
 */

import type {
  Indicator,
  IndicatorConfig,
  IndicatorInput,
  IndicatorOutput,
  OHLCV,
} from '../types.js';

// ─── Config ──────────────────────────────────────────────────

export class FiboVolumeProfileIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'fibo-volume-profile',
    description:
      'Fibonacci pivot levels with volume profile and directional targets',
    defaultParams: {
      htfPeriod: 96,    // Higher timeframe approximation in candles (e.g., 96 × 15m = 1 day)
      volumeLevels: 12, // Number of volume profile bins
      atrLength: 30,
      atrMult: 0.3,
    },
    timeframe: '15m',
    minCandles: 100,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const { htfPeriod, volumeLevels, atrLength, atrMult } = params;
    const len = candles.length;

    if (len < htfPeriod + 10) {
      return neutral(0, {});
    }

    // ── 1. Higher-timeframe H/L/C from previous period ──────
    // Simulate request.security(TIME, high[1]) by looking at
    // the previous htfPeriod candles (not the current period)
    const prevPeriodEnd = len - 1;
    const prevPeriodStart = Math.max(0, prevPeriodEnd - htfPeriod);
    const currentPeriodStart = Math.max(0, prevPeriodEnd - Math.floor(htfPeriod / 2));

    // Previous period = candles from [start..start+htfPeriod]
    const ppCandles = candles.slice(prevPeriodStart, currentPeriodStart);
    if (ppCandles.length < 10) {
      return neutral(0, {});
    }

    let FH = -Infinity;
    let FL = Infinity;
    let FC = ppCandles[ppCandles.length - 1].close;

    for (const c of ppCandles) {
      if (c.high > FH) FH = c.high;
      if (c.low < FL) FL = c.low;
    }

    // ── 2. ATR band for zone thickness ──────────────────────
    const atr = simpleATR(candles, atrLength);
    const currentPrice = candles[len - 1].close;
    const percBand = currentPrice * (0.3 / 100);
    const band = Math.min(atr * atrMult, percBand) / 2;

    FH += band;
    FL -= band;
    FC += band;

    // ── 3. Pivot Point + Fibonacci levels ───────────────────
    const PP = (FH + FL + FC) / 3;
    const range = FH - FL;

    const fiboLevels = {
      r382: PP + 0.382 * range,   // Fibo[0] — resistance
      s382: PP - 0.382 * range,   // Fibo[1] — support
      r618: PP + 0.618 * range,   // Fibo[2] — resistance
      s618: PP - 0.618 * range,   // Fibo[3] — support
      r100: PP + 1.0 * range,     // Fibo[4] — top
      s100: PP - 1.0 * range,     // Fibo[5] — bottom
    };

    const FT = fiboLevels.r100; // Fibo top
    const FB = fiboLevels.s100; // Fibo bottom
    const MID = (FT + FB) / 2;

    // ── 4. Volume profile across levels ─────────────────────
    const step = (FT - FB) / volumeLevels;
    const levelCounts = new Array(volumeLevels).fill(0);
    const levelVolumes = new Array(volumeLevels).fill(0);
    const bullVolumes = new Array(volumeLevels).fill(0);
    const bearVolumes = new Array(volumeLevels).fill(0);

    let totalBullVolume = 0;
    let totalBearVolume = 0;
    let totalVolume = 0;

    // Analyze candles in the current higher-timeframe period
    const analysisCandles = candles.slice(currentPeriodStart);

    for (const c of analysisCandles) {
      const isBull = c.close > c.open;
      totalVolume += c.volume;
      if (isBull) totalBullVolume += c.volume;
      else totalBearVolume += c.volume;

      // Bin the close price into volume levels
      for (let x = 0; x < volumeLevels; x++) {
        const levelBottom = FB + step * x;
        const levelTop = FB + step * (x + 1);
        if (c.close >= levelBottom && c.close < levelTop) {
          levelCounts[x]++;
          levelVolumes[x] += c.volume;
          if (isBull) bullVolumes[x] += c.volume;
          else bearVolumes[x] += c.volume;
          break;
        }
      }
    }

    // ── 5. Find POC (Point of Control) ──────────────────────
    let pocIdx = 0;
    let pocVolume = 0;
    for (let i = 0; i < volumeLevels; i++) {
      if (levelVolumes[i] > pocVolume) {
        pocVolume = levelVolumes[i];
        pocIdx = i;
      }
    }
    const pocPrice = FB + step * pocIdx + step / 2;

    // ── 6. Bull/Bear volume ratio ───────────────────────────
    const bullRatio = totalVolume > 0 ? totalBullVolume / totalVolume : 0.5;
    const bearRatio = totalVolume > 0 ? totalBearVolume / totalVolume : 0.5;
    const isBullishVolume = bullRatio > bearRatio;

    // ── 7. Generate signal ──────────────────────────────────
    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.5;
    let target = 0;

    const priceInRange = currentPrice < FT && currentPrice > FB;

    if (priceInRange) {
      const aboveMid = currentPrice > MID;

      if (isBullishVolume) {
        // Bullish volume dominance
        if (aboveMid) {
          // Price above mid + bullish → target r618
          signal = 'buy';
          target = fiboLevels.r618;
          confidence = calcConfidence(
            currentPrice, fiboLevels.s382, fiboLevels.r618,
            bullRatio, 'buy',
          );
        } else {
          // Price below mid + bullish → target r382
          signal = 'buy';
          target = fiboLevels.r382;
          confidence = calcConfidence(
            currentPrice, fiboLevels.s618, fiboLevels.r382,
            bullRatio, 'buy',
          );
        }
      } else {
        // Bearish volume dominance
        if (aboveMid) {
          // Price above mid + bearish → target s382
          signal = 'sell';
          target = fiboLevels.s382;
          confidence = calcConfidence(
            currentPrice, fiboLevels.r382, fiboLevels.s382,
            bearRatio, 'sell',
          );
        } else {
          // Price below mid + bearish → target s618
          signal = 'sell';
          target = fiboLevels.s618;
          confidence = calcConfidence(
            currentPrice, fiboLevels.r618, fiboLevels.s618,
            bearRatio, 'sell',
          );
        }
      }
    }

    // ── 8. Proximity boost — near a fibo level = stronger ───
    const nearestFiboDistance = findNearestFiboDistance(
      currentPrice,
      fiboLevels,
    );
    const fiboProximityBoost =
      nearestFiboDistance < band * 2
        ? 0.1 * (1 - nearestFiboDistance / (band * 2))
        : 0;

    if (signal !== 'neutral') {
      confidence = clamp(confidence + fiboProximityBoost, 0, 1);
    }

    // ── 9. POC proximity — price at POC has strong support ──
    const pocDistance = Math.abs(currentPrice - pocPrice);
    const nearPOC = pocDistance < step;

    return {
      signal,
      confidence: clamp(confidence, 0, 1),
      values: {
        pp: round(PP),
        r382: round(fiboLevels.r382),
        s382: round(fiboLevels.s382),
        r618: round(fiboLevels.r618),
        s618: round(fiboLevels.s618),
        r100: round(fiboLevels.r100),
        s100: round(fiboLevels.s100),
        mid: round(MID),
        poc: round(pocPrice),
        pocVolume: round(pocVolume),
        bullRatio: round(bullRatio),
        bearRatio: round(bearRatio),
        target: round(target),
        nearPOC: nearPOC ? 1 : 0,
      },
      metadata: {
        fiboRange: round(range),
        priceInRange,
        isBullishVolume,
        volumeLevelCount: volumeLevels,
        analysisCandles: analysisCandles.length,
      },
    };
  }
}

// ─── Confidence Calculator ───────────────────────────────────

/**
 * Confidence based on:
 * - Volume ratio strength (how dominant is bull/bear volume)
 * - Position relative to entry and target (reward potential)
 */
function calcConfidence(
  price: number,
  entryLevel: number,
  targetLevel: number,
  volumeRatio: number,
  direction: 'buy' | 'sell',
): number {
  // Volume ratio component: 0.5 ratio = neutral, 0.7+ = strong
  const volumeStrength = (volumeRatio - 0.5) * 2; // 0 at 50%, 1 at 100%

  // Reward potential: how much room to target vs range
  const totalRange = Math.abs(targetLevel - entryLevel);
  const remaining =
    direction === 'buy'
      ? targetLevel - price
      : price - targetLevel;
  const rewardPct = totalRange > 0 ? clamp(remaining / totalRange, 0, 1) : 0;

  // Base confidence + volume strength + reward potential
  return clamp(0.45 + volumeStrength * 0.25 + rewardPct * 0.2, 0.3, 0.95);
}

// ─── Simple ATR (avoids circular import) ─────────────────────

function simpleATR(candles: OHLCV[], period: number): number {
  if (candles.length < period + 1) return 0;
  let atr = 0;
  for (let i = candles.length - period; i < candles.length; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close),
    );
    atr += tr;
  }
  return atr / period;
}

// ─── Helpers ─────────────────────────────────────────────────

function findNearestFiboDistance(
  price: number,
  levels: Record<string, number>,
): number {
  let minDist = Infinity;
  for (const level of Object.values(levels)) {
    const dist = Math.abs(price - level);
    if (dist < minDist) minDist = dist;
  }
  return minDist;
}

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
