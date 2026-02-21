/**
 * Risk enforcement and kill switches
 *
 * Enforces risk limits from the active risk profile.
 * Blocks trades that violate position sizing, drawdown, or loss limits.
 */

import { type RiskProfile, getRiskProfile } from '../../config/risk-profiles.js';
import { logger } from '../../utils/logger.js';

const log = logger.withContext('risk-engine');

export interface ProposedOrder {
  action: 'buy' | 'sell';
  price: number;
  quantity: number;
  pair: string;
}

export interface PortfolioState {
  totalCapital: number;
  currentDrawdownPct: number;
  dailyPnlPct: number;
  openPositionCount: number;
  openPositionValue: number;
}

export interface RiskDecision {
  allowed: boolean;
  reason: string;
  adjustedQuantity?: number;
}

export interface KillSwitchResult {
  triggered: boolean;
  action: 'none' | 'pause' | 'exit_all' | 'shutdown';
  reason: string;
}

export class RiskEngine {
  private profile: RiskProfile;

  constructor(profile: RiskProfile) {
    this.profile = profile;
    log.info('Risk engine initialized', {
      profile: profile.name,
      maxDrawdown: `${profile.maxDrawdownPct}%`,
      maxPosition: `${profile.maxPositionPct}%`,
      dailyLossLimit: `${profile.dailyLossLimitPct}%`,
    });
  }

  /**
   * Check if a proposed trade is allowed under current risk limits
   */
  checkTradeAllowed(order: ProposedOrder, state: PortfolioState): RiskDecision {
    // 1. Kill switch: max drawdown exceeded
    if (state.currentDrawdownPct >= this.profile.maxDrawdownPct) {
      log.error('Kill switch triggered: max drawdown exceeded', {
        current: state.currentDrawdownPct,
        max: this.profile.maxDrawdownPct,
      });
      return {
        allowed: false,
        reason: 'Kill switch: max drawdown exceeded',
      };
    }

    // 2. Daily loss limit
    if (state.dailyPnlPct <= -this.profile.dailyLossLimitPct) {
      log.warn('Daily loss limit hit', {
        dailyPnl: state.dailyPnlPct,
        limit: -this.profile.dailyLossLimitPct,
      });
      return {
        allowed: false,
        reason: 'Daily loss limit hit',
      };
    }

    // 3. Max open positions
    if (state.openPositionCount >= this.profile.maxOpenPositions) {
      log.warn('Max open positions reached', {
        current: state.openPositionCount,
        max: this.profile.maxOpenPositions,
      });
      return {
        allowed: false,
        reason: 'Max open positions reached',
      };
    }

    // 4. Position size limit
    const orderValue = order.price * order.quantity;
    const maxPositionValue = state.totalCapital * (this.profile.maxPositionPct / 100);

    if (orderValue > maxPositionValue) {
      const adjustedQuantity = maxPositionValue / order.price;
      log.warn('Position size exceeds limit, reducing quantity', {
        original: order.quantity,
        adjusted: adjustedQuantity,
        maxPositionPct: this.profile.maxPositionPct,
      });
      return {
        allowed: true,
        reason: 'Position size adjusted to fit max position limit',
        adjustedQuantity,
      };
    }

    // All checks passed
    log.debug('Trade allowed', {
      action: order.action,
      pair: order.pair,
      value: orderValue,
    });

    return {
      allowed: true,
      reason: 'All risk checks passed',
    };
  }

  /**
   * Check if kill switch should trigger based on portfolio state
   */
  checkKillSwitch(state: PortfolioState): KillSwitchResult {
    // Critical: max drawdown reached → shutdown
    if (state.currentDrawdownPct >= this.profile.maxDrawdownPct) {
      log.error('KILL SWITCH ACTIVATED: Max drawdown reached', {
        drawdown: state.currentDrawdownPct,
        threshold: this.profile.maxDrawdownPct,
      });
      return {
        triggered: true,
        action: 'shutdown',
        reason: `Max drawdown ${state.currentDrawdownPct.toFixed(2)}% exceeded limit ${this.profile.maxDrawdownPct}%`,
      };
    }

    // Warning: approaching max drawdown → pause
    const warningThreshold = this.profile.maxDrawdownPct * 0.8;
    if (state.currentDrawdownPct >= warningThreshold) {
      log.warn('Drawdown warning: approaching limit', {
        current: state.currentDrawdownPct,
        warning: warningThreshold,
        max: this.profile.maxDrawdownPct,
      });
      return {
        triggered: true,
        action: 'pause',
        reason: `Drawdown ${state.currentDrawdownPct.toFixed(2)}% approaching limit ${this.profile.maxDrawdownPct}%`,
      };
    }

    // Critical: daily loss limit exceeded → exit all
    if (state.dailyPnlPct <= -this.profile.dailyLossLimitPct) {
      log.error('Daily loss limit exceeded, exiting all positions', {
        dailyPnl: state.dailyPnlPct,
        limit: -this.profile.dailyLossLimitPct,
      });
      return {
        triggered: true,
        action: 'exit_all',
        reason: `Daily loss ${state.dailyPnlPct.toFixed(2)}% exceeded limit -${this.profile.dailyLossLimitPct}%`,
      };
    }

    return {
      triggered: false,
      action: 'none',
      reason: 'All risk thresholds within limits',
    };
  }
}
