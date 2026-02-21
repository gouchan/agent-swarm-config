/**
 * Signal publishing logic
 *
 * Publishes structured signals to Redis when:
 * - Recommendation changes
 * - Confidence changes significantly
 * - Price changes significantly
 *
 * This prevents flooding Redis with duplicate neutral signals.
 */

import type { MessageBus } from '../../bus/redis.js';
import type { SignalMessage } from '../../bus/types.js';
import { CHANNELS } from '../../bus/channels.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('signal-pub');

/**
 * Publish a signal to Redis
 */
export async function publishSignal(
  bus: MessageBus,
  signal: SignalMessage
): Promise<void> {
  await bus.publish(CHANNELS.SIGNALS, signal);

  log.info(
    `Published signal: ${signal.recommendation} (confidence: ${signal.confidence.toFixed(2)}) @ ${signal.price.toFixed(4)}`
  );
}

/**
 * Determine if a signal should be published
 *
 * Prevents spam by only publishing when something meaningful changes:
 * - First signal (no previous)
 * - Recommendation changed (e.g., neutral → buy)
 * - Confidence changed by >15%
 * - Price changed by >1%
 */
export function shouldPublish(
  current: SignalMessage,
  previous: SignalMessage | null
): boolean {
  // Always publish first signal
  if (!previous) {
    log.debug('First signal - publishing');
    return true;
  }

  // Recommendation changed
  if (current.recommendation !== previous.recommendation) {
    log.debug(
      `Recommendation changed: ${previous.recommendation} → ${current.recommendation}`
    );
    return true;
  }

  // Confidence changed significantly (>15%)
  const confidenceDelta = Math.abs(current.confidence - previous.confidence);
  if (confidenceDelta > 0.15) {
    log.debug(
      `Confidence changed significantly: ${previous.confidence.toFixed(2)} → ${current.confidence.toFixed(2)} (Δ ${confidenceDelta.toFixed(2)})`
    );
    return true;
  }

  // Price changed significantly (>1%)
  const priceDelta = Math.abs(current.price - previous.price) / previous.price;
  if (priceDelta > 0.01) {
    log.debug(
      `Price changed significantly: ${previous.price.toFixed(4)} → ${current.price.toFixed(4)} (Δ ${(priceDelta * 100).toFixed(2)}%)`
    );
    return true;
  }

  log.debug('No significant change - skipping publish');
  return false;
}
