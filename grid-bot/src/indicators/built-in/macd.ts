/**
 * MACD (Moving Average Convergence Divergence) Indicator
 *
 * Pine Script equivalent:
 *   [macdLine, signalLine, hist] = ta.macd(close, 12, 26, 9)
 */

import type { Indicator, IndicatorConfig, IndicatorInput, IndicatorOutput } from '../types.js';
import { calculateEMA } from './ema.js';

export class MACDIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'macd',
    description: 'MACD — trend-following momentum indicator',
    defaultParams: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
    timeframe: '15m',
    minCandles: 35,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    const { fastPeriod, slowPeriod, signalPeriod } = params;
    const closes = candles.map(c => c.close);

    const emaFast = calculateEMA(closes, fastPeriod);
    const emaSlow = calculateEMA(closes, slowPeriod);

    // Align arrays — slow EMA starts later
    const offset = slowPeriod - fastPeriod;
    const macdLine: number[] = [];
    for (let i = 0; i < emaSlow.length; i++) {
      macdLine.push(emaFast[i + offset] - emaSlow[i]);
    }

    const signalLine = calculateEMA(macdLine, signalPeriod);

    // Histogram = MACD - Signal
    const histOffset = macdLine.length - signalLine.length;
    const currentMACD = macdLine[macdLine.length - 1];
    const currentSignal = signalLine[signalLine.length - 1];
    const currentHist = currentMACD - currentSignal;

    const prevMACD = macdLine[macdLine.length - 2];
    const prevSignal = signalLine[signalLine.length - 2];
    const prevHist = prevMACD - prevSignal;

    let signal: IndicatorOutput['signal'] = 'neutral';
    let confidence = 0.5;

    // Bullish crossover: MACD crosses above signal
    if (prevMACD <= prevSignal && currentMACD > currentSignal) {
      signal = 'buy';
      confidence = 0.7;
    }
    // Bearish crossover: MACD crosses below signal
    else if (prevMACD >= prevSignal && currentMACD < currentSignal) {
      signal = 'sell';
      confidence = 0.7;
    }
    // Histogram growing positive = strengthening bullish
    else if (currentHist > 0 && currentHist > prevHist) {
      signal = 'buy';
      confidence = 0.55;
    }
    // Histogram growing negative = strengthening bearish
    else if (currentHist < 0 && currentHist < prevHist) {
      signal = 'sell';
      confidence = 0.55;
    }

    return {
      signal,
      confidence,
      values: {
        macd: round(currentMACD),
        signal_line: round(currentSignal),
        histogram: round(currentHist),
      },
    };
  }
}

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}
