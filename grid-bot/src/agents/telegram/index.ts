/**
 * Telegram Agent — entry point
 *
 * Boots the Telegram bot and subscribes to Redis channels
 * to push real-time notifications (fills, risk alerts, signal changes).
 *
 * OPTIONAL — bot works fine without TELEGRAM_BOT_TOKEN set.
 */

import type { MessageBus } from '../../bus/redis.js';
import type { BotConfig } from '../../config/default.js';
import type {
  BusMessage,
  ExecutionMessage,
  RiskAlertMessage,
  SignalMessage,
  HeartbeatMessage,
} from '../../bus/types.js';
import { CHANNELS } from '../../bus/channels.js';
import { createTelegramBot, type TelegramBotContext } from './bot.js';
import {
  formatFill,
  formatRiskAlert,
  formatSignalChange,
} from './formatter.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('telegram');

const HEARTBEAT_INTERVAL = 60_000;

/**
 * Start the Telegram bot agent.
 * If TELEGRAM_BOT_TOKEN is not set, logs a notice and returns.
 */
export async function startTelegramBot(
  bus: MessageBus,
  config: BotConfig,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    log.info('TELEGRAM_BOT_TOKEN not set — Telegram disabled');
    return;
  }

  const startTime = Date.now();
  const ctx: TelegramBotContext = createTelegramBot(token, bus);
  let lastRecommendation = '';

  log.info('Telegram Agent started');

  // ── Subscribe to executions → push fill alerts ────────
  await bus.subscribe(CHANNELS.EXECUTIONS, async (message: BusMessage) => {
    if (message.type !== 'execution') return;
    const exec = message as ExecutionMessage;
    if (exec.status !== 'confirmed') return;

    const meta = exec.metadata as Record<string, unknown> | undefined;
    const text = formatFill(
      {
        type: 'order',
        timestamp: exec.timestamp,
        orderId: exec.orderId,
        pair: 'SOL/USDC',
        action: (meta?.action as 'buy' | 'sell') ?? 'buy',
        price: exec.fillPrice ?? 0,
        quantity: exec.fillQuantity ?? 0,
        slippageBps: 0,
        strategy: (meta?.strategy as 'grid' | 'breakout' | 'momentum') ?? 'grid',
        gridLevel: meta?.gridLevel as number | undefined,
      },
      exec.fillPrice ?? 0,
      exec.fillQuantity ?? 0,
      exec.fees ?? 0,
    );

    await ctx.sendMessage(text);
  });

  // ── Subscribe to risk alerts ──────────────────────────
  await bus.subscribe(CHANNELS.RISK_ALERTS, async (message: BusMessage) => {
    if (message.type !== 'risk_alert') return;
    const alert = message as RiskAlertMessage;
    await ctx.sendMessage(formatRiskAlert(alert));
  });

  // ── Subscribe to signals → push on recommendation change
  await bus.subscribe(CHANNELS.SIGNALS, async (message: BusMessage) => {
    if (message.type !== 'signal') return;
    const signal = message as SignalMessage;

    if (lastRecommendation && signal.recommendation !== lastRecommendation) {
      const text = formatSignalChange(
        lastRecommendation,
        signal.recommendation,
        signal.price,
        signal.confidence,
      );
      await ctx.sendMessage(text);
    }

    lastRecommendation = signal.recommendation;
  });

  // ── Heartbeat ─────────────────────────────────────────
  const heartbeatTimer = setInterval(async () => {
    try {
      const heartbeat: HeartbeatMessage = {
        type: 'heartbeat',
        timestamp: Date.now(),
        agent: 'telegram',
        status: 'alive',
        uptime: Date.now() - startTime,
        lastAction: ctx.chatId ? `chat: ${ctx.chatId}` : 'awaiting /start',
      };
      await bus.publish(CHANNELS.HEARTBEAT, heartbeat);
    } catch (err) {
      log.error('Heartbeat publish failed', err);
    }
  }, HEARTBEAT_INTERVAL);

  // ── Graceful shutdown ─────────────────────────────────
  const shutdown = () => {
    clearInterval(heartbeatTimer);
    ctx.stop();
    log.info('Telegram Agent stopped');
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
