/**
 * Telegram Bot — command handlers
 *
 * Creates the bot, registers slash commands, and exposes
 * a sendMessage helper for push notifications.
 */

import TelegramBot from 'node-telegram-bot-api';
import type { MessageBus } from '../../bus/redis.js';
import type { CommandMessage } from '../../bus/types.js';
import type { GridLevel } from '../../utils/math.js';
import type { PortfolioSummary } from './formatter.js';
import {
  formatStatus,
  formatPnl,
  formatGrid,
} from './formatter.js';
import { CHANNELS } from '../../bus/channels.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('telegram-bot');

const REDIS_KEY = 'grid-bot:portfolio';
const SIGNAL_KEY = 'grid-bot:signal';

export interface TelegramBotContext {
  bot: TelegramBot;
  chatId: number | null;
  sendMessage: (text: string) => Promise<void>;
  stop: () => void;
}

/**
 * Create bot instance and register command handlers.
 * Returns context with sendMessage helper.
 */
export function createTelegramBot(
  token: string,
  bus: MessageBus,
): TelegramBotContext {
  const bot = new TelegramBot(token, { polling: true });
  let chatId: number | null = null;

  log.info('Telegram bot created, polling for messages...');

  // ── Send helper ─────────────────────────────────────
  async function sendMessage(text: string): Promise<void> {
    if (!chatId) {
      log.debug('No chat ID yet — message queued until first /start');
      return;
    }
    try {
      await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
    } catch (err) {
      log.error('Failed to send Telegram message', err);
    }
  }

  // ── /start ──────────────────────────────────────────
  bot.onText(/\/start/, (msg) => {
    chatId = msg.chat.id;
    log.info(`Chat ID set: ${chatId}`);
    bot.sendMessage(
      chatId,
      [
        '🤖 *Phantom Grid Bot* connected!',
        '',
        'Commands:',
        '/status — Full bot status',
        '/pnl — P&L summary',
        '/grid — Current grid levels',
        '/pause — Pause trading',
        '/resume — Resume trading',
        '/help — Show commands',
      ].join('\n'),
      { parse_mode: 'Markdown' },
    );
  });

  // ── /status ─────────────────────────────────────────
  bot.onText(/\/status/, async (msg) => {
    chatId = msg.chat.id;
    try {
      const summary = await bus.getState<PortfolioSummary>(REDIS_KEY, 'summary');
      const signal = await bus.getState<{
        price: number;
        recommendation: string;
        confidence: number;
      }>(SIGNAL_KEY, 'latest');

      if (!summary) {
        await sendMessage('No portfolio data yet. Bot may still be starting.');
        return;
      }

      const text = formatStatus(
        summary,
        signal?.price ?? 0,
        signal?.recommendation ?? 'unknown',
        signal?.confidence ?? 0,
      );
      await sendMessage(text);
    } catch (err) {
      log.error('/status error', err);
      await sendMessage('Error fetching status.');
    }
  });

  // ── /pnl ────────────────────────────────────────────
  bot.onText(/\/pnl/, async (msg) => {
    chatId = msg.chat.id;
    try {
      const summary = await bus.getState<PortfolioSummary>(REDIS_KEY, 'summary');
      if (!summary) {
        await sendMessage('No P&L data yet.');
        return;
      }
      await sendMessage(formatPnl(summary));
    } catch (err) {
      log.error('/pnl error', err);
      await sendMessage('Error fetching P&L.');
    }
  });

  // ── /grid ───────────────────────────────────────────
  bot.onText(/\/grid/, async (msg) => {
    chatId = msg.chat.id;
    try {
      const signal = await bus.getState<{
        price: number;
        grid: GridLevel[];
      }>(SIGNAL_KEY, 'latest');

      if (!signal || !signal.grid) {
        await sendMessage('No grid data yet. Waiting for first signal.');
        return;
      }
      await sendMessage(formatGrid(signal.grid, signal.price));
    } catch (err) {
      log.error('/grid error', err);
      await sendMessage('Error fetching grid.');
    }
  });

  // ── /pause ──────────────────────────────────────────
  bot.onText(/\/pause/, async (msg) => {
    chatId = msg.chat.id;
    const cmd: CommandMessage = {
      type: 'command',
      timestamp: Date.now(),
      command: 'pause',
      source: 'telegram',
    };
    await bus.publish(CHANNELS.COMMANDS, cmd);
    await sendMessage('⏸ Trading paused.');
  });

  // ── /resume ─────────────────────────────────────────
  bot.onText(/\/resume/, async (msg) => {
    chatId = msg.chat.id;
    const cmd: CommandMessage = {
      type: 'command',
      timestamp: Date.now(),
      command: 'resume',
      source: 'telegram',
    };
    await bus.publish(CHANNELS.COMMANDS, cmd);
    await sendMessage('▶️ Trading resumed.');
  });

  // ── /help ───────────────────────────────────────────
  bot.onText(/\/help/, async (msg) => {
    chatId = msg.chat.id;
    await sendMessage(
      [
        '*Available Commands:*',
        '/status — Full bot status + market info',
        '/pnl — P&L summary (total + daily)',
        '/grid — Current grid levels + price',
        '/pause — Pause all trading',
        '/resume — Resume trading',
        '/help — This message',
      ].join('\n'),
    );
  });

  // ── Stop helper ─────────────────────────────────────
  function stop(): void {
    bot.stopPolling();
    log.info('Telegram bot stopped');
  }

  return { bot, chatId, sendMessage, stop };
}
