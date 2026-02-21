/**
 * Message type definitions for Redis pub/sub communication
 */

// ─── Signal Messages ───────────────────────────────────────

export interface IndicatorValues {
  rsi?: number;
  ema_fast?: number;
  ema_slow?: number;
  atr?: number;
  macd?: { macd: number; signal: number; histogram: number };
  bollinger?: { upper: number; middle: number; lower: number };
  supertrend?: { value: number; direction: 'up' | 'down' };
  [key: string]: unknown;
}

export interface SignalMessage {
  type: 'signal';
  timestamp: number;
  pair: string;
  price: number;
  indicators: IndicatorValues;
  recommendation: 'strong_buy' | 'buy' | 'neutral' | 'sell' | 'strong_sell';
  confidence: number;
  metadata?: Record<string, unknown>;
}

// ─── Order Messages ────────────────────────────────────────

export interface OrderMessage {
  type: 'order';
  timestamp: number;
  orderId: string;
  pair: string;
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  slippageBps: number;
  strategy: 'grid' | 'breakout' | 'momentum';
  gridLevel?: number;
  stopLoss?: number;
  takeProfit?: number;
  metadata?: Record<string, unknown>;
}

// ─── Execution Messages ────────────────────────────────────

export interface ExecutionMessage {
  type: 'execution';
  timestamp: number;
  orderId: string;
  txSignature: string;
  status: 'submitted' | 'confirmed' | 'failed' | 'rolled_back';
  fillPrice?: number;
  fillQuantity?: number;
  fees?: number;
  error?: string;
  metadata?: Record<string, unknown>;
}

// ─── Risk Alert Messages ───────────────────────────────────

export interface RiskAlertMessage {
  type: 'risk_alert';
  timestamp: number;
  severity: 'info' | 'warning' | 'critical';
  alertType:
    | 'drawdown_warning'
    | 'drawdown_limit'
    | 'daily_loss_limit'
    | 'kill_switch'
    | 'api_failure'
    | 'liquidity_drop';
  message: string;
  currentDrawdown?: number;
  threshold?: number;
  action: 'notify' | 'pause' | 'exit_all' | 'shutdown';
}

// ─── Heartbeat Messages ────────────────────────────────────

export interface HeartbeatMessage {
  type: 'heartbeat';
  timestamp: number;
  agent: 'signal' | 'optimizer' | 'executor' | 'telegram';
  status: 'alive' | 'busy' | 'error';
  uptime: number;
  lastAction?: string;
}

// ─── Command Messages ──────────────────────────────────────

export interface CommandMessage {
  type: 'command';
  timestamp: number;
  command: 'start' | 'stop' | 'pause' | 'resume' | 'status' | 'config';
  args?: Record<string, unknown>;
  source: 'telegram' | 'terminal';
}

// ─── Union Type ────────────────────────────────────────────

export type BusMessage =
  | SignalMessage
  | OrderMessage
  | ExecutionMessage
  | RiskAlertMessage
  | HeartbeatMessage
  | CommandMessage;
