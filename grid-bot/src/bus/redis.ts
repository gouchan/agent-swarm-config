/**
 * Redis pub/sub client for inter-agent communication
 *
 * Uses two separate ioredis connections:
 * - publisher: for publishing messages
 * - subscriber: for subscribing to channels
 *
 * Redis requires separate connections for pub/sub because
 * a subscribed client can only receive messages, not publish.
 */

import Redis from 'ioredis';
import { CHANNELS, type Channel } from './channels.js';
import type { BusMessage } from './types.js';
import { logger } from '../utils/logger.js';

export class MessageBus {
  private publisher: Redis;
  private subscriber: Redis;
  private handlers: Map<string, ((message: BusMessage) => void)[]> = new Map();
  private connected = false;

  constructor(redisUrl: string = 'redis://localhost:6379') {
    this.publisher = new Redis(redisUrl, { lazyConnect: true });
    this.subscriber = new Redis(redisUrl, { lazyConnect: true });
  }

  async connect(): Promise<void> {
    if (this.connected) return;

    await Promise.all([
      this.publisher.connect(),
      this.subscriber.connect(),
    ]);

    this.subscriber.on('message', (channel: string, data: string) => {
      try {
        const message = JSON.parse(data) as BusMessage;
        const channelHandlers = this.handlers.get(channel) || [];
        for (const handler of channelHandlers) {
          handler(message);
        }
      } catch (err) {
        logger.error(`Failed to parse message on ${channel}`, err);
      }
    });

    this.connected = true;
    logger.info('MessageBus connected to Redis');
  }

  async publish(channel: Channel, message: BusMessage): Promise<void> {
    const data = JSON.stringify(message);
    await this.publisher.publish(channel, data);
    logger.debug(`Published to ${channel}`, { type: message.type });
  }

  async subscribe(
    channel: Channel,
    handler: (message: BusMessage) => void
  ): Promise<void> {
    const existing = this.handlers.get(channel) || [];
    existing.push(handler);
    this.handlers.set(channel, existing);

    if (existing.length === 1) {
      await this.subscriber.subscribe(channel);
      logger.debug(`Subscribed to ${channel}`);
    }
  }

  async unsubscribe(channel: Channel): Promise<void> {
    this.handlers.delete(channel);
    await this.subscriber.unsubscribe(channel);
    logger.debug(`Unsubscribed from ${channel}`);
  }

  /** Get/set shared state via Redis hash */
  async setState(key: string, field: string, value: unknown): Promise<void> {
    await this.publisher.hset(key, field, JSON.stringify(value));
  }

  async getState<T>(key: string, field: string): Promise<T | null> {
    const raw = await this.publisher.hget(key, field);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  }

  async getAllState<T extends Record<string, unknown>>(key: string): Promise<T | null> {
    const raw = await this.publisher.hgetall(key);
    if (!raw || Object.keys(raw).length === 0) return null;
    const parsed: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
      try {
        parsed[k] = JSON.parse(v);
      } catch {
        parsed[k] = v;
      }
    }
    return parsed as T;
  }

  async disconnect(): Promise<void> {
    await this.subscriber.quit();
    await this.publisher.quit();
    this.connected = false;
    logger.info('MessageBus disconnected');
  }
}

/** Singleton bus instance */
let busInstance: MessageBus | null = null;

export function getBus(redisUrl?: string): MessageBus {
  if (!busInstance) {
    busInstance = new MessageBus(redisUrl);
  }
  return busInstance;
}
