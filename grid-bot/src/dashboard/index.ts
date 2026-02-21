/**
 * Dashboard Controller (Event-Driven)
 *
 * Listens to Redis channels and prints a grid snapshot ONLY when
 * something interesting happens. Normal agent logs remain the
 * primary view — the dashboard just drops in when it matters.
 *
 * Triggers:
 * 1. Signal recommendation changes (neutral → buy, buy → sell, etc.)
 * 2. Price enters a "hot zone" (within 1% of a grid level)
 * 3. A grid level gets filled (order published)
 * 4. Risk alert fires (drawdown warning, kill switch)
 * 5. First signal (initial grid setup)
 */

import type { MessageBus } from '../bus/redis.js';
import type { BotConfig } from '../config/default.js';
import type { BusMessage, SignalMessage, OrderMessage, ExecutionMessage, RiskAlertMessage } from '../bus/types.js';
import { CHANNELS } from '../bus/channels.js';
import type { GridLevel } from '../utils/math.js';
import { calculateGridLevels } from '../utils/math.js';
import { renderGridSnapshot, type GridSnapshot } from './renderer.js';
import { logger } from '../utils/logger.js';

const log = logger.withContext('dashboard');

const SIGNAL_KEY = 'grid-bot:signal';

// ─── State Tracking ──────────────────────────────────────

let lastRecommendation: string = '';
let lastHotLevel: number | null = null;
let currentGrid: GridLevel[] = [];
let currentSignal: SignalMessage | null = null;
let isFirstSignal = true;

/**
 * Check if price is within threshold % of any grid level
 */
function findHotLevel(price: number, grid: GridLevel[], thresholdPct: number = 1.0): GridLevel | null {
  for (const level of grid) {
    const distance = Math.abs((level.price - price) / price) * 100;
    if (distance < thresholdPct && !level.filled) {
      return level;
    }
  }
  return null;
}

/**
 * Print the grid snapshot to stdout (inline with logs)
 */
function flashGrid(reason: string): void {
  const snapshot: GridSnapshot = {
    price: currentSignal?.price ?? 0,
    grid: currentGrid,
    signal: currentSignal,
    reason,
  };

  const output = renderGridSnapshot(snapshot);
  process.stdout.write(output);
}

/**
 * Start the event-driven dashboard
 */
export async function startDashboard(bus: MessageBus, config: BotConfig): Promise<void> {
  log.info('Dashboard active — grid snapshots on key events');

  // Subscribe to signals
  await bus.subscribe(CHANNELS.SIGNALS, async (message: BusMessage) => {
    if (message.type !== 'signal') return;
    const signal = message as SignalMessage;
    currentSignal = signal;

    // Recalculate grid from current price
    currentGrid = calculateGridLevels(
      signal.price,
      config.grid.gridSpacingPct,
      config.grid.gridLevels,
      config.grid.capitalUsd,
    );

    // Persist signal + grid to Redis for Telegram commands
    await bus.setState(SIGNAL_KEY, 'latest', {
      price: signal.price,
      recommendation: signal.recommendation,
      confidence: signal.confidence,
      grid: currentGrid,
    }).catch(() => {});

    // Trigger 1: First signal ever — show initial grid
    if (isFirstSignal) {
      isFirstSignal = false;
      flashGrid('Initial grid setup');
      lastRecommendation = signal.recommendation;
      return;
    }

    // Trigger 2: Recommendation changed
    if (signal.recommendation !== lastRecommendation) {
      const change = `${lastRecommendation} → ${signal.recommendation}`;
      lastRecommendation = signal.recommendation;
      flashGrid(`Signal changed: ${change}`);
      return;
    }
    lastRecommendation = signal.recommendation;

    // Trigger 3: Price entering a hot zone (within 1% of a grid level)
    const hotLevel = findHotLevel(signal.price, currentGrid);
    if (hotLevel) {
      const hotIndex = hotLevel.index;
      // Only flash if we entered a NEW hot zone (not the same one)
      if (lastHotLevel !== hotIndex) {
        lastHotLevel = hotIndex;
        const side = hotLevel.side.toUpperCase();
        const dist = (((hotLevel.price - signal.price) / signal.price) * 100).toFixed(2);
        flashGrid(`Approaching ${side} L${Math.abs(hotIndex)} (${dist}% away)`);
        return;
      }
    } else {
      // Left the hot zone
      lastHotLevel = null;
    }
  });

  // Subscribe to orders — a grid level got filled
  await bus.subscribe(CHANNELS.ORDERS, (message: BusMessage) => {
    if (message.type !== 'order') return;
    const order = message as OrderMessage;

    // Mark the grid level as filled
    if (order.gridLevel !== undefined) {
      const level = currentGrid.find(l => l.index === order.gridLevel);
      if (level) level.filled = true;
    }

    flashGrid(`Order: ${order.action.toUpperCase()} @ ${formatPrice(order.price)} (${order.strategy})`);
  });

  // Subscribe to executions — a trade was confirmed
  await bus.subscribe(CHANNELS.EXECUTIONS, (message: BusMessage) => {
    if (message.type !== 'execution') return;
    const exec = message as ExecutionMessage;
    if (exec.status !== 'confirmed') return;

    // Mark the grid level as filled
    const meta = exec.metadata as Record<string, unknown> | undefined;
    const gridLevel = meta?.gridLevel as number | undefined;
    if (gridLevel !== undefined) {
      const level = currentGrid.find(l => l.index === gridLevel);
      if (level) level.filled = true;
    }

    const side = (meta?.strategy === 'grid' ? 'GRID' : 'BREAKOUT');
    const pnlSign = exec.fees !== undefined ? `-$${exec.fees.toFixed(4)} fee` : '';
    flashGrid(
      `✅ FILLED: ${side} @ $${(exec.fillPrice ?? 0).toFixed(2)} (${(exec.fillQuantity ?? 0).toFixed(4)} SOL) ${pnlSign}`,
    );
  });

  // Subscribe to risk alerts
  await bus.subscribe(CHANNELS.RISK_ALERTS, (message: BusMessage) => {
    if (message.type !== 'risk_alert') return;
    const alert = message as RiskAlertMessage;
    flashGrid(`⚠️  RISK: ${alert.message}`);
  });
}

/**
 * Stop the dashboard (cleanup)
 */
export function stopDashboard(): void {
  currentGrid = [];
  currentSignal = null;
  lastRecommendation = '';
  lastHotLevel = null;
  isFirstSignal = true;
}

function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}
