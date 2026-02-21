/**
 * SuperTrend Indicator
 *
 * Trend-following overlay that flips between bullish/bearish.
 * Used as a filter: only trade grid buys when SuperTrend is bullish.
 *
 * Pine Script equivalent:
 *   [supertrend, direction] = ta.supertrend(3, 10)
 */

import type { Indicator, IndicatorConfig, IndicatorInput, IndicatorOutput, OHLCV } from '../types.js';
import { calculateATR } from './atr.js';

export class SuperTrendIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'supertrend',
    description: 'SuperTrend — trend-following overlay for directional bias',
    defaultParams: { atrPeriod: 10, multiplier: 3 },
    timeframe: '15m',
    minCandles: 15,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const { atrPeriod, multiplier } = params;

    const { value, direction } = calculateSuperTrend(candles, atrPeriod, multiplier);
    const currentPrice = candles[candles.length - 1].close;

    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.6;

    if (direction === 'up') {
      signal = 'buy';
      // Stronger signal when price is well above supertrend
      const distance = ((currentPrice - value) / currentPrice) * 100;
      confidence = Math.min(0.6 + distance * 0.05, 0.9);
    } else {
      signal = 'sell';
      const distance = ((value - currentPrice) / currentPrice) * 100;
      confidence = Math.min(0.6 + distance * 0.05, 0.9);
    }

    return {
      signal,
      confidence,
      values: {
        supertrend: round(value),
        direction_num: direction === 'up' ? 1 : -1,
      },
      metadata: {
        direction,
        trendStrength: Math.abs(((currentPrice - value) / currentPrice) * 100),
      },
    };
  }
}

function calculateSuperTrend(
  candles: OHLCV[],
  atrPeriod: number,
  multiplier: number,
): { value: number; direction: 'up' | 'down' } {
  const atr = calculateATR(candles, atrPeriod);

  // Calculate basic bands using last candle
  let upperBand: number[] = [];
  let lowerBand: number[] = [];
  let supertrend: number[] = [];
  let direction: number[] = []; // 1 = up, -1 = down

  for (let i = 0; i < candles.length; i++) {
    const hl2 = (candles[i].high + candles[i].low) / 2;

    // Use ATR for each candle (simplified: using final ATR value for all)
    const basicUpper = hl2 + multiplier * atr;
    const basicLower = hl2 - multiplier * atr;

    if (i === 0) {
      upperBand.push(basicUpper);
      lowerBand.push(basicLower);
      supertrend.push(basicUpper);
      direction.push(1);
      continue;
    }

    // Final upper band
    const finalUpper = basicUpper < upperBand[i - 1] || candles[i - 1].close > upperBand[i - 1]
      ? basicUpper
      : upperBand[i - 1];
    upperBand.push(finalUpper);

    // Final lower band
    const finalLower = basicLower > lowerBand[i - 1] || candles[i - 1].close < lowerBand[i - 1]
      ? basicLower
      : lowerBand[i - 1];
    lowerBand.push(finalLower);

    // SuperTrend direction
    if (supertrend[i - 1] === upperBand[i - 1]) {
      if (candles[i].close <= finalUpper) {
        supertrend.push(finalUpper);
        direction.push(-1);
      } else {
        supertrend.push(finalLower);
        direction.push(1);
      }
    } else {
      if (candles[i].close >= finalLower) {
        supertrend.push(finalLower);
        direction.push(1);
      } else {
        supertrend.push(finalUpper);
        direction.push(-1);
      }
    }
  }

  const lastIdx = supertrend.length - 1;
  return {
    value: supertrend[lastIdx],
    direction: direction[lastIdx] === 1 ? 'up' : 'down',
  };
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
