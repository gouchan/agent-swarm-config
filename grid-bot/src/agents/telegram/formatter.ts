/**
 * Telegram message formatter
 *
 * All functions return Markdown-formatted strings
 * for Telegram's parse_mode: 'Markdown'.
 */

import type { OrderMessage, RiskAlertMessage } from '../../bus/types.js';
import type { GridLevel } from '../../utils/math.js';

// ─── Types ────────────────────────────────────────────────

export interface PortfolioSummary {
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
}

// ─── Formatters ───────────────────────────────────────────

/**
 * Format a trade fill notification
 */
export function formatFill(
  order: OrderMessage,
  fillPrice: number,
  fillQty: number,
  fee: number,
): string {
  const emoji = order.action === 'buy' ? '🟢' : '🔴';
  const action = order.action.toUpperCase();
  const gridLabel = order.gridLevel !== undefined ? ` (L${order.gridLevel})` : '';

  return [
    `${emoji} *Grid ${action} Filled*`,
    `Price: $${fillPrice.toFixed(2)}${gridLabel}`,
    `Amount: ${fillQty.toFixed(4)} SOL`,
    `Fee: $${fee.toFixed(4)}`,
    `Strategy: ${order.strategy}`,
  ].join('\n');
}

/**
 * Format a signal change notification
 */
export function formatSignalChange(
  oldSignal: string,
  newSignal: string,
  price: number,
  confidence: number,
): string {
  const arrow = signalEmoji(newSignal);
  const pct = Math.round(confidence * 100);
  return `${arrow} Signal: ${oldSignal.toUpperCase()} → *${newSignal.toUpperCase()}* (${pct}%) @ $${price.toFixed(2)}`;
}

/**
 * Format a risk alert
 */
export function formatRiskAlert(alert: RiskAlertMessage): string {
  const severity: Record<string, string> = {
    info: 'i',
    warning: '⚠️',
    critical: '🚨',
  };
  const actionLabel: Record<string, string> = {
    notify: 'Monitor',
    pause: 'Paused trading',
    exit_all: 'Exiting all positions',
    shutdown: 'Emergency shutdown',
  };

  const lines = [
    `${severity[alert.severity] ?? '⚠️'} *RISK ALERT*`,
    alert.message,
  ];

  if (alert.currentDrawdown !== undefined && alert.threshold !== undefined) {
    lines.push(
      `Drawdown: ${alert.currentDrawdown.toFixed(2)}% (limit ${alert.threshold}%)`,
    );
  }

  lines.push(`Action: ${actionLabel[alert.action] ?? alert.action}`);
  return lines.join('\n');
}

/**
 * Format full status card (/status command)
 */
export function formatStatus(
  summary: PortfolioSummary,
  price: number,
  signal: string,
  confidence: number,
): string {
  const pSign = summary.totalPnl >= 0 ? '+' : '';
  const dSign = summary.dailyPnl >= 0 ? '+' : '';
  const pct = Math.round(confidence * 100);

  return [
    `🤖 *Phantom Grid Bot*`,
    ``,
    `*Market*`,
    `SOL/USDC: $${price.toFixed(2)}`,
    `Signal: ${signalEmoji(signal)} ${signal.toUpperCase()} (${pct}%)`,
    ``,
    `*Portfolio*`,
    `Capital: $${summary.currentCapital.toFixed(2)} / $${summary.totalCapital.toFixed(2)}`,
    `P&L: ${pSign}$${summary.totalPnl.toFixed(2)} (${pSign}${summary.totalPnlPct.toFixed(2)}%)`,
    `Daily: ${dSign}$${summary.dailyPnl.toFixed(2)} (${dSign}${summary.dailyPnlPct.toFixed(2)}%)`,
    ``,
    `*Trading*`,
    `Trades: ${summary.totalTrades} | Win: ${summary.winRate.toFixed(1)}%`,
    `Open: ${summary.openPositionCount} ($${summary.openPositionValue.toFixed(2)})`,
  ].join('\n');
}

/**
 * Format P&L summary (/pnl command)
 */
export function formatPnl(summary: PortfolioSummary): string {
  const pSign = summary.totalPnl >= 0 ? '+' : '';
  const dSign = summary.dailyPnl >= 0 ? '+' : '';
  const emoji = summary.totalPnl >= 0 ? '📈' : '📉';

  return [
    `${emoji} *P&L Summary*`,
    ``,
    `Total: ${pSign}$${summary.totalPnl.toFixed(2)} (${pSign}${summary.totalPnlPct.toFixed(2)}%)`,
    `Daily: ${dSign}$${summary.dailyPnl.toFixed(2)} (${dSign}${summary.dailyPnlPct.toFixed(2)}%)`,
    ``,
    `Trades: ${summary.totalTrades}`,
    `Win Rate: ${summary.winRate.toFixed(1)}%`,
    `Open: ${summary.openPositionCount} ($${summary.openPositionValue.toFixed(2)})`,
  ].join('\n');
}

/**
 * Format grid display (/grid command)
 */
export function formatGrid(grid: GridLevel[], price: number): string {
  const sorted = [...grid].sort((a, b) => b.price - a.price);
  const lines = [`📊 *Grid Levels* (price: $${price.toFixed(2)})`];

  for (const level of sorted) {
    const side = level.side === 'buy' ? '🟢 BUY' : '🔴 SELL';
    const filled = level.filled ? ' ✅' : '';
    const dist = (((level.price - price) / price) * 100).toFixed(1);
    const distStr = Number(dist) >= 0 ? `+${dist}%` : `${dist}%`;
    const hot = Math.abs(Number(dist)) < 1.0 ? ' 👈' : '';

    lines.push(
      `${side} L${level.index}: $${level.price.toFixed(2)} (${distStr})${filled}${hot}`,
    );
  }

  return lines.join('\n');
}

// ─── Helpers ──────────────────────────────────────────────

function signalEmoji(signal: string): string {
  switch (signal) {
    case 'strong_buy':
      return '⬆️⬆️';
    case 'buy':
      return '🟢';
    case 'neutral':
      return '➡️';
    case 'sell':
      return '🔴';
    case 'strong_sell':
      return '⬇️⬇️';
    default:
      return '❓';
  }
}
