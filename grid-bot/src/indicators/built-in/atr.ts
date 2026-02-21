/**
 * ATR (Average True Range) Indicator
 *
 * Measures market volatility. Used for:
 * - Dynamic grid spacing (wider grids in high volatility)
 * - Stop-loss placement (1-2x ATR from entry)
 * - Breakout confirmation (compare current range to ATR)
 *
 * Pine Script equivalent:
 *   atr = ta.atr(14)
 */

import type { Indicator, IndicatorConfig, IndicatorInput, IndicatorOutput, OHLCV } from '../types.js';

export class ATRIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'atr',
    description: 'Average True Range — volatility measurement for grid spacing and stops',
    defaultParams: { period: 14, highVolThreshold: 2.0 },
    timeframe: '15m',
    minCandles: 15,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const { period, highVolThreshold } = params;

    const atr = calculateATR(candles, period);
    const currentPrice = candles[candles.length - 1].close;
    const atrPct = (atr / currentPrice) * 100;

    // ATR doesn't directly signal buy/sell, but indicates volatility
    // High ATR = wider grids needed, breakout potential
    // Low ATR = tight grids, consolidation (potential breakout setup)
    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.5;

    if (atrPct >= highVolThreshold) {
      // High volatility — caution, widen grids
      signal = 'neutral';
      confidence = 0.3;
    }

    return {
      signal,
      confidence,
      values: {
        atr: Math.round(atr * 10000) / 10000,
        atr_pct: Math.round(atrPct * 100) / 100,
      },
      metadata: {
        suggestedGridSpacing: Math.max(atrPct * 1.5, 1.0),
        volatilityLevel: atrPct >= highVolThreshold ? 'high' : atrPct >= 1.0 ? 'medium' : 'low',
      },
    };
  }
}

export function calculateATR(candles: OHLCV[], period: number): number {
  if (candles.length < period + 1) return 0;

  const trueRanges: number[] = [];

  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose),
    );
    trueRanges.push(tr);
  }

  // Wilder's smoothing method
  let atr = trueRanges.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < trueRanges.length; i++) {
    atr = (atr * (period - 1) + trueRanges[i]) / period;
  }

  return atr;
}
