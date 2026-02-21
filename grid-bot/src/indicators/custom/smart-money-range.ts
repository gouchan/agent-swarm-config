/**
 * Smart Money Range (SMR) Indicator
 *
 * Translated from: "Smart Money Range [ChartPrime]" (Pine Script v5)
 * Original by ChartPrime, MPL-2.0 license
 *
 * Detects institutional support/resistance zones using:
 * 1. Pivot highs/lows to define the active price range
 * 2. Touch-count scoring at each level (how many times price
 *    tested a level and held = stronger S/R)
 * 3. ATR-based zone thickness for fuzzy matching
 *
 * Signal logic (not in original — added for grid-bot):
 *   BUY  = price in support zone + bullish rejection candle
 *   SELL = price in resistance zone + bearish rejection candle
 *   Confidence scales with touch count and proximity to zone center
 */

import type {
  Indicator,
  IndicatorConfig,
  IndicatorInput,
  IndicatorOutput,
  OHLCV,
} from '../types.js';
import { calculateATR } from '../built-in/atr.js';

// ─── Config ──────────────────────────────────────────────────

export class SmartMoneyRangeIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'smart-money-range',
    description:
      'Smart Money Range — pivot-based S/R zones with touch-count scoring',
    defaultParams: {
      pivotPeriod: 30,
      volumeLevels: 24,
      atrLength: 30,
      atrMult: 0.3,
      percentFallback: 10,
      lookback: 500,
    },
    timeframe: '15m',
    minCandles: 80,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const {
      pivotPeriod,
      volumeLevels,
      atrLength,
      atrMult,
      percentFallback,
      lookback,
    } = params;

    const len = candles.length;
    if (len < pivotPeriod * 2 + 1) {
      return neutral(0, {});
    }

    // ── 1. Find pivots ─────────────────────────────────────
    const { pivotHigh, pivotHighIdx, pivotLow, pivotLowIdx } =
      findPivots(candles, pivotPeriod);

    if (pivotHigh === null || pivotLow === null) {
      return neutral(0, {});
    }

    // ── 2. Define range from last pivot high to now ─────────
    const rangeStart = Math.max(0, pivotHighIdx);
    const rangeCandles = candles.slice(rangeStart);

    if (rangeCandles.length < 5) {
      return neutral(0, {});
    }

    let highestHigh = -Infinity;
    let lowestLow = Infinity;

    for (const c of rangeCandles) {
      if (c.high > highestHigh) highestHigh = c.high;
      if (c.low < lowestLow) lowestLow = c.low;
    }

    if (highestHigh <= lowestLow) {
      return neutral(0, {});
    }

    // ── 3. Calculate zone thickness (band) ──────────────────
    // Pine: math.min(ta.atr(30) * 0.3, close * (10/100)) [20] / 2
    const atr = calculateATR(candles, atrLength);
    const currentPrice = candles[len - 1].close;
    const atrBand = atr * atrMult;
    const pctBand = currentPrice * (percentFallback / 100);
    const band = Math.min(atrBand, pctBand) / 2;

    // ── 4. Build levels and count touches ───────────────────
    const step = (highestHigh - lowestLow) / volumeLevels;
    const levels: LevelScore[] = [];

    // Limit lookback to avoid O(n^2) explosion
    const maxLookback = Math.min(lookback, len - 1);

    for (let i = 0; i < volumeLevels; i++) {
      const price = lowestLow + step * i + step / 2; // center of level
      const supportTouches = countTouches(candles, price, maxLookback, true);
      const resistanceTouches = countTouches(candles, price, maxLookback, false);

      levels.push({
        price,
        supportScore: supportTouches,
        resistanceScore: resistanceTouches,
        netScore: supportTouches - resistanceTouches,
      });
    }

    // ── 5. Identify support and resistance zones ────────────
    const supportZone = findStrongestZone(levels, lowestLow, step, 'support');
    const resistanceZone = findStrongestZone(
      levels,
      lowestLow,
      step,
      'resistance',
    );

    const maxTouches = Math.max(
      ...levels.map((l) => Math.max(l.supportScore, l.resistanceScore)),
      1,
    );

    // ── 6. Generate signal ──────────────────────────────────
    const current = candles[len - 1];
    const prev = candles[len - 2];

    const inSupportZone =
      supportZone !== null &&
      current.close >= supportZone.price - band &&
      current.close <= supportZone.price + band;

    const inResistanceZone =
      resistanceZone !== null &&
      current.close >= resistanceZone.price - band &&
      current.close <= resistanceZone.price + band;

    // Rejection candle detection (wicks)
    const bodySize = Math.abs(current.close - current.open);
    const totalRange = current.high - current.low;
    const lowerWick = Math.min(current.open, current.close) - current.low;
    const upperWick = current.high - Math.max(current.open, current.close);
    const isBullishRejection =
      totalRange > 0 && lowerWick / totalRange > 0.5 && current.close > current.open;
    const isBearishRejection =
      totalRange > 0 && upperWick / totalRange > 0.5 && current.close < current.open;

    // Price bouncing off zone (tested below then closed above for support)
    const supportBounce =
      supportZone !== null &&
      prev.low < supportZone.price &&
      current.close > supportZone.price;
    const resistanceBounce =
      resistanceZone !== null &&
      prev.high > resistanceZone.price &&
      current.close < resistanceZone.price;

    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.5;

    if (inSupportZone && (isBullishRejection || supportBounce)) {
      signal = 'buy';
      const touchNorm = supportZone!.supportScore / maxTouches;
      const proximity =
        band > 0
          ? 1 - Math.abs(current.close - supportZone!.price) / band
          : 0.5;
      confidence = 0.55 + touchNorm * 0.25 + proximity * 0.15;
    } else if (
      inResistanceZone &&
      (isBearishRejection || resistanceBounce)
    ) {
      signal = 'sell';
      const touchNorm = resistanceZone!.resistanceScore / maxTouches;
      const proximity =
        band > 0
          ? 1 - Math.abs(current.close - resistanceZone!.price) / band
          : 0.5;
      confidence = 0.55 + touchNorm * 0.25 + proximity * 0.15;
    } else if (inSupportZone) {
      // In zone but no rejection candle yet — weak buy bias
      signal = 'buy';
      const touchNorm = supportZone!.supportScore / maxTouches;
      confidence = 0.45 + touchNorm * 0.15;
    } else if (inResistanceZone) {
      // In zone but no rejection candle yet — weak sell bias
      signal = 'sell';
      const touchNorm = resistanceZone!.resistanceScore / maxTouches;
      confidence = 0.45 + touchNorm * 0.15;
    }

    return {
      signal,
      confidence: clamp(confidence, 0, 1),
      values: {
        pivotHigh: round(pivotHigh),
        pivotLow: round(pivotLow),
        highestHigh: round(highestHigh),
        lowestLow: round(lowestLow),
        supportPrice: supportZone ? round(supportZone.price) : 0,
        supportScore: supportZone?.supportScore ?? 0,
        resistancePrice: resistanceZone ? round(resistanceZone.price) : 0,
        resistanceScore: resistanceZone?.resistanceScore ?? 0,
        band: round(band),
        inSupportZone: inSupportZone ? 1 : 0,
        inResistanceZone: inResistanceZone ? 1 : 0,
      },
      metadata: {
        levels: levels.length,
        maxTouches,
        zoneThickness: round(band * 2),
        hasRejection: isBullishRejection || isBearishRejection,
      },
    };
  }
}

