/**
 * Indicator Registry + Execution Engine
 *
 * Auto-discovers and manages all indicators (built-in + custom).
 * The Signal Agent calls engine.computeAll() each cycle to get
 * a consolidated view of all indicator signals.
 */

import type { Indicator, IndicatorInput, IndicatorOutput, OHLCV } from './types.js';
import { logger } from '../utils/logger.js';

// Built-in indicators
import { RSIIndicator } from './built-in/rsi.js';
import { EMAIndicator } from './built-in/ema.js';
import { ATRIndicator } from './built-in/atr.js';
import { MACDIndicator } from './built-in/macd.js';
import { BollingerIndicator } from './built-in/bollinger.js';
import { SuperTrendIndicator } from './built-in/supertrend.js';

// Custom indicators (translated from Pine Script)
import { SmartMoneyRangeIndicator } from './custom/smart-money-range.js';
import { FiboVolumeProfileIndicator } from './custom/fibo-volume-profile.js';
import { FilteredVolumeProfileIndicator } from './custom/filtered-volume-profile.js';
import { TrendChannelsIndicator } from './custom/trend-channels.js';
import { MomentumGhostIndicator } from './custom/momentum-ghost.js';

const log = logger.withContext('indicators');

export interface EngineResult {
  /** Individual indicator outputs */
  indicators: Record<string, IndicatorOutput>;
  /** Aggregated consensus signal */
  consensus: {
    signal: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
    confidence: number;
    buyCount: number;
    sellCount: number;
    neutralCount: number;
  };
}

export class IndicatorEngine {
  private registry: Map<string, Indicator> = new Map();

  constructor() {
    // Register built-in indicators
    this.register(new RSIIndicator());
    this.register(new EMAIndicator());
    this.register(new ATRIndicator());
    this.register(new MACDIndicator());
    this.register(new BollingerIndicator());
    this.register(new SuperTrendIndicator());

    // Register custom indicators (Pine Script translations)
    this.register(new SmartMoneyRangeIndicator());
    this.register(new FiboVolumeProfileIndicator());
    this.register(new FilteredVolumeProfileIndicator());
    this.register(new TrendChannelsIndicator());
    this.register(new MomentumGhostIndicator());
  }

  /**
   * Register a new indicator (built-in or custom)
   */
  register(indicator: Indicator): void {
    this.registry.set(indicator.config.name, indicator);
    log.debug(`Registered indicator: ${indicator.config.name}`);
  }

  /**
   * Remove an indicator from the registry
   */
  unregister(name: string): void {
    this.registry.delete(name);
  }

  /**
   * Get all registered indicator names
   */
  listIndicators(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Compute a single indicator
   */
  compute(
    name: string,
    candles: OHLCV[],
    paramOverrides?: Record<string, number>,
  ): IndicatorOutput | null {
    const indicator = this.registry.get(name);
    if (!indicator) {
      log.warn(`Indicator not found: ${name}`);
      return null;
    }

    if (candles.length < indicator.config.minCandles) {
      log.debug(`Not enough candles for ${name}: have ${candles.length}, need ${indicator.config.minCandles}`);
      return null;
    }

    const params = { ...indicator.config.defaultParams, ...paramOverrides };
    try {
      return indicator.compute({ candles, params });
    } catch (err) {
      log.error(`Indicator ${name} computation failed`, err);
      return null;
    }
  }

  /**
   * Compute all active indicators and aggregate consensus
   */
  computeAll(
    candles: OHLCV[],
    activeIndicators?: string[],
  ): EngineResult {
    const names = activeIndicators || this.listIndicators();
    const indicators: Record<string, IndicatorOutput> = {};

    let buyCount = 0;
    let sellCount = 0;
    let neutralCount = 0;
    let totalConfidence = 0;

    for (const name of names) {
      const result = this.compute(name, candles);
      if (!result) continue;

      indicators[name] = result;

      if (result.signal === 'buy') buyCount++;
      else if (result.signal === 'sell') sellCount++;
      else neutralCount++;

      totalConfidence += result.confidence;
    }

    const total = buyCount + sellCount + neutralCount;
    const avgConfidence = total > 0 ? totalConfidence / total : 0;

    // Determine consensus
    let signal: EngineResult['consensus']['signal'] = 'neutral';
    if (buyCount > sellCount && buyCount > neutralCount) {
      signal = avgConfidence > 0.75 ? 'strong_buy' : 'buy';
    } else if (sellCount > buyCount && sellCount > neutralCount) {
      signal = avgConfidence > 0.75 ? 'strong_sell' : 'sell';
    }

    return {
      indicators,
      consensus: {
        signal,
        confidence: Math.round(avgConfidence * 100) / 100,
        buyCount,
        sellCount,
        neutralCount,
      },
    };
  }
}

/** Singleton engine instance */
let engineInstance: IndicatorEngine | null = null;

export function getEngine(): IndicatorEngine {
  if (!engineInstance) {
    engineInstance = new IndicatorEngine();
  }
  return engineInstance;
}
