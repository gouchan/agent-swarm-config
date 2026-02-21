/**
 * ASCII Grid Snapshot Renderer
 *
 * Prints a grid visualization INLINE with the logs —
 * only when something interesting happens:
 * - Price enters a buy/sell zone (within 1% of a grid level)
 * - Signal recommendation changes (neutral → buy, etc.)
 * - A grid level gets filled
 * - Risk alert fires
 *
 * Does NOT take over the screen. Just drops a snapshot
 * into the log stream so you can see where price sits.
 */

import type { GridLevel } from '../utils/math.js';
import type { SignalMessage } from '../bus/types.js';

// ─── ANSI Colors ─────────────────────────────────────────

const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgCyan: '\x1b[46m',
};

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

// ─── Grid Snapshot ───────────────────────────────────────

export interface GridSnapshot {
  price: number;
  grid: GridLevel[];
  signal: SignalMessage | null;
  reason: string;
}

/**
 * Render a compact grid snapshot that prints inline with logs.
 * Shows the grid levels, where price is, and why this snapshot was triggered.
 */
export function renderGridSnapshot(snapshot: GridSnapshot): string {
  const { price, grid, signal, reason } = snapshot;
  const lines: string[] = [];

  const W = 60;
  const border = '─'.repeat(W);

  lines.push('');
  lines.push(`${C.cyan}${C.bold} ┌${border}┐${C.reset}`);
  lines.push(`${C.cyan}${C.bold} │${C.reset}  ${C.bold}📊 GRID SNAPSHOT${C.reset}  ${C.dim}${reason}${C.reset}`);
  lines.push(`${C.cyan}${C.bold} │${C.reset}  ${C.bold}${formatPrice(price)}${C.reset}  ${signal ? `${signalColor(signal.recommendation)}${signalArrow(signal.recommendation)} ${signal.recommendation.toUpperCase()}${C.reset} (${(signal.confidence * 100).toFixed(0)}%)` : `${C.dim}waiting${C.reset}`}`);
  lines.push(`${C.cyan}${C.bold} ├${border}┤${C.reset}`);

  if (grid.length === 0) {
    lines.push(`${C.cyan}${C.bold} │${C.reset}  ${C.dim}No grid levels yet${C.reset}`);
  } else {
    // Sort grid by price descending
    const sorted = [...grid].sort((a, b) => b.price - a.price);

    for (const level of sorted) {
      const priceDiff = ((level.price - price) / price) * 100;
      const distance = Math.abs(priceDiff);
      const sideColor = level.side === 'sell' ? C.red : C.green;
      const side = level.side === 'sell' ? 'SELL' : ' BUY';

      // Proximity bar — closer = more filled
      const barWidth = 20;
      const barFill = Math.max(0, Math.min(barWidth, Math.round((1 - distance / 15) * barWidth)));
      const barEmpty = barWidth - barFill;
      const bar = `${sideColor}${'█'.repeat(barFill)}${C.dim}${'░'.repeat(barEmpty)}${C.reset}`;

      // Highlight if within 1% (hot zone)
      const hot = distance < 1.0;
      const hotMark = hot ? ` ${C.bgYellow}${C.bold} ◄ CLOSE ${C.reset}` : '';
      const filledMark = level.filled ? ` ${C.bold}${C.green}✓${C.reset}` : '';

      const diffStr = `${priceDiff >= 0 ? '+' : ''}${priceDiff.toFixed(1)}%`;

      lines.push(
        `${C.cyan}${C.bold} │${C.reset}  ${sideColor}${side}${C.reset} ${C.bold}${formatPrice(level.price).padStart(9)}${C.reset}  ${bar}  ${C.dim}${diffStr.padStart(6)}${C.reset}${filledMark}${hotMark}`
      );

      // Insert price marker between appropriate levels
      const nextIdx = sorted.indexOf(level) + 1;
      if (nextIdx < sorted.length) {
        const nextLevel = sorted[nextIdx];
        if (price <= level.price && price >= nextLevel.price) {
          lines.push(
            `${C.cyan}${C.bold} │${C.reset}  ${C.bgBlue}${C.white}${C.bold}  ▶▶  ${formatPrice(price).padStart(9)}  ${'━'.repeat(20)}  PRICE  ${C.reset}`
          );
        }
      }
    }

    // Price below all levels
    const lowest = sorted[sorted.length - 1];
    if (price < lowest.price) {
      lines.push(
        `${C.cyan}${C.bold} │${C.reset}  ${C.bgBlue}${C.white}${C.bold}  ▶▶  ${formatPrice(price).padStart(9)}  ${'━'.repeat(20)}  PRICE  ${C.reset}`
      );
    }

    // Price above all levels — insert right after the header separator
    if (price > sorted[0].price) {
      const headerEnd = lines.findIndex(l => l.includes('├'));
      lines.splice(headerEnd + 1, 0,
        `${C.cyan}${C.bold} │${C.reset}  ${C.bgBlue}${C.white}${C.bold}  ▶▶  ${formatPrice(price).padStart(9)}  ${'━'.repeat(20)}  PRICE  ${C.reset}`
      );
    }
  }

  // Indicator summary line
  if (signal) {
    const ind = signal.indicators;
    const parts: string[] = [];

    const rsi = ind.rsi_value as number | undefined;
    if (rsi !== undefined) {
      const rc = rsi > 70 ? C.red : rsi < 30 ? C.green : C.yellow;
      parts.push(`${rc}RSI:${rsi.toFixed(0)}${C.reset}`);
    }

    const macdHist = ind.macd_histogram as number | undefined;
    if (macdHist !== undefined) {
      const mc = macdHist > 0 ? C.green : C.red;
      parts.push(`${mc}MACD:${macdHist > 0 ? '▲' : '▼'}${C.reset}`);
    }

    const stDir = ind.supertrend_direction as string | undefined;
    if (stDir !== undefined) {
      const sc = stDir === 'up' ? C.green : C.red;
      parts.push(`${sc}ST:${stDir === 'up' ? '▲' : '▼'}${C.reset}`);
    }

    const bbPos = ind.bollinger_percentB as number | undefined;
    if (bbPos !== undefined) {
      const bc = bbPos > 0.8 ? C.red : bbPos < 0.2 ? C.green : C.yellow;
      parts.push(`${bc}BB:${(bbPos * 100).toFixed(0)}%${C.reset}`);
    }

    const atr = ind.atr_value as number | undefined;
    if (atr !== undefined) {
      parts.push(`${C.cyan}ATR:$${atr.toFixed(2)}${C.reset}`);
    }

    if (parts.length > 0) {
      lines.push(`${C.cyan}${C.bold} ├${border}┤${C.reset}`);
      lines.push(`${C.cyan}${C.bold} │${C.reset}  ${parts.join('  ${C.dim}│${C.reset}  '.replace(/\$\{C\.dim\}/g, C.dim).replace(/\$\{C\.reset\}/g, C.reset))}`);
    }
  }

  lines.push(`${C.cyan}${C.bold} └${border}┘${C.reset}`);
  lines.push('');

  return lines.join('\n');
}

// ─── Helpers ─────────────────────────────────────────────

function signalColor(signal: string): string {
  switch (signal) {
    case 'strong_buy': return C.green + C.bold;
    case 'buy': return C.green;
    case 'neutral': return C.yellow;
    case 'sell': return C.red;
    case 'strong_sell': return C.red + C.bold;
    default: return C.dim;
  }
}

function signalArrow(signal: string): string {
  switch (signal) {
    case 'strong_buy': return '⬆⬆';
    case 'buy': return '▲';
    case 'neutral': return '─';
    case 'sell': return '▼';
    case 'strong_sell': return '⬇⬇';
    default: return '?';
  }
}
