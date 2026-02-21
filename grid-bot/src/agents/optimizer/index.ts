/**
 * Optimizer Agent
 *
 * Consumes signals from Signal Agent, applies risk management,
 * and publishes approved orders to Trade Executor.
 *
 * Responsibilities:
 * - Calculate and maintain grid levels
 * - Detect breakout opportunities (overlay on grid)
 * - Enforce risk limits (position size, drawdown, daily loss)
 * - Generate and validate trade orders
 * - Publish to CHANNELS.ORDERS
 */

import { randomUUID } from 'crypto';
import type { MessageBus } from '../../bus/redis.js';
import { CHANNELS } from '../../bus/channels.js';
import type {
  SignalMessage,
  OrderMessage,
  ExecutionMessage,
  CommandMessage,
  HeartbeatMessage,
  RiskAlertMessage,
  BusMessage,
} from '../../bus/types.js';
import type { BotConfig } from '../../config/default.js';
import { getRiskProfile } from '../../config/risk-profiles.js';
import type { OHLCV } from '../../indicators/types.js';
import type { GridLevel } from '../../utils/math.js';
import { logger } from '../../utils/logger.js';

import { calculateGrid, adjustGridForVolatility } from './grid-calculator.js';
import { detectBreakout, type BreakoutParams } from './breakout-detector.js';
import { RiskEngine, type PortfolioState, type ProposedOrder } from './risk-engine.js';

const log = logger.withContext('optimizer');

interface OptimizerState {
  recentCandles: OHLCV[];
  currentGrid: GridLevel[];
  portfolioState: PortfolioState;
  lastSignalTimestamp: number;
  startTime: number;
}

/**
 * Start the Optimizer Agent
 */