// ─── Internal Types ──────────────────────────────────────────

interface LevelScore {
  price: number;
  supportScore: number;
  resistanceScore: number;
  netScore: number;
}

// ─── Pivot Detection ─────────────────────────────────────────

/**
 * Find the most recent pivot high and pivot low.
 * A pivot high at bar i means high[i] is the highest of
 * [i-period .. i+period]. Requires period bars of confirmation.
 */
function findPivots(
  candles: OHLCV[],
  period: number,
): {
  pivotHigh: number | null;
  pivotHighIdx: number;
  pivotLow: number | null;
  pivotLowIdx: number;
} {
  let pivotHigh: number | null = null;
  let pivotHighIdx = 0;
  let pivotLow: number | null = null;
  let pivotLowIdx = 0;

  const len = candles.length;

  // Scan from most recent confirmed pivot backward
  // Pivot at bar i needs period bars after it for confirmation
  for (let i = len - 1 - period; i >= period; i--) {
    // Check pivot high
    if (pivotHigh === null) {
      let isHigh = true;
      for (let j = i - period; j <= i + period; j++) {
        if (j === i) continue;
        if (candles[j].high >= candles[i].high) {
          isHigh = false;
          break;
        }
      }
      if (isHigh) {
        pivotHigh = candles[i].high;
        pivotHighIdx = i;
      }
    }

    // Check pivot low
    if (pivotLow === null) {
      let isLow = true;
      for (let j = i - period; j <= i + period; j++) {
        if (j === i) continue;
        if (candles[j].low <= candles[i].low) {
          isLow = false;
          break;
        }
      }
      if (isLow) {
        pivotLow = candles[i].low;
        pivotLowIdx = i;
      }
    }

    if (pivotHigh !== null && pivotLow !== null) break;
  }

  return { pivotHigh, pivotHighIdx, pivotLow, pivotLowIdx };
}

// ─── Touch Counter ───────────────────────────────────────────

/**
 * Count how many times a price level has been "tested and held."
 *
 * Support (isSupport = true):
 *   bar[i-1].low < level AND level < bar[i].close
 *   → price dipped below then closed above = support test
 *
 * Resistance (isSupport = false):
 *   bar[i-1].high > level AND level > bar[i].close
 *   → price poked above then closed below = resistance test
 */
function countTouches(
  candles: OHLCV[],
  level: number,
  lookback: number,
  isSupport: boolean,
): number {
  let count = 0;
  const len = candles.length;
  const start = Math.max(1, len - lookback);

  for (let i = start; i < len; i++) {
    if (isSupport) {
      if (candles[i - 1].low < level && level < candles[i].close) {
        count++;
      }
    } else {
      if (candles[i - 1].high > level && level > candles[i].close) {
        count++;
      }
    }
  }

  return count;
}

// ─── Zone Finder ─────────────────────────────────────────────

/**
 * Find the strongest support or resistance level in the bottom
 * or top third of the range respectively.
 */
function findStrongestZone(
  levels: LevelScore[],
  lowestLow: number,
  step: number,
  type: 'support' | 'resistance',
): LevelScore | null {
  if (levels.length === 0) return null;

  const totalLevels = levels.length;
  let candidates: LevelScore[];

  if (type === 'support') {
    // Bottom third of levels
    const cutoff = Math.ceil(totalLevels / 3);
    candidates = levels.slice(0, cutoff);
  } else {
    // Top third of levels
    const cutoff = Math.floor((totalLevels * 2) / 3);
    candidates = levels.slice(cutoff);
  }

  if (candidates.length === 0) return null;

  const scoreKey = type === 'support' ? 'supportScore' : 'resistanceScore';
  let best: LevelScore | null = null;
  let bestScore = -1;

  for (const level of candidates) {
    if (level[scoreKey] > bestScore) {
      bestScore = level[scoreKey];
      best = level;
    }
  }

  return best;
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
