/**
 * Bollinger Bands Indicator
 *
 * Price touching lower band = potential buy zone
 * Price touching upper band = potential sell zone
 * Band squeeze = low volatility, breakout incoming
 *
 * Pine Script equivalent:
 *   [middle, upper, lower] = ta.bb(close, 20, 2)
 */

import type { Indicator, IndicatorConfig, IndicatorInput, IndicatorOutput } from '../types.js';

export class BollingerIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'bollinger',
    description: 'Bollinger Bands — volatility-based support/resistance',
    defaultParams: { period: 20, stdDev: 2 },
    timeframe: '15m',
    minCandles: 21,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const { period, stdDev } = params;
    const closes = candles.map(c => c.close);

    const { upper, middle, lower, bandwidth } = calculateBollinger(closes, period, stdDev);
    const currentPrice = closes[closes.length - 1];

    // Position within bands (0 = lower band, 1 = upper band)
    const percentB = (currentPrice - lower) / (upper - lower);

    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.5;

    // Price near or below lower band = oversold, potential buy
    if (percentB <= 0.1) {
      signal = 'buy';
      confidence = 0.7 + (0.1 - percentB) * 3;
    } else if (percentB <= 0.25) {
      signal = 'buy';
      confidence = 0.55;
    }
    // Price near or above upper band = overbought, potential sell
    else if (percentB >= 0.9) {
      signal = 'sell';
      confidence = 0.7 + (percentB - 0.9) * 3;
    } else if (percentB >= 0.75) {
      signal = 'sell';
      confidence = 0.55;
    }

    return {
      signal,
      confidence: Math.min(confidence, 1),
      values: {
        upper: round(upper),
        middle: round(middle),
        lower: round(lower),
        percent_b: round(percentB),
        bandwidth: round(bandwidth),
      },
      metadata: {
        squeeze: bandwidth < 0.04,
        breakoutPotential: bandwidth < 0.03 ? 'high' : bandwidth < 0.06 ? 'medium' : 'low',
      },
    };
  }
}

function calculateBollinger(
  closes: number[],
  period: number,
  stdDevMultiplier: number,
): { upper: number; middle: number; lower: number; bandwidth: number } {
  const slice = closes.slice(-period);
  const mean = slice.reduce((a, b) => a + b, 0) / period;

  const squaredDiffs = slice.map(v => (v - mean) ** 2);
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
  const stdDev = Math.sqrt(variance);

  const upper = mean + stdDevMultiplier * stdDev;
  const lower = mean - stdDevMultiplier * stdDev;
  const bandwidth = (upper - lower) / mean;

  return { upper, middle: mean, lower, bandwidth };
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
