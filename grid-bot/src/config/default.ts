/**
 * Default configuration for the grid trading bot
 */

export interface GridConfig {
  /** Token pair to trade */
  pair: string;
  /** Number of grid levels above and below current price */
  gridLevels: number;
  /** Spacing between grid levels as percentage */
  gridSpacingPct: number;
  /** Total capital to deploy across the grid (in USDC) */
  capitalUsd: number;
  /** Amount per grid level (auto-calculated if not set) */
  amountPerLevel?: number;
  /** Enable breakout overlay on top of grid */
  breakoutOverlay: boolean;
}

export interface StrategyConfig {
  /** Active strategy mode */
  mode: 'grid' | 'breakout' | 'hybrid';
  /** Minimum confidence score to act on a signal (0-1) */
  minConfidence: number;
  /** Indicators to use for signal generation */
  activeIndicators: string[];
  /** Breakout: lookback period for consolidation detection (candles) */
  breakoutLookback: number;
  /** Breakout: volume multiplier threshold for confirmation */
  breakoutVolumeMultiplier: number;
  /** Breakout: ATR multiplier for stop loss */
  breakoutAtrStopMultiplier: number;
}

export interface BotConfig {
  grid: GridConfig;
  strategy: StrategyConfig;
  riskProfile: 'low' | 'medium' | 'high';
  paperTradeMode: boolean;
  signalPollIntervalMs: number;
  heartbeatIntervalMs: number;
}

export const DEFAULT_CONFIG: BotConfig = {
  grid: {
    pair: 'SOL/USDC',
    gridLevels: 7,
    gridSpacingPct: 1.0,
    capitalUsd: 50,
    breakoutOverlay: true,
  },
  strategy: {
    mode: 'hybrid',
    minConfidence: 0.6,
    activeIndicators: ['rsi', 'ema', 'atr', 'macd', 'bollinger', 'supertrend', 'smart-money-range', 'fibo-volume-profile', 'filtered-volume-profile', 'trend-channels', 'momentum-ghost'],
    breakoutLookback: 20,
    breakoutVolumeMultiplier: 1.5,
    breakoutAtrStopMultiplier: 1.5,
  },
  riskProfile: 'low',
  paperTradeMode: true,
  signalPollIntervalMs: 30_000,
  heartbeatIntervalMs: 60_000,
};
