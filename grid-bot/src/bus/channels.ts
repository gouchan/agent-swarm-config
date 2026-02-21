/**
 * Redis pub/sub channel definitions
 * All agent communication flows through these channels
 */

export const CHANNELS = {
  /** Signal Agent → Optimizer: market signals + indicator values */
  SIGNALS: 'grid:signals',

  /** Optimizer → Executor: approved trade orders */
  ORDERS: 'grid:orders',

  /** Executor → All: transaction execution results */
  EXECUTIONS: 'grid:executions',

  /** Optimizer → All + Telegram: risk warnings, kill switch events */
  RISK_ALERTS: 'grid:risk-alerts',

  /** All agents → Monitor: health check heartbeats */
  HEARTBEAT: 'grid:heartbeat',

  /** User commands from Telegram → agents */
  COMMANDS: 'grid:commands',
} as const;

export type Channel = typeof CHANNELS[keyof typeof CHANNELS];
