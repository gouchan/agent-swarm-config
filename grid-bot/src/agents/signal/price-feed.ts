/**
 * Birdeye API integration for price feeds and OHLCV data
 *
 * Endpoints:
 * - /defi/price - Current token price
 * - /defi/ohlcv - Historical OHLCV candles
 */

import axios from 'axios';
import type { OHLCV } from '../../indicators/types.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('price-feed');

const BIRDEYE_BASE_URL = 'https://public-api.birdeye.so';
const MAX_RECORDS_PER_REQUEST = 1000;
const RATE_LIMIT_DELAY_MS = 1500; // Pause between API calls to avoid 429s
const MAX_RETRIES = 3;

/**
 * Sleep helper for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper with exponential backoff for 429 rate limits
 */
async function withRetry<T>(fn: () => Promise<T>, label: string): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 429 && attempt < MAX_RETRIES) {
        const backoff = RATE_LIMIT_DELAY_MS * attempt * 2;
        log.warn(`Rate limited (429) on ${label}, retrying in ${backoff}ms (attempt ${attempt}/${MAX_RETRIES})`);
        await sleep(backoff);
      } else {
        throw err;
      }
    }
  }
  throw new Error(`${label} failed after ${MAX_RETRIES} retries`);
}

interface BirdeyePriceResponse {
  data: {
    value: number;
  };
  success: boolean;
}

interface BirdeyeOHLCVItem {
  unixTime: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

interface BirdeyeOHLCVResponse {
  data: {
    items: BirdeyeOHLCVItem[];
  };
  success: boolean;
}

/**
 * Get current price for a token
 */
export async function getCurrentPrice(address: string): Promise<number> {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) {
    throw new Error('BIRDEYE_API_KEY not set in environment');
  }

  return withRetry(async () => {
    const response = await axios.get<BirdeyePriceResponse>(
      `${BIRDEYE_BASE_URL}/defi/price`,
      {
        params: { address },
        headers: {
          'X-API-KEY': apiKey,
          'x-chain': 'solana',
        },
      }
    );

    if (!response.data.success || !response.data.data?.value) {
      throw new Error('Invalid price response from Birdeye');
    }

    const price = response.data.data.value;
    log.debug(`Current price for ${address}: $${price.toFixed(2)}`);
    return price;
  }, 'getCurrentPrice');
}

/**
 * Get OHLCV candles for a specific time range
 */
export async function getOHLCV(
  address: string,
  timeframe: string,
  timeFrom: number,
  timeTo: number
): Promise<OHLCV[]> {
  const apiKey = process.env.BIRDEYE_API_KEY;
  if (!apiKey) {
    throw new Error('BIRDEYE_API_KEY not set in environment');
  }

  return withRetry(async () => {
    const response = await axios.get<BirdeyeOHLCVResponse>(
      `${BIRDEYE_BASE_URL}/defi/ohlcv`,
      {
        params: {
          address,
          type: timeframe,
          time_from: timeFrom,
          time_to: timeTo,
        },
        headers: {
          'X-API-KEY': apiKey,
          'x-chain': 'solana',
        },
      }
    );

    if (!response.data.success || !response.data.data?.items) {
      throw new Error('Invalid OHLCV response from Birdeye');
    }

    const candles = response.data.data.items.map((item) => ({
      timestamp: item.unixTime,
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v,
    }));

    log.debug(
      `Fetched ${candles.length} candles (${timeframe})`
    );

    return candles;
  }, 'getOHLCV');
}

/**
 * Get historical OHLCV data with automatic pagination for large date ranges
 */
export async function getHistoricalOHLCV(
  address: string,
  days: number
): Promise<OHLCV[]> {
  const now = Math.floor(Date.now() / 1000);
  const timeFrom = now - days * 24 * 60 * 60;
  const timeframe = '15m';

  // Calculate expected candles: 15m = 4 candles/hour * 24 hours * days
  const expectedCandles = 4 * 24 * days;

  // If expected candles > 1000, split into chunks (15 days max per request)
  if (expectedCandles > MAX_RECORDS_PER_REQUEST) {
    log.debug(
      `Large date range (${days} days, ~${expectedCandles} candles). Paginating...`
    );

    const chunkDays = 10; // Conservative chunk size
    const chunks = Math.ceil(days / chunkDays);
    const allCandles: OHLCV[] = [];

    for (let i = 0; i < chunks; i++) {
      const chunkFrom = timeFrom + i * chunkDays * 24 * 60 * 60;
      const chunkTo = Math.min(chunkFrom + chunkDays * 24 * 60 * 60, now);

      const chunkCandles = await getOHLCV(
        address,
        timeframe,
        chunkFrom,
        chunkTo
      );
      allCandles.push(...chunkCandles);

      log.debug(
        `Fetched chunk ${i + 1}/${chunks} (${chunkCandles.length} candles)`
      );

      // Rate limit: pause between chunks
      if (i < chunks - 1) {
        await sleep(RATE_LIMIT_DELAY_MS);
      }
    }

    // Sort by timestamp ascending and deduplicate
    const uniqueCandles = Array.from(
      new Map(allCandles.map((c) => [c.timestamp, c])).values()
    ).sort((a, b) => a.timestamp - b.timestamp);

    log.info(
      `Fetched ${uniqueCandles.length} total candles for ${days} days`
    );
    return uniqueCandles;
  } else {
    // Single request
    const candles = await getOHLCV(address, timeframe, timeFrom, now);
    return candles.sort((a, b) => a.timestamp - b.timestamp);
  }
}
