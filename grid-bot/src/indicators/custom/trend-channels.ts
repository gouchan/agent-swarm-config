/**
 * Trend Channels with Liquidity Breaks Indicator
 *
 * Translated from: "Trend Channels With Liquidity Breaks [ChartPrime]" (Pine Script v5)
 * Original by ChartPrime, MPL-2.0 license
 *
 * Builds dynamic trend channels from consecutive pivots:
 * 1. Detects pivot highs/lows with configurable lookback
 * 2. Draws descending channels from two consecutive lower pivot highs
 * 3. Draws ascending channels from two consecutive higher pivot lows
 * 4. Channel width = ATR(10) × 6
 * 5. Liquidity break = price exits channel top or bottom
 *    - Break above descending channel top = bullish (liquidity grab)
 *    - Break below ascending channel bottom = bearish (liquidity grab)
 * 6. Volume scoring: normalized WMA volume classifies LV/MV/HV
 *
 * Signal logic:
 *   BUY  = uptrend channel active + price near bottom | bullish break of down channel
 *   SELL = downtrend channel active + price near top | bearish break of up channel
 *   Confidence = channel slope strength × volume score × proximity
 */

import type {
  Indicator,
  IndicatorConfig,
  IndicatorInput,
  IndicatorOutput,
  OHLCV,
} from '../types.js';

// ─── Config ──────────────────────────────────────────────────

