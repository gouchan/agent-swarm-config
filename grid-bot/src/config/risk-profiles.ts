/**
 * Risk management profiles
 *
 * Each tier controls position sizing, drawdown limits, and grid parameters.
 * Users select a profile; the bot enforces it automatically.
 */

export interface RiskProfile {
  name: string;
  /** Max portfolio drawdown before kill switch triggers (%) */
  maxDrawdownPct: number;
  /** Max capital allocated to a single trade (%) */
  maxPositionPct: number;
  /** Max number of simultaneously open positions */
  maxOpenPositions: number;
  /** Stop trading if daily P&L drops below this (%) */
  dailyLossLimitPct: number;
  /** Minimum grid spacing allowed (%) — prevents over-density */
  gridSpacingMinPct: number;
  /** Max slippage tolerance per trade (basis points) */
  maxSlippageBps: number;
  /** Require user confirmation for trades above this USD value */
  confirmationThresholdUsd: number;
  /** Max consecutive failed API calls before pausing */
  maxApiFailures: number;
}

export const RISK_PROFILES: Record<string, RiskProfile> = {
  low: {
    name: 'Conservative',
    maxDrawdownPct: 5,
    maxPositionPct: 10,
    maxOpenPositions: 5,
    dailyLossLimitPct: 3,
    gridSpacingMinPct: 0.5,
    maxSlippageBps: 50,
    confirmationThresholdUsd: 20,
    maxApiFailures: 3,
  },
  medium: {
    name: 'Balanced',
    maxDrawdownPct: 10,
    maxPositionPct: 20,
    maxOpenPositions: 8,
    dailyLossLimitPct: 5,
    gridSpacingMinPct: 0.3,
    maxSlippageBps: 75,
    confirmationThresholdUsd: 50,
    maxApiFailures: 3,
  },
  high: {
    name: 'Aggressive',
    maxDrawdownPct: 15,
    maxPositionPct: 30,
    maxOpenPositions: 12,
    dailyLossLimitPct: 8,
    gridSpacingMinPct: 0.2,
    maxSlippageBps: 100,
    confirmationThresholdUsd: 100,
    maxApiFailures: 5,
  },
};

export function getRiskProfile(tier: string): RiskProfile {
  const profile = RISK_PROFILES[tier];
  if (!profile) {
    throw new Error(`Unknown risk profile: ${tier}. Use: low, medium, high`);
  }
  return profile;
}
