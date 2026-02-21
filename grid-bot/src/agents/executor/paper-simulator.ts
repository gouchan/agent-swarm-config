/**
 * Paper trade simulator
 *
 * Simulates order fills with realistic slippage and fees.
 * Tracks positions, P&L, win rate, and trade history.
 * No blockchain interaction — pure math.
 */

import type { OrderMessage } from '../../bus/types.js';
import type { PortfolioState } from '../optimizer/risk-engine.js';
import { calculatePnL, bpsToDecimal, roundTo } from '../../utils/math.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('paper-sim');

// ─── Types ────────────────────────────────────────────────

export interface PaperFill {
  orderId: string;
  fillPrice: number;
  fillQuantity: number;
  fee: number;
  slippageBps: number;
  timestamp: number;
}

export interface OpenPosition {
  orderId: string;
  side: 'buy' | 'sell';
  price: number;
  quantity: number;
  fee: number;
  timestamp: number;
  gridLevel?: number;
  strategy: 'grid' | 'breakout' | 'momentum';
}

export interface ClosedTrade {
  entryOrderId: string;
  exitOrderId: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPct: number;
  fees: number;
  durationMs: number;
  strategy: 'grid' | 'breakout' | 'momentum';
}

// ─── Constants ────────────────────────────────────────────

/** Jupiter-like maker/taker fee (0.25%) */
const FEE_BPS = 25;

// ─── Fill Simulator ───────────────────────────────────────

/**
 * Simulate an order fill with random slippage and fees.
 * Slippage is ±half of the order's slippageBps.
 */
export function simulateFill(order: OrderMessage): PaperFill {
  const maxSlippageDec = bpsToDecimal(order.slippageBps);
  // Random between -half and +half of max slippage
  const slippageDec = (Math.random() - 0.5) * maxSlippageDec;

  // Buys slip UP, sells slip DOWN (unfavorable direction)
  const direction = order.action === 'buy' ? 1 : -1;
  const fillPrice = roundTo(
    order.price * (1 + Math.abs(slippageDec) * direction),
    6,
  );

  const notional = fillPrice * order.quantity;
  const fee = roundTo(notional * bpsToDecimal(FEE_BPS), 6);
  const actualSlippageBps = roundTo(
    Math.abs(((fillPrice - order.price) / order.price) * 10_000),
    1,
  );

  return {
    orderId: order.orderId,
    fillPrice,
    fillQuantity: order.quantity,
    fee,
    slippageBps: actualSlippageBps,
    timestamp: Date.now(),
  };
}

// ─── Paper Portfolio ──────────────────────────────────────

export class PaperPortfolio {
  private initialCapital: number;
  private currentCapital: number;
  private peakCapital: number;
  private openPositions: OpenPosition[] = [];
  private closedTrades: ClosedTrade[] = [];
  private dailyPnl = 0;
  private dailyStartCapital: number;
  private tradeCount = 0;
  private winCount = 0;

  constructor(initialCapital: number) {
    this.initialCapital = initialCapital;
    this.currentCapital = initialCapital;
    this.peakCapital = initialCapital;
    this.dailyStartCapital = initialCapital;
    log.info(`Paper portfolio initialized: $${initialCapital.toFixed(2)}`);
  }

  // ── Trade Processing ──────────────────────────────────

  /**
   * Process a fill — opens a new position or closes an existing one (FIFO matching).
   * Returns the closed trade if a round-trip was completed.
   */
  processExecution(order: OrderMessage, fill: PaperFill): ClosedTrade | null {
    // Look for an opposite-side position to close (FIFO)
    const oppositeIdx = this.openPositions.findIndex(
      (p) => p.side !== order.action,
    );

    if (oppositeIdx !== -1) {
      return this.closePosition(oppositeIdx, order, fill);
    }

    // No match → open new position
    this.openPosition(order, fill);
    return null;
  }

  private openPosition(order: OrderMessage, fill: PaperFill): void {
    this.openPositions.push({
      orderId: fill.orderId,
      side: order.action,
      price: fill.fillPrice,
      quantity: fill.fillQuantity,
      fee: fill.fee,
      timestamp: fill.timestamp,
      gridLevel: order.gridLevel,
      strategy: order.strategy,
    });

    log.info(
      `Opened ${order.action.toUpperCase()} position: ` +
        `${fill.fillQuantity.toFixed(4)} SOL @ $${fill.fillPrice.toFixed(2)} ` +
        `(grid L${order.gridLevel ?? '?'})`,
    );
  }

