/**
 * Signal Agent
 *
 * Continuously monitors price and computes technical indicators,
 * publishing actionable signals to the message bus for the Optimizer.
 *
 * Loop:
 * 1. Fetch current price + recent OHLCV from Birdeye
 * 2. Compute all active indicators
 * 3. Build consolidated signal
 * 4. Publish if signal changed meaningfully
 * 5. Send heartbeat
 * 6. Sleep and repeat
 */

import type { MessageBus } from '../../bus/redis.js';
import type { BotConfig } from '../../config/default.js';
import type { SignalMessage } from '../../bus/types.js';
import { CHANNELS } from '../../bus/channels.js';
import { getBus } from '../../bus/redis.js';
import { getEngine } from '../../indicators/engine.js';
import { getCurrentPrice, getHistoricalOHLCV } from './price-feed.js';
import { publishSignal, shouldPublish } from './alert-publisher.js';
import { getPair } from '../../config/pairs.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('signal');

// Track last published signal to prevent spam
let lastPublishedSignal: SignalMessage | null = null;

// Track uptime for heartbeat
let startTime = Date.now();

/**
 * Main Signal Agent loop
 */
export async function startSignalAgent(
  bus: MessageBus,
  config: BotConfig
): Promise<void> {
  log.info('Signal Agent starting...', {
    pair: config.grid.pair,
    pollInterval: config.signalPollIntervalMs,
    activeIndicators: config.strategy.activeIndicators,
  });

  const pair = getPair(config.grid.pair);
  const engine = getEngine();

  // For graceful shutdown
  let running = true;
  process.on('SIGINT', () => {
    log.info('SIGINT received, shutting down...');
    running = false;
  });
  process.on('SIGTERM', () => {
    log.info('SIGTERM received, shutting down...');
    running = false;
  });

  while (running) {
    try {
      // Step 1: Get current price
      const price = await getCurrentPrice(pair.base.mint);
      log.info(`SOL/USDC: $${price.toFixed(2)}`);

      // Brief pause between API calls to respect Birdeye rate limits
      await sleep(1500);

      // Step 2: Get recent OHLCV (last 100 candles of 15m data = ~25 hours)
      // Calculate days needed for 100 candles: 100 candles * 15m = 1500 min = ~1.05 days
      // Add buffer for safety
      const candles = await getHistoricalOHLCV(pair.base.mint, 2);

      // Take last 100 candles
      const recentCandles = candles.slice(-100);

      if (recentCandles.length === 0) {
        log.warn('No OHLCV data available, skipping cycle');
        await sleep(config.signalPollIntervalMs);
        continue;
      }

      log.debug(`Processing ${recentCandles.length} candles`);

      // Step 3: Run indicator engine
      const result = engine.computeAll(
        recentCandles,
        config.strategy.activeIndicators
      );

      // Step 4: Build SignalMessage
      const signal: SignalMessage = {
        type: 'signal',
        timestamp: Date.now(),
        pair: config.grid.pair,
        price,
        indicators: extractIndicatorValues(result.indicators),
        recommendation: result.consensus.signal,
        confidence: result.consensus.confidence,
        metadata: {
          buyCount: result.consensus.buyCount,
          sellCount: result.consensus.sellCount,
          neutralCount: result.consensus.neutralCount,
          candleCount: recentCandles.length,
        },
      };

      // Step 5: Publish if changed
      if (shouldPublish(signal, lastPublishedSignal)) {
        await publishSignal(bus, signal);
        lastPublishedSignal = signal;
      } else {
        log.debug(
          `No significant change (${signal.recommendation}, confidence: ${signal.confidence.toFixed(2)})`
        );
      }

      // Step 6: Send heartbeat
      await bus.publish(CHANNELS.HEARTBEAT, {
        type: 'heartbeat',
        timestamp: Date.now(),
        agent: 'signal',
        status: 'alive',
        uptime: Date.now() - startTime,
        lastAction: `Processed signal: ${signal.recommendation}`,
      });
    } catch (err) {
      log.error('Signal Agent cycle failed', err);

      // Send error heartbeat
      await bus.publish(CHANNELS.HEARTBEAT, {
        type: 'heartbeat',
        timestamp: Date.now(),
        agent: 'signal',
        status: 'error',
        uptime: Date.now() - startTime,
        lastAction: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    // Step 7: Sleep and loop
    await sleep(config.signalPollIntervalMs);
  }

  log.info('Signal Agent stopped');
}

/**
 * Extract indicator values from engine result into flat structure
 */
function extractIndicatorValues(
  indicators: Record<string, { values: Record<string, number> }>
): Record<string, unknown> {
  const values: Record<string, unknown> = {};

  for (const [name, output] of Object.entries(indicators)) {
    // Flatten indicator values
    for (const [key, value] of Object.entries(output.values)) {
      values[`${name}_${key}`] = value;
    }
  }

  return values;
}

/**
 * Sleep helper
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