export class TrendChannelsIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'trend-channels',
    description:
      'Trend Channels with Liquidity Breaks — pivot channels with volume-confirmed breakouts',
    defaultParams: {
      length: 8,
      atrPeriod: 10,
      atrMult: 6,
      volumeWmaPeriod: 21,
      volumeNormPeriod: 100,
    },
    timeframe: '15m',
    minCandles: 40,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const { length, atrPeriod, atrMult, volumeWmaPeriod, volumeNormPeriod } =
      params;
    const len = candles.length;

    if (len < length * 2 + atrPeriod + 5) {
      return neutral({});
    }

    // ── 1. Find last 2 pivot highs and 2 pivot lows ────────
    const pivotHighs = findPivots(candles, length, 'high');
    const pivotLows = findPivots(candles, length, 'low');

    // ── 2. ATR for channel width ────────────────────────────
    const atr = calculateATR(candles, atrPeriod);
    const channelWidth = atr * atrMult;

    // ── 3. Volume scoring ───────────────────────────────────
    const volScore = volumeNormalized(candles, volumeWmaPeriod, volumeNormPeriod);
    const volAvg = simpleVolumeAvg(candles, volumeNormPeriod);
    const volCategory: 'LV' | 'MV' | 'HV' =
      volScore < volAvg ? 'LV' : volScore < volAvg * 1.5 ? 'MV' : 'HV';

    // ── 4. Build channels ───────────────────────────────────
    const current = candles[len - 1];
    const currentPrice = current.close;

    let downChannel: Channel | null = null;
    let upChannel: Channel | null = null;

    // Descending channel: two consecutive pivot highs with negative slope
    if (pivotHighs.length >= 2) {
      const [prev, last] = [pivotHighs[1], pivotHighs[0]];
      const slope = slopeAngle(
        last.price - prev.price,
        last.idx - prev.idx,
      );
      if (slope <= 0 && prev.idx !== last.idx) {
        const dydx =
          (last.price - prev.price) / (last.idx - prev.idx);
        const barsFromLast = len - 1 - last.idx;
        const topNow = last.price + dydx * barsFromLast;
        const bottomNow = topNow - channelWidth;
        const centerNow = (topNow + bottomNow) / 2;

        downChannel = {
          type: 'descending',
          top: topNow,
          bottom: bottomNow,
          center: centerNow,
          slope: dydx,
          width: channelWidth,
          startIdx: prev.idx,
          lastPivotIdx: last.idx,
        };
      }
    }

    // Ascending channel: two consecutive pivot lows with positive slope
    if (pivotLows.length >= 2) {
      const [prev, last] = [pivotLows[1], pivotLows[0]];
      const slope = slopeAngle(
        last.price - prev.price,
        last.idx - prev.idx,
      );
      if (slope >= 0 && prev.idx !== last.idx) {
        const dydx =
          (last.price - prev.price) / (last.idx - prev.idx);
        const barsFromLast = len - 1 - last.idx;
        const bottomNow = last.price + dydx * barsFromLast;
        const topNow = bottomNow + channelWidth;
        const centerNow = (topNow + bottomNow) / 2;

        upChannel = {
          type: 'ascending',
          top: topNow,
          bottom: bottomNow,
          center: centerNow,
          slope: dydx,
          width: channelWidth,
          startIdx: prev.idx,
          lastPivotIdx: last.idx,
        };
      }
    }

    // ── 5. Detect liquidity breaks ──────────────────────────
    const prev = candles[len - 2];
    let breakType: 'bullish_break' | 'bearish_break' | 'none' = 'none';

    // Break above descending channel top = bullish
    if (downChannel && current.low > downChannel.top) {
      breakType = 'bullish_break';
    }
    // Break below descending channel bottom = bearish
    if (downChannel && current.high < downChannel.bottom) {
      breakType = 'bearish_break';
    }
    // Break above ascending channel top = bullish
    if (upChannel && current.low > upChannel.top) {
      breakType = 'bullish_break';
    }
    // Break below ascending channel bottom = bearish
    if (upChannel && current.high < upChannel.bottom) {
      breakType = 'bearish_break';
    }

    // ── 6. Generate signal ──────────────────────────────────
    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.5;

    // Active channel — use the most recent one
    const activeChannel =
      downChannel && upChannel
        ? downChannel.lastPivotIdx > upChannel.lastPivotIdx
          ? downChannel
          : upChannel
        : downChannel ?? upChannel;

    if (breakType === 'bullish_break') {
      // Price broke above channel — strong bullish signal
      signal = 'buy';
      const volBoost = volCategory === 'HV' ? 0.15 : volCategory === 'MV' ? 0.08 : 0;
      confidence = 0.65 + volBoost;
    } else if (breakType === 'bearish_break') {
      // Price broke below channel — strong bearish signal
      signal = 'sell';
      const volBoost = volCategory === 'HV' ? 0.15 : volCategory === 'MV' ? 0.08 : 0;
      confidence = 0.65 + volBoost;
    } else if (activeChannel) {
      // Price inside channel — use position within channel
      const position = channelPosition(
        currentPrice,
        activeChannel.top,
        activeChannel.bottom,
      );

      if (activeChannel.type === 'ascending') {
        // Uptrend channel
        if (position <= 0.2) {
          // Near bottom of up channel = buy the dip
          signal = 'buy';
          confidence = 0.55 + (0.2 - position) * 0.5;
        } else if (position >= 0.85) {
          // Near top = caution / potential reversal
          signal = 'sell';
          confidence = 0.5 + (position - 0.85) * 0.3;
        }
      } else {
        // Downtrend channel
        if (position >= 0.8) {
          // Near top of down channel = sell the rally
          signal = 'sell';
          confidence = 0.55 + (position - 0.8) * 0.5;
        } else if (position <= 0.15) {
          // Near bottom = potential bounce / buy
          signal = 'buy';
          confidence = 0.5 + (0.15 - position) * 0.3;
        }
      }

      // Volume boost for signals inside channel
      if (signal !== 'neutral') {
        const volBoost = volCategory === 'HV' ? 0.05 : 0;
        confidence += volBoost;
      }
    }

    // ── 7. Build output ─────────────────────────────────────
    const values: Record<string, number> = {
      channelTop: activeChannel ? round(activeChannel.top) : 0,
      channelBottom: activeChannel ? round(activeChannel.bottom) : 0,
      channelCenter: activeChannel ? round(activeChannel.center) : 0,
      channelSlope: activeChannel ? round(activeChannel.slope) : 0,
      channelWidth: round(channelWidth),
      volumeScore: round(volScore),
      hasDownChannel: downChannel ? 1 : 0,
      hasUpChannel: upChannel ? 1 : 0,
      breakType:
        breakType === 'bullish_break' ? 1 : breakType === 'bearish_break' ? -1 : 0,
      positionInChannel: activeChannel
        ? round(
            channelPosition(currentPrice, activeChannel.top, activeChannel.bottom),
          )
        : 0.5,
    };

    return {
      signal,
      confidence: clamp(confidence, 0, 1),
      values,
      metadata: {
        channelType: activeChannel?.type ?? 'none',
        breakType,
        volCategory,
        pivotHighCount: pivotHighs.length,
        pivotLowCount: pivotLows.length,
      },
    };
  }
}

