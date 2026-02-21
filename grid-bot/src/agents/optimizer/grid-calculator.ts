/**
 * Grid level computation
 *
 * Calculates grid levels from current price and adjusts for volatility.
 */

import type { GridConfig } from '../../config/default.js';
import { type GridLevel, calculateGridLevels } from '../../utils/math.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('grid-calc');

/**
 * Calculate grid levels from current price
 */
export function calculateGrid(currentPrice: number, config: GridConfig): GridLevel[] {
  log.debug('Calculating grid levels', { currentPrice, config });

  const grid = calculateGridLevels(
    currentPrice,
    config.gridSpacingPct,
    config.gridLevels,
    config.capitalUsd,
  );

  log.info(`Generated ${grid.length} grid levels (${config.gridLevels} buy + ${config.gridLevels} sell)`, {
    totalLevels: grid.length,
    buyLevels: grid.filter(l => l.side === 'buy').length,
    sellLevels: grid.filter(l => l.side === 'sell').length,
  });

  return grid;
}

/**
 * Adjust grid spacing based on volatility (ATR)
 *
 * If volatility exceeds current spacing, widen the grid proportionally
 * to prevent over-trading in choppy markets.
 */
export function adjustGridForVolatility(
  grid: GridLevel[],
  atrPct: number,
  minSpacing: number,
): GridLevel[] {
  if (grid.length === 0) return grid;

  // Calculate current grid spacing from first two levels
  const sorted = [...grid].sort((a, b) => a.price - b.price);
  const currentSpacing = sorted.length >= 2
    ? ((sorted[1].price - sorted[0].price) / sorted[0].price) * 100
    : 0;

  // If ATR is higher than current spacing, we need to widen
  const targetSpacing = Math.max(atrPct * 1.2, minSpacing);

  if (targetSpacing <= currentSpacing) {
    log.debug('Grid spacing adequate for current volatility', { currentSpacing, atrPct });
    return grid;
  }

  log.warn('Adjusting grid for high volatility', {
    atrPct,
    currentSpacing,
    targetSpacing,
    minSpacing,
  });

  // Calculate center price (midpoint between buy and sell levels)
  const buyLevels = grid.filter(l => l.side === 'buy');
  const sellLevels = grid.filter(l => l.side === 'sell');

  if (buyLevels.length === 0 || sellLevels.length === 0) return grid;

  const highestBuy = Math.max(...buyLevels.map(l => l.price));
  const lowestSell = Math.min(...sellLevels.map(l => l.price));
  const centerPrice = (highestBuy + lowestSell) / 2;

  // Recalculate grid with new spacing
  const totalCapital = buyLevels.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const levels = Math.floor(grid.length / 2);

  const adjustedGrid = calculateGridLevels(
    centerPrice,
    targetSpacing,
    levels,
    totalCapital,
  );

  log.info('Grid adjusted for volatility', {
    oldLevels: grid.length,
    newLevels: adjustedGrid.length,
    oldSpacing: currentSpacing.toFixed(2),
    newSpacing: targetSpacing.toFixed(2),
  });

  return adjustedGrid;
}
