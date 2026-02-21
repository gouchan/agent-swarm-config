/**
 * OHLCV replay engine for grid strategy backtesting
 *
 * Simulates grid trading on historical candlestick data
 * to estimate performance before live trading.
 */

import type { OHLCV } from '../../indicators/types.js';
import type { GridConfig } from '../../config/default.js';
import type { RiskProfile } from '../../config/risk-profiles.js';
import { type GridLevel, calculateGridLevels, calculatePnL } from '../../utils/math.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('backtest');

export interface BacktestResult {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  totalPnlPct: number;
  maxDrawdown: number;
  sharpeRatio: number;
  gridFills: Array<{
    level: number;
    side: 'buy' | 'sell';
    price: number;
    timestamp: number;
  }>;
}

/**
 * Run backtest on historical candles
 */
export function runBacktest(
  candles: OHLCV[],
  config: GridConfig,
  riskProfile: RiskProfile,
): BacktestResult {
  if (candles.length === 0) {
    throw new Error('Cannot backtest with zero candles');
  }

  log.info('Starting backtest', {
    candles: candles.length,
    pair: config.pair,
    capital: config.capitalUsd,
    gridLevels: config.gridLevels,
  });

  // Initialize grid from first candle
  const initialPrice = candles[0].close;
  let grid = calculateGridLevels(
    initialPrice,
    config.gridSpacingPct,
    config.gridLevels,
    config.capitalUsd,
  );

  const gridFills: BacktestResult['gridFills'] = [];
  const completedTrades: Array<{ buyPrice: number; sellPrice: number; quantity: number }> = [];
  const dailyReturns: number[] = [];

  let equity = config.capitalUsd;
  let peakEquity = equity;
  let maxDrawdown = 0;

  const buyOrders: Map<number, { price: number; quantity: number; timestamp: number }> = new Map();

  // Walk through each candle
  for (let i = 0; i < candles.length; i++) {
    const candle = candles[i];

    // Check each grid level for fills
    for (const level of grid) {
      if (level.filled) continue;

      let filled = false;

      if (level.side === 'buy') {
        // Buy level: fill if price went at or below level price
        if (candle.low <= level.price) {
          filled = true;
          buyOrders.set(level.index, {
            price: level.price,
            quantity: level.quantity,
            timestamp: candle.timestamp,
          });
          gridFills.push({
            level: level.index,
            side: 'buy',
            price: level.price,
            timestamp: candle.timestamp,
          });
        }
      } else if (level.side === 'sell') {
        // Sell level: fill if price went at or above level price
        if (candle.high >= level.price) {
          filled = true;

          // Find matching buy order (closest buy level below this sell)
          const buyLevels = Array.from(buyOrders.keys())
            .filter(idx => idx < 0)
            .sort((a, b) => b - a); // Descending (closest to 0 first)

          if (buyLevels.length > 0) {
            const matchingBuyLevel = buyLevels[0];
            const buyOrder = buyOrders.get(matchingBuyLevel)!;

            // Complete the trade
            const { pnl } = calculatePnL('buy', buyOrder.price, level.price, buyOrder.quantity);
            completedTrades.push({
              buyPrice: buyOrder.price,
              sellPrice: level.price,
              quantity: buyOrder.quantity,
            });

            equity += pnl;

            // Remove the buy order
            buyOrders.delete(matchingBuyLevel);
          }

          gridFills.push({
            level: level.index,
            side: 'sell',
            price: level.price,
            timestamp: candle.timestamp,
          });
        }
      }

      if (filled) {
        level.filled = true;
      }
    }

    // Track drawdown
    if (equity > peakEquity) {
      peakEquity = equity;
    }
    const currentDrawdown = ((peakEquity - equity) / peakEquity) * 100;
    if (currentDrawdown > maxDrawdown) {
      maxDrawdown = currentDrawdown;
    }

    // Track daily returns (simplified: per candle)
    if (i > 0) {
      const prevEquity = i === 1 ? config.capitalUsd : equity;
      const returnPct = ((equity - prevEquity) / prevEquity) * 100;
      dailyReturns.push(returnPct);
    }
  }

  // Calculate metrics
  const winningTrades = completedTrades.filter(t => t.sellPrice > t.buyPrice).length;
  const losingTrades = completedTrades.filter(t => t.sellPrice <= t.buyPrice).length;
  const totalTrades = completedTrades.length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  const totalPnl = equity - config.capitalUsd;
  const totalPnlPct = (totalPnl / config.capitalUsd) * 100;

  // Sharpe ratio: mean daily return / std dev of daily returns (annualized)
  const sharpeRatio = calculateSharpe(dailyReturns);

  log.info('Backtest complete', {
    totalTrades,
    winRate: `${winRate.toFixed(2)}%`,
    totalPnl: `$${totalPnl.toFixed(2)}`,
    totalPnlPct: `${totalPnlPct.toFixed(2)}%`,
    maxDrawdown: `${maxDrawdown.toFixed(2)}%`,
    sharpeRatio: sharpeRatio.toFixed(2),
  });

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    totalPnl,
    totalPnlPct,
    maxDrawdown,
    sharpeRatio,
    gridFills,
  };
}

/**
 * Calculate Sharpe ratio from daily returns
 */
function calculateSharpe(dailyReturns: number[]): number {
  if (dailyReturns.length < 2) return 0;

  const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const squaredDiffs = dailyReturns.map(r => (r - mean) ** 2);
  const variance = squaredDiffs.reduce((a, b) => a + b, 0) / dailyReturns.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return 0;

  // Annualize (assuming daily returns, 365 days per year)
  const sharpe = (mean / stdDev) * Math.sqrt(365);
  return sharpe;
}