  private closePosition(
    entryIdx: number,
    exitOrder: OrderMessage,
    exitFill: PaperFill,
  ): ClosedTrade {
    const entry = this.openPositions[entryIdx];
    const qty = Math.min(entry.quantity, exitFill.fillQuantity);
    const totalFees = entry.fee + exitFill.fee;

    const { pnl, pnlPct } = calculatePnL(
      entry.side,
      entry.price,
      exitFill.fillPrice,
      qty,
      totalFees,
    );

    // Update capital
    this.currentCapital += pnl;
    this.dailyPnl += pnl;
    if (this.currentCapital > this.peakCapital) {
      this.peakCapital = this.currentCapital;
    }

    this.tradeCount++;
    if (pnl > 0) this.winCount++;

    const trade: ClosedTrade = {
      entryOrderId: entry.orderId,
      exitOrderId: exitFill.orderId,
      side: entry.side,
      entryPrice: entry.price,
      exitPrice: exitFill.fillPrice,
      quantity: qty,
      pnl: roundTo(pnl, 4),
      pnlPct: roundTo(pnlPct, 2),
      fees: roundTo(totalFees, 4),
      durationMs: exitFill.timestamp - entry.timestamp,
      strategy: entry.strategy,
    };

    // Remove closed position
    this.openPositions.splice(entryIdx, 1);

    const pnlSign = pnl >= 0 ? '+' : '';
    log.info(
      `Closed ${entry.side.toUpperCase()} trade: ` +
        `$${entry.price.toFixed(2)} → $${exitFill.fillPrice.toFixed(2)} | ` +
        `P&L: ${pnlSign}$${pnl.toFixed(4)} (${pnlSign}${pnlPct.toFixed(2)}%) | ` +
        `Fees: $${totalFees.toFixed(4)}`,
    );

    return trade;
  }

  // ── State Accessors ───────────────────────────────────

  /**
   * Portfolio state for the risk engine (matches PortfolioState interface)
   */
  getState(): PortfolioState {
    const openValue = this.openPositions.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0,
    );

    const totalPnl = this.currentCapital - this.initialCapital;
    const drawdownFromPeak =
      this.peakCapital > 0
        ? ((this.peakCapital - this.currentCapital) / this.peakCapital) * 100
        : 0;

    const dailyPnlPct =
      this.dailyStartCapital > 0
        ? (this.dailyPnl / this.dailyStartCapital) * 100
        : 0;

    return {
      totalCapital: roundTo(this.currentCapital, 2),
      currentDrawdownPct: roundTo(Math.max(0, drawdownFromPeak), 2),
      dailyPnlPct: roundTo(dailyPnlPct, 2),
      openPositionCount: this.openPositions.length,
      openPositionValue: roundTo(openValue, 2),
    };
  }

  /**
   * Human-readable summary for dashboard / Telegram
   */
  getSummary(): {
    totalCapital: number;
    currentCapital: number;
    totalPnl: number;
    totalPnlPct: number;
    dailyPnl: number;
    dailyPnlPct: number;
    winRate: number;
    totalTrades: number;
    openPositionCount: number;
    openPositionValue: number;
  } {
    const state = this.getState();
    const totalPnl = this.currentCapital - this.initialCapital;
    const totalPnlPct =
      this.initialCapital > 0 ? (totalPnl / this.initialCapital) * 100 : 0;
    const dailyPnlPct =
      this.dailyStartCapital > 0
        ? (this.dailyPnl / this.dailyStartCapital) * 100
        : 0;
    const winRate =
      this.tradeCount > 0 ? (this.winCount / this.tradeCount) * 100 : 0;

    return {
      totalCapital: this.initialCapital,
      currentCapital: roundTo(this.currentCapital, 2),
      totalPnl: roundTo(totalPnl, 2),
      totalPnlPct: roundTo(totalPnlPct, 2),
      dailyPnl: roundTo(this.dailyPnl, 2),
      dailyPnlPct: roundTo(dailyPnlPct, 2),
      winRate: roundTo(winRate, 1),
      totalTrades: this.tradeCount,
      openPositionCount: state.openPositionCount,
      openPositionValue: state.openPositionValue,
    };
  }

  /**
   * Reset daily P&L at midnight UTC
   */
  resetDailyPnl(): void {
    log.info(
      `Daily P&L reset. Previous: $${this.dailyPnl.toFixed(2)} | ` +
        `Capital: $${this.currentCapital.toFixed(2)}`,
    );
    this.dailyPnl = 0;
    this.dailyStartCapital = this.currentCapital;
  }

  /** Open position count */
  get positions(): number {
    return this.openPositions.length;
  }
}