// ─── Internal Types ──────────────────────────────────────────

interface Pivot {
  price: number;
  idx: number;
}

interface Channel {
  type: 'ascending' | 'descending';
  top: number;
  bottom: number;
  center: number;
  slope: number;
  width: number;
  startIdx: number;
  lastPivotIdx: number;
}

// ─── Pivot Detection ─────────────────────────────────────────

/**
 * Find the most recent N pivots.
 * Returns them sorted by recency (most recent first).
 */
function findPivots(
  candles: OHLCV[],
  length: number,
  type: 'high' | 'low',
): Pivot[] {
  const pivots: Pivot[] = [];
  const len = candles.length;
  const maxPivots = 4; // Only need last 2, grab 4 for safety

  for (let i = len - 1 - length; i >= length; i--) {
    if (pivots.length >= maxPivots) break;

    let isPivot = true;
    const val = type === 'high' ? candles[i].high : candles[i].low;

    for (let j = i - length; j <= i + length; j++) {
      if (j === i || j < 0 || j >= len) continue;
      const comp = type === 'high' ? candles[j].high : candles[j].low;
      if (type === 'high' ? comp > val : comp < val) {
        isPivot = false;
        break;
      }
    }

    if (isPivot) {
      pivots.push({ price: val, idx: i });
    }
  }

  return pivots;
}

// ─── ATR ─────────────────────────────────────────────────────

function calculateATR(candles: OHLCV[], period: number): number {
  const len = candles.length;
  if (len < period + 1) return 0;

  let atr = 0;
  for (let i = len - period; i < len; i++) {
    const tr = Math.max(
      candles[i].high - candles[i].low,
      Math.abs(candles[i].high - candles[i - 1].close),
      Math.abs(candles[i].low - candles[i - 1].close),
    );
    atr += tr;
  }
  return atr / period;
}

// ─── Volume Scoring ──────────────────────────────────────────

/**
 * Normalized volume score (0-100) using WMA.
 * Matches Pine's min_max_volume(ta.wma(volume, 21)).
 */
function volumeNormalized(
  candles: OHLCV[],
  wmaPeriod: number,
  normPeriod: number,
): number {
  const len = candles.length;
  if (len < wmaPeriod + normPeriod) return 50;

  // WMA of volumes
  const wmaValues: number[] = [];
  for (let i = wmaPeriod - 1; i < len; i++) {
    let sum = 0;
    let weightSum = 0;
    for (let j = 0; j < wmaPeriod; j++) {
      const weight = wmaPeriod - j;
      sum += candles[i - j].volume * weight;
      weightSum += weight;
    }
    wmaValues.push(sum / weightSum);
  }

  if (wmaValues.length < normPeriod) return 50;

  // Min-max normalize over last normPeriod values
  const recent = wmaValues.slice(-normPeriod);
  const min = Math.min(...recent);
  const max = Math.max(...recent);
  const current = wmaValues[wmaValues.length - 1];

  if (max === min) return 50;
  return clamp(((current - min) / (max - min)) * 100, 0, 100);
}

function simpleVolumeAvg(candles: OHLCV[], period: number): number {
  const len = candles.length;
  const n = Math.min(period, len);
  let sum = 0;
  for (let i = len - n; i < len; i++) {
    sum += candles[i].volume;
  }
  return n > 0 ? sum / n : 0;
}

// ─── Helpers ─────────────────────────────────────────────────

/**
 * atan2 — angle of slope in radians.
 * Negative angle = descending, positive = ascending.
 */
function slopeAngle(dy: number, dx: number): number {
  return Math.atan2(dy, dx);
}

/**
 * Position within channel: 0 = bottom, 1 = top
 */
function channelPosition(
  price: number,
  top: number,
  bottom: number,
): number {
  if (top === bottom) return 0.5;
  return clamp((price - bottom) / (top - bottom), 0, 1);
}

function neutral(values: Record<string, number>): IndicatorOutput {
  return { signal: 'neutral', confidence: 0.5, values };
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
