/**
 * Executor Agent
 *
 * Listens for orders on Redis, simulates paper fills,
 * tracks portfolio P&L, and publishes execution confirmations.
 *
 * Pipeline: Signal → Optimizer → **Executor** → Dashboard/Telegram
 */

import type { MessageBus } from '../../bus/redis.js';
import type { BotConfig } from '../../config/default.js';
import type {
  BusMessage,
  OrderMessage,
  ExecutionMessage,
  CommandMessage,
  HeartbeatMessage,
} from '../../bus/types.js';
import { CHANNELS } from '../../bus/channels.js';
import { PaperPortfolio, simulateFill } from './paper-simulator.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('executor');

const REDIS_KEY = 'grid-bot:portfolio';
const HEARTBEAT_INTERVAL = 60_000;
const MIDNIGHT_CHECK_INTERVAL = 60_000;

/**
 * Boot the Executor Agent.
 * Subscribes to ORDERS, simulates fills, publishes EXECUTIONS.
 */
export async function startExecutorAgent(
  bus: MessageBus,
  config: BotConfig,
): Promise<void> {
  const startTime = Date.now();
  const portfolio = new PaperPortfolio(config.grid.capitalUsd);

  log.info('Executor Agent started');
  log.info(`Mode: ${config.paperTradeMode ? 'PAPER TRADE' : 'LIVE'}`);
  log.info(`Capital: $${config.grid.capitalUsd}`);

  // ── Persist initial state to Redis ────────────────────
  await bus.setState(REDIS_KEY, 'portfolio', portfolio.getState());
  await bus.setState(REDIS_KEY, 'summary', portfolio.getSummary());

  // ── Pause/resume support ────────────────────────────────
  let paused = false;

  await bus.subscribe(CHANNELS.COMMANDS, (message: BusMessage) => {
    if (message.type !== 'command') return;
    const cmd = message as CommandMessage;
    if (cmd.command === 'pause') {
      paused = true;
      log.warn('Executor PAUSED by command');
    } else if (cmd.command === 'resume') {
      paused = false;
      log.info('Executor RESUMED by command');
    }
  });

  // ── Subscribe to orders ───────────────────────────────
  await bus.subscribe(CHANNELS.ORDERS, async (message: BusMessage) => {
    if (message.type !== 'order') return;
    const order = message as OrderMessage;

    if (paused) {
      log.warn(`Order skipped (paused): ${order.action.toUpperCase()} ${order.quantity.toFixed(4)} SOL`);
      return;
    }

    log.info(
      `Received order: ${order.action.toUpperCase()} ` +
        `${order.quantity.toFixed(4)} SOL @ $${order.price.toFixed(2)} ` +
        `(grid L${order.gridLevel ?? '?'}, ${order.strategy})`,
    );

    // Paper mode: simulate the fill
    if (config.paperTradeMode) {
      const fill = simulateFill(order);

      log.info(
        `Paper fill: ${order.action.toUpperCase()} ` +
          `${fill.fillQuantity.toFixed(4)} SOL @ $${fill.fillPrice.toFixed(2)} ` +
          `(slippage: ${fill.slippageBps.toFixed(1)}bps, fee: $${fill.fee.toFixed(4)})`,
      );

      // Process in portfolio
      const closedTrade = portfolio.processExecution(order, fill);

      // Publish execution confirmation
      const execution: ExecutionMessage = {
        type: 'execution',
        timestamp: Date.now(),
        orderId: order.orderId,
        txSignature: `paper-${fill.orderId}-${Date.now()}`,
        status: 'confirmed',
        fillPrice: fill.fillPrice,
        fillQuantity: fill.fillQuantity,
        fees: fill.fee,
        metadata: {
          paper: true,
          action: order.action,
          slippageBps: fill.slippageBps,
          gridLevel: order.gridLevel,
          strategy: order.strategy,
          closedTrade: closedTrade ?? undefined,
        },
      };

      await bus.publish(CHANNELS.EXECUTIONS, execution);

      // Persist updated portfolio to Redis
      await bus.setState(REDIS_KEY, 'portfolio', portfolio.getState());
      await bus.setState(REDIS_KEY, 'summary', portfolio.getSummary());

      // Log portfolio snapshot
      const summary = portfolio.getSummary();
      const pnlSign = summary.totalPnl >= 0 ? '+' : '';
      log.info(
        `Portfolio: $${summary.currentCapital.toFixed(2)} | ` +
          `P&L: ${pnlSign}$${summary.totalPnl.toFixed(2)} (${pnlSign}${summary.totalPnlPct.toFixed(2)}%) | ` +
          `Win rate: ${summary.winRate.toFixed(0)}% | ` +
          `Trades: ${summary.totalTrades} | ` +
          `Open: ${summary.openPositionCount}`,
      );
    } else {
      // TODO: Live execution via Jupiter SDK (future)
      log.warn('Live execution not implemented — skipping order');
    }
  });

  // ── Heartbeat ─────────────────────────────────────────
  const heartbeatTimer = setInterval(async () => {
    try {
      const summary = portfolio.getSummary();
      const heartbeat: HeartbeatMessage = {
        type: 'heartbeat',
        timestamp: Date.now(),
        agent: 'executor',
        status: 'alive',
        uptime: Date.now() - startTime,
        lastAction: `Capital: $${summary.currentCapital.toFixed(2)} | Open: ${summary.openPositionCount}`,
      };
      await bus.publish(CHANNELS.HEARTBEAT, heartbeat);
    } catch (err) {
      log.error('Heartbeat publish failed', err);
    }
  }, HEARTBEAT_INTERVAL);

  // ── Daily P&L Reset (midnight UTC) ────────────────────
  let lastResetDate = new Date().toISOString().slice(0, 10);
  const midnightTimer = setInterval(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (today !== lastResetDate) {
      lastResetDate = today;
      portfolio.resetDailyPnl();
    }
  }, MIDNIGHT_CHECK_INTERVAL);

  // ── Graceful Shutdown ─────────────────────────────────
  const shutdown = () => {
    clearInterval(heartbeatTimer);
    clearInterval(midnightTimer);
    log.info('Executor Agent stopped');
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
