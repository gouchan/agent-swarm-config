/**
 * Indicator type definitions
 *
 * Every indicator — built-in or custom (translated from Pine Script) —
 * implements this interface. This is the plug-in contract.
 */

// ─── OHLCV Data ────────────────────────────────────────────

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ─── Indicator Interface ───────────────────────────────────

export interface IndicatorConfig {
  /** Unique identifier (e.g., 'rsi', 'ema-crossover', 'my-custom-indicator') */
  name: string;
  /** Human-readable description */
  description: string;
  /** Default parameters — user can override */
  defaultParams: Record<string, number>;
  /** Timeframe this indicator operates on (e.g., '15m', '1h', '4h') */
  timeframe: string;
  /** Minimum candles required to compute */
  minCandles: number;
}

export interface IndicatorInput {
  candles: OHLCV[];
  params: Record<string, number>;
}

export interface IndicatorOutput {
  /** Trading signal */
  signal: 'buy' | 'sell' | 'neutral';
  /** Confidence 0-1 */
  confidence: number;
  /** Computed values for logging and strategy combination */
  values: Record<string, number>;
  /** Optional extra data */
  metadata?: Record<string, unknown>;
}

export interface Indicator {
  config: IndicatorConfig;
  compute(input: IndicatorInput): IndicatorOutput;
}
