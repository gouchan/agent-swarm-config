/**
 * EMA Crossover Indicator
 *
 * Pine Script equivalent:
 *   ema_fast = ta.ema(close, 9)
 *   ema_slow = ta.ema(close, 21)
 *   crossover = ta.crossover(ema_fast, ema_slow)
 *   crossunder = ta.crossunder(ema_fast, ema_slow)
 */

import type { Indicator, IndicatorConfig, IndicatorInput, IndicatorOutput } from '../types.js';

export class EMAIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'ema',
    description: 'EMA Crossover — fast/slow exponential moving average crossover',
    defaultParams: { fastPeriod: 9, slowPeriod: 21 },
    timeframe: '15m',
    minCandles: 22,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const { fastPeriod, slowPeriod } = params;
    const closes = candles.map(c => c.close);

    const emaFast = calculateEMA(closes, fastPeriod);
    const emaSlow = calculateEMA(closes, slowPeriod);

    // Check for crossover using last 2 values
    const currentFast = emaFast[emaFast.length - 1];
    const currentSlow = emaSlow[emaSlow.length - 1];
    const prevFast = emaFast[emaFast.length - 2];
    const prevSlow = emaSlow[emaSlow.length - 2];

    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.5;

    // Golden cross: fast crosses above slow
    if (prevFast <= prevSlow && currentFast > currentSlow) {
      signal = 'buy';
      const spread = Math.abs(currentFast - currentSlow) / currentSlow;
      confidence = Math.min(0.6 + spread * 10, 1);
    }
    // Death cross: fast crosses below slow
    else if (prevFast >= prevSlow && currentFast < currentSlow) {
      signal = 'sell';
      const spread = Math.abs(currentSlow - currentFast) / currentSlow;
      confidence = Math.min(0.6 + spread * 10, 1);
    }
    // Fast above slow = bullish bias
    else if (currentFast > currentSlow) {
      signal = 'buy';
      confidence = 0.4;
    }
    // Fast below slow = bearish bias
    else if (currentFast < currentSlow) {
      signal = 'sell';
      confidence = 0.4;
    }

    return {
      signal,
      confidence,
      values: {
        ema_fast: round(currentFast),
        ema_slow: round(currentSlow),
        spread_pct: round(((currentFast - currentSlow) / currentSlow) * 100),
      },
    };
  }
}

export function calculateEMA(data: number[], period: number): number[] {
  if (data.length < period) return [];

  const multiplier = 2 / (period + 1);
  const ema: number[] = [];

  // SMA for the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i];
  }
  ema.push(sum / period);

  // EMA calculation
  for (let i = period; i < data.length; i++) {
    ema.push((data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }

  return ema;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
