/**
 * RSI (Relative Strength Index) Indicator
 *
 * Pine Script equivalent:
 *   rsi = ta.rsi(close, 14)
 *   overbought = 70, oversold = 30
 */

import type { Indicator, IndicatorConfig, IndicatorInput, IndicatorOutput } from '../types.js';

export class RSIIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'rsi',
    description: 'Relative Strength Index — momentum oscillator (0-100)',
    defaultParams: { period: 14, overbought: 70, oversold: 30 },
    timeframe: '15m',
    minCandles: 15,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const { period, overbought, oversold } = params;
    const closes = candles.map(c => c.close);
    const rsi = calculateRSI(closes, period);

    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.5;

    if (rsi <= oversold) {
      signal = 'buy';
      confidence = 0.6 + (oversold - rsi) / oversold * 0.4;
    } else if (rsi >= overbought) {
      signal = 'sell';
      confidence = 0.6 + (rsi - overbought) / (100 - overbought) * 0.4;
    }

    return {
      signal,
      confidence: Math.min(confidence, 1),
      values: { rsi: Math.round(rsi * 100) / 100 },
    };
  }
}

function calculateRSI(closes: number[], period: number): number {
  if (closes.length < period + 1) return 50;

  let gainSum = 0;
  let lossSum = 0;

  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = closes[i] - closes[i - 1];
    if (change > 0) gainSum += change;
    else lossSum += Math.abs(change);
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  // Smoothed RSI using Wilder's method
  for (let i = period + 1; i < closes.length; i++) {
    const change = closes[i] - closes[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}
