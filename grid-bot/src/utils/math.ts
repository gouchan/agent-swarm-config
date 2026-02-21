/**
 * Trading math utilities
 *
 * Grid spacing calculations, position sizing, P&L computation.
 */

// ─── Grid Calculations ────────────────────────────────────

export interface GridLevel {
  index: number;
  price: number;
  side: 'buy' | 'sell';
  quantity: number;
  filled: boolean;
}

/**
 * Calculate symmetric grid levels around a center price
 *
 * @param centerPrice - Current market price
 * @param spacingPct - Spacing between levels as percentage (e.g., 2.5)
 * @param levels - Number of levels above AND below center
 * @param totalCapital - Total capital to distribute across buy levels
 * @param quoteDecimals - Decimal places for the quote token
 */
export function calculateGridLevels(
  centerPrice: number,
  spacingPct: number,
  levels: number,
  totalCapital: number,
  quoteDecimals: number = 6,
): GridLevel[] {
  const grid: GridLevel[] = [];
  const spacingMultiplier = spacingPct / 100;
  const capitalPerLevel = totalCapital / levels;

  // Buy levels (below center price)
  for (let i = 1; i <= levels; i++) {
    const price = roundTo(centerPrice * (1 - spacingMultiplier * i), quoteDecimals);
    const quantity = capitalPerLevel / price;
    grid.push({
      index: -i,
      price,
      side: 'buy',
      quantity: roundTo(quantity, 9),
      filled: false,
    });
  }

  // Sell levels (above center price)
  for (let i = 1; i <= levels; i++) {
    const price = roundTo(centerPrice * (1 + spacingMultiplier * i), quoteDecimals);
    const quantity = capitalPerLevel / price;
    grid.push({
      index: i,
      price,
      side: 'sell',
      quantity: roundTo(quantity, 9),
      filled: false,
    });
  }

  return grid.sort((a, b) => a.price - b.price);
}

// ─── Position Sizing ───────────────────────────────────────

/**
 * Calculate position size based on risk percentage
 *
 * @param capital - Total available capital
 * @param riskPct - Risk percentage per trade
 * @param entryPrice - Entry price
 * @param stopPrice - Stop-loss price
 */
export function calculatePositionSize(
  capital: number,
  riskPct: number,
  entryPrice: number,
  stopPrice: number,
): number {
  const riskAmount = capital * (riskPct / 100);
  const priceDiff = Math.abs(entryPrice - stopPrice);
  if (priceDiff === 0) return 0;
  return riskAmount / priceDiff;
}

// ─── P&L Calculations ─────────────────────────────────────

/**
 * Calculate profit/loss for a completed trade
 */
export function calculatePnL(
  side: 'buy' | 'sell',
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  fees: number = 0,
): { pnl: number; pnlPct: number } {
  const raw = side === 'buy'
    ? (exitPrice - entryPrice) * quantity
    : (entryPrice - exitPrice) * quantity;
  const pnl = raw - fees;
  const pnlPct = (pnl / (entryPrice * quantity)) * 100;
  return { pnl: roundTo(pnl, 6), pnlPct: roundTo(pnlPct, 2) };
}

/**
 * Calculate Risk:Reward ratio
 */
export function riskRewardRatio(
  entry: number,
  stop: number,
  target: number,
): number {
  const risk = Math.abs(entry - stop);
  const reward = Math.abs(target - entry);
  if (risk === 0) return 0;
  return roundTo(reward / risk, 2);
}

// ─── Helpers ───────────────────────────────────────────────

export function roundTo(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

export function pctChange(from: number, to: number): number {
  if (from === 0) return 0;
  return roundTo(((to - from) / from) * 100, 4);
}

export function bpsToDecimal(bps: number): number {
  return bps / 10_000;
}

export function decimalToBps(decimal: number): number {
  return Math.round(decimal * 10_000);
}
