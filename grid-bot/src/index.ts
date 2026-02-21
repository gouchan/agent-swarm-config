/**
 * Phantom Grid Bot — Main Entry Point
 *
 * Boots all agents and connects them via Redis pub/sub.
 * Run with: npm run dev
 */

import 'dotenv/config';
import { getBus } from './bus/redis.js';
import { CHANNELS } from './bus/channels.js';
import { DEFAULT_CONFIG } from './config/default.js';
import { getRiskProfile } from './config/risk-profiles.js';
import { loadOrCreateKeypair, getConnection, getSolBalance, getTokenBalance, shortAddress } from './utils/solana.js';
import { logger } from './utils/logger.js';
import { TOKENS } from './config/pairs.js';
import { startSignalAgent } from './agents/signal/index.js';
import { startOptimizerAgent } from './agents/optimizer/index.js';
import { startExecutorAgent } from './agents/executor/index.js';
import { startTelegramBot } from './agents/telegram/index.js';
import { startDashboard, stopDashboard } from './dashboard/index.js';

const log = logger.withContext('main');

async function main() {
  log.info('═══════════════════════════════════════════');
  log.info('  PHANTOM GRID BOT v0.1.0');
  log.info('  Multi-Agent Adaptive Grid Trading System');
  log.info('═══════════════════════════════════════════');

  // Load config
  const config = { ...DEFAULT_CONFIG };
  config.paperTradeMode = process.env.PAPER_TRADE_MODE !== 'false';
  config.riskProfile = (process.env.DEFAULT_RISK_PROFILE as typeof config.riskProfile) || 'low';

  const risk = getRiskProfile(config.riskProfile);
  log.info(`Risk Profile: ${risk.name} (${config.riskProfile})`);
  log.info(`Mode: ${config.paperTradeMode ? '📋 PAPER TRADE' : '🔴 LIVE TRADING'}`);
  log.info(`Strategy: ${config.strategy.mode}`);
  log.info(`Pair: ${config.grid.pair}`);

  // Load wallet
  const keypair = loadOrCreateKeypair();
  const connection = getConnection();
  const solBalance = await getSolBalance(connection, keypair.publicKey);
  const usdcBalance = await getTokenBalance(connection, keypair.publicKey, TOKENS.USDC.mint);

  log.info(`Wallet: ${shortAddress(keypair.publicKey.toBase58())}`);
  log.info(`Balance: ${solBalance.toFixed(4)} SOL | ${usdcBalance.toFixed(2)} USDC`);

  if (!config.paperTradeMode && solBalance < 0.01) {
    log.error('Insufficient SOL for transaction fees. Fund the wallet first.');
    process.exit(1);
  }

  // Connect to Redis
  const bus = getBus(process.env.REDIS_URL);
  await bus.connect();

  log.info('Message bus connected');
  log.info('');
  log.info('Agents starting...');
  log.info('  📡 Signal Agent   — watching market data');
  log.info('  🧠 Optimizer      — strategy + risk management');
  log.info('  ⚡ Executor       — paper trade execution');
  log.info('  📱 Telegram       — push notifications');
  log.info('');

  // Boot Signal Agent — polls Birdeye, computes indicators, publishes signals
  startSignalAgent(bus, config).catch((err) => {
    log.error('Signal Agent crashed', err);
  });

  // Boot Optimizer Agent — receives signals, manages grid + risk, proposes orders
  startOptimizerAgent(bus, config).catch((err) => {
    log.error('Optimizer Agent crashed', err);
  });

  // Boot Executor Agent — picks up orders, simulates paper fills, tracks P&L
  startExecutorAgent(bus, config).catch((err) => {
    log.error('Executor Agent crashed', err);
  });

  // Boot Telegram Bot — push notifications to phone (optional, needs TELEGRAM_BOT_TOKEN)
  startTelegramBot(bus, config).catch((err) => {
    log.error('Telegram Bot crashed', err);
  });

  log.info('Grid bot is running. Press Ctrl+C to stop.');
  log.info(`Active indicators: ${config.strategy.activeIndicators.join(', ')}`);
  log.info(`Pipeline: Signal → Optimizer → Executor → Dashboard/Telegram`);

  // Start dashboard — listens to Redis and prints grid snapshots
  // on key events (signal change, hot zone, fills, risk alerts).
  // Coexists with normal log output — doesn't take over the screen.
  const noDashboard = process.argv.includes('--no-dashboard');
  if (!noDashboard) {
    await startDashboard(bus, config);
  }

  // Graceful shutdown
  process.on('SIGINT', async () => {
    stopDashboard();
    log.warn('Shutting down...');
    await bus.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    stopDashboard();
    log.warn('Shutting down...');
    await bus.disconnect();
    process.exit(0);
  });

  // Keep alive
  await new Promise(() => {});
}

main().catch((err) => {
  log.error('Fatal error', err);
  process.exit(1);
});
