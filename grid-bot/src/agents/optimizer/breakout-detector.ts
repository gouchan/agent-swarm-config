/**
 * Breakout detection using Bollinger squeeze + volume spike
 *
 * Detects when price consolidates (low volatility) then breaks out
 * with volume confirmation.
 */

import type { OHLCV } from '../../indicators/types.js';
import { calculateATR } from '../../indicators/built-in/atr.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('breakout');

export interface BreakoutParams {
  /** Candles to check for consolidation */
  lookback: number;
  /** Volume must exceed avg * this multiplier */
  volumeMultiplier: number;
  /** Stop loss = entry ± ATR * this multiplier */
  atrStopMultiplier: number;
}

export interface BreakoutSignal {
  detected: boolean;
  direction: 'long' | 'short';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence: number;
  reason: string;
}

/**
 * Detect breakout from consolidation
 *
 * Conditions:
 * 1. Bollinger bandwidth < 0.04 (squeeze)
 * 2. Latest volume > average volume * multiplier
 * 3. Price breaks above upper band (long) or below lower (short)
 */
export function detectBreakout(
  candles: OHLCV[],
  params: BreakoutParams,
): BreakoutSignal | null {
  const { lookback, volumeMultiplier, atrStopMultiplier } = params;

  if (candles.length < lookback + 1) {
    log.debug('Insufficient candles for breakout detection', {
      available: candles.length,
      required: lookback + 1,
    });
    return null;
  }

  const recentCandles = candles.slice(-lookback);
  const latestCandle = candles[candles.length - 1];

  // Calculate Bollinger Bands
  const closes = recentCandles.map(c => c.close);
  const { upper, middle, lower, bandwidth } = calculateBollinger(closes, lookback, 2);

  // Check for Bollinger squeeze (low volatility)
  if (bandwidth >= 0.04) {
    log.debug('No squeeze detected', { bandwidth: bandwidth.toFixed(4) });
    return null;
  }

  // Calculate average volume
  const volumes = recentCandles.map(c => c.volume);
  const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;

  // Check volume spike
  if (latestCandle.volume < avgVolume * volumeMultiplier) {
    log.debug('Insufficient volume', {
      current: latestCandle.volume,
      average: avgVolume,
      multiplier: volumeMultiplier,
    });
    return null;
  }

  // Check price breakout direction
  let direction: 'long' | 'short' | null = null;
  let confidence = 0.6;

  if (latestCandle.close > upper) {
    direction = 'long';
    const breakoutStrength = (latestCandle.close - upper) / (upper - middle);
    confidence = Math.min(0.6 + breakoutStrength * 0.3, 0.95);
  } else if (latestCandle.close < lower) {
    direction = 'short';
    const breakoutStrength = (lower - latestCandle.close) / (middle - lower);
    confidence = Math.min(0.6 + breakoutStrength * 0.3, 0.95);
  }

  if (!direction) {
    log.debug('Price has not broken out of bands', {
      close: latestCandle.close,
      upper,
      lower,
    });
    return null;
  }

  // Calculate ATR for stop loss
  const atr = calculateATR(candles, 14);
  const entryPrice = latestCandle.close;
  const stopLoss = direction === 'long'
    ? entryPrice - atr * atrStopMultiplier
    : entryPrice + atr * atrStopMultiplier;

  // Calculate take profit (1:2 risk-reward ratio)
  const risk = Math.abs(entryPrice - stopLoss);
  const takeProfit = direction === 'long'
    ? entryPrice + risk * 2
    : entryPrice - risk * 2;

  const reason = `Bollinger squeeze (BW=${bandwidth.toFixed(4)}) + volume spike (${(latestCandle.volume / avgVolume).toFixed(2)}x avg) + ${direction} breakout`;

  log.info(`Breakout detected: ${direction}`, {
    entryPrice,
    stopLoss,
    takeProfit,
    confidence,
    bandwidth,
    volumeRatio: latestCandle.volume / avgVolume,
  });

  return {
    detected: true,
    direction,
    entryPrice,
    stopLoss,
    takeProfit,
    confidence,
    reason,
  };
}

/**
 * Calculate Bollinger Bands
 */
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