export async function startOptimizerAgent(bus: MessageBus, config: BotConfig): Promise<void> {
  log.info('Starting Optimizer Agent', {
    pair: config.grid.pair,
    capital: config.grid.capitalUsd,
    gridLevels: config.grid.gridLevels,
    riskProfile: config.riskProfile,
    breakoutOverlay: config.grid.breakoutOverlay,
  });

  // Initialize risk engine
  const riskProfile = getRiskProfile(config.riskProfile);
  const riskEngine = new RiskEngine(riskProfile);

  // Initialize state
  const state: OptimizerState = {
    recentCandles: [],
    currentGrid: [],
    portfolioState: {
      totalCapital: config.grid.capitalUsd,
      currentDrawdownPct: 0,
      dailyPnlPct: 0,
      openPositionCount: 0,
      openPositionValue: 0,
    },
    lastSignalTimestamp: 0,
    startTime: Date.now(),
  };

  // ── Pause/resume support ───────────────────────────────
  let paused = false;

  await bus.subscribe(CHANNELS.COMMANDS, (message: BusMessage) => {
    if (message.type !== 'command') return;
    const cmd = message as CommandMessage;
    if (cmd.command === 'pause') {
      paused = true;
      log.warn('Trading PAUSED by command');
    } else if (cmd.command === 'resume') {
      paused = false;
      log.info('Trading RESUMED by command');
    }
  });

  // Subscribe to signals
  await bus.subscribe(CHANNELS.SIGNALS, async (message: BusMessage) => {
    if (message.type !== 'signal') return;

    const signal = message as SignalMessage;

    // Skip order generation when paused (still track signals for state)
    if (paused) {
      state.lastSignalTimestamp = signal.timestamp;
      log.debug('Signal received but trading is paused — skipping');
      return;
    }
    log.info('Received signal', {
      pair: signal.pair,
      price: signal.price,
      recommendation: signal.recommendation,
      confidence: signal.confidence,
    });

    state.lastSignalTimestamp = signal.timestamp;

    // Update candle history (reconstruct OHLCV from signal)
    const candle: OHLCV = {
      timestamp: signal.timestamp,
      open: signal.price,
      high: signal.price,
      low: signal.price,
      close: signal.price,
      volume: 0, // Volume not available in signal, would need separate feed
    };

    state.recentCandles.push(candle);

    // Keep last 100 candles
    if (state.recentCandles.length > 100) {
      state.recentCandles.shift();
    }

    // Calculate/update grid levels
    if (state.currentGrid.length === 0) {
      state.currentGrid = calculateGrid(signal.price, config.grid);
      log.info(`Initial grid created: ${state.currentGrid.length} levels`);
    }

    // Check for volatility adjustment using ATR from indicators
    const atrPct = signal.indicators.atr as number | undefined;
    if (atrPct && atrPct > config.grid.gridSpacingPct) {
      state.currentGrid = adjustGridForVolatility(
        state.currentGrid,
        atrPct,
        riskProfile.gridSpacingMinPct,
      );
    }

    // Breakout detection
    let breakoutDetected = false;
    if (config.grid.breakoutOverlay && state.recentCandles.length >= config.strategy.breakoutLookback) {
      const breakoutParams: BreakoutParams = {
        lookback: config.strategy.breakoutLookback,
        volumeMultiplier: config.strategy.breakoutVolumeMultiplier,
        atrStopMultiplier: config.strategy.breakoutAtrStopMultiplier,
      };

      const breakout = detectBreakout(state.recentCandles, breakoutParams);

      if (breakout?.detected) {
        breakoutDetected = true;
        log.info(`Breakout overlay: ${breakout.direction}`, {
          entry: breakout.entryPrice,
          stop: breakout.stopLoss,
          target: breakout.takeProfit,
          confidence: breakout.confidence,
        });

        // Create breakout order
        const breakoutOrder: ProposedOrder = {
          action: breakout.direction === 'long' ? 'buy' : 'sell',
          price: breakout.entryPrice,
          quantity: config.grid.capitalUsd * 0.3 / breakout.entryPrice, // Allocate 30% of capital
          pair: config.grid.pair,
        };

        const riskDecision = riskEngine.checkTradeAllowed(breakoutOrder, state.portfolioState);

        if (riskDecision.allowed) {
          const order: OrderMessage = {
            type: 'order',
            timestamp: Date.now(),
            orderId: randomUUID(),
            pair: config.grid.pair,
            action: breakoutOrder.action,
            price: riskDecision.adjustedQuantity
              ? breakout.entryPrice
              : breakoutOrder.price,
            quantity: riskDecision.adjustedQuantity ?? breakoutOrder.quantity,
            slippageBps: riskProfile.maxSlippageBps,
            strategy: 'breakout',
            stopLoss: breakout.stopLoss,
            takeProfit: breakout.takeProfit,
            metadata: {
              breakoutReason: breakout.reason,
              confidence: breakout.confidence,
            },
          };

          await bus.publish(CHANNELS.ORDERS, order);
          log.info('Breakout order published', { orderId: order.orderId });

          state.portfolioState.openPositionCount++;
        } else {
          log.warn('Breakout order blocked by risk engine', { reason: riskDecision.reason });
        }
      }
    }

    // Check grid levels for triggers
    if (!breakoutDetected) {
      for (const level of state.currentGrid) {
        if (level.filled) continue;

        let shouldFill = false;

        if (level.side === 'buy' && signal.price <= level.price) {
          shouldFill = true;
        } else if (level.side === 'sell' && signal.price >= level.price) {
          shouldFill = true;
        }

        if (shouldFill) {
          const proposedOrder: ProposedOrder = {
            action: level.side,
            price: level.price,
            quantity: level.quantity,
            pair: config.grid.pair,
          };

          const riskDecision = riskEngine.checkTradeAllowed(proposedOrder, state.portfolioState);

          if (riskDecision.allowed) {
            const order: OrderMessage = {
              type: 'order',
              timestamp: Date.now(),
              orderId: randomUUID(),
              pair: config.grid.pair,
              action: level.side,
              price: level.price,
              quantity: riskDecision.adjustedQuantity ?? level.quantity,
              slippageBps: riskProfile.maxSlippageBps,
              strategy: 'grid',
              gridLevel: level.index,
            };

            await bus.publish(CHANNELS.ORDERS, order);
            log.info('Grid order published', {
              orderId: order.orderId,
              gridLevel: level.index,
              side: level.side,
              price: level.price,
            });

            level.filled = true;
            state.portfolioState.openPositionCount++;
          } else {
            log.warn('Grid order blocked by risk engine', {
              level: level.index,
              reason: riskDecision.reason,
            });
          }
        }
      }
    }

    // Check kill switch
    const killSwitch = riskEngine.checkKillSwitch(state.portfolioState);
    if (killSwitch.triggered) {
      const alert: RiskAlertMessage = {
        type: 'risk_alert',
        timestamp: Date.now(),
        severity: killSwitch.action === 'shutdown' ? 'critical' : 'warning',
        alertType: killSwitch.action === 'shutdown' ? 'kill_switch' : 'drawdown_warning',
        message: killSwitch.reason,
        currentDrawdown: state.portfolioState.currentDrawdownPct,
        threshold: riskProfile.maxDrawdownPct,
        action: killSwitch.action as RiskAlertMessage['action'],
      };

      await bus.publish(CHANNELS.RISK_ALERTS, alert);
      log.error('Risk alert published', { action: killSwitch.action, reason: killSwitch.reason });
    }
  });

  // Send heartbeat periodically
  const heartbeatInterval = setInterval(async () => {
    try {
      const heartbeat: HeartbeatMessage = {
        type: 'heartbeat',
        timestamp: Date.now(),
        agent: 'optimizer',
        status: 'alive',
        uptime: Date.now() - state.startTime,
        lastAction: state.lastSignalTimestamp
          ? `Last signal: ${new Date(state.lastSignalTimestamp).toISOString()}`
          : 'Waiting for first signal',
      };

      await bus.publish(CHANNELS.HEARTBEAT, heartbeat);
      log.debug('Heartbeat sent');
    } catch (err) {
      log.error('Heartbeat publish failed', err);
    }
  }, config.heartbeatIntervalMs);

  // ── Feedback loop: subscribe to executions for real P&L ──
  const PORTFOLIO_KEY = 'grid-bot:portfolio';
  await bus.subscribe(CHANNELS.EXECUTIONS, async (message: BusMessage) => {
    if (message.type !== 'execution') return;
    const exec = message as ExecutionMessage;
    if (exec.status !== 'confirmed') return;

    // Pull latest portfolio state from Redis (written by Executor)
    const portfolioFromRedis = await bus.getState<PortfolioState>(
      PORTFOLIO_KEY,
      'portfolio',
    );
    if (portfolioFromRedis) {
      state.portfolioState = portfolioFromRedis;
      log.info('Portfolio state updated from Executor', {
        capital: portfolioFromRedis.totalCapital,
        drawdown: `${portfolioFromRedis.currentDrawdownPct}%`,
        dailyPnl: `${portfolioFromRedis.dailyPnlPct}%`,
        openPositions: portfolioFromRedis.openPositionCount,
      });
    }
  });

  log.info('Optimizer Agent ready, listening for signals + executions');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    log.info('Shutting down Optimizer Agent');
    clearInterval(heartbeatInterval);
    await bus.unsubscribe(CHANNELS.SIGNALS);
    process.exit(0);
  });
}
