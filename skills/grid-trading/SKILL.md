---
name: grid-trading
description: Multi-agent adaptive grid trading system for Solana. Coordinates signal, optimizer, and executor agents for autonomous grid + breakout trading.
---

# Grid Trading Skill

[GRID TRADING MODE ACTIVATED]

## Objective

Manage and operate the multi-agent grid trading bot. This skill coordinates three specialized agents (Signal → Optimizer → Executor) for autonomous grid trading with breakout overlay on Solana DEXs.

## When to Use

- Starting or stopping the grid trading bot
- Deploying a new grid configuration
- Running backtests on strategies
- Checking P&L, positions, or grid status
- Configuring risk profiles or trading parameters

## Activation

- `/grid-trading` or `/grid-bot`
- "Start grid bot", "deploy grid", "check trading status"
- "Backtest SOL/USDC grid", "show P&L"

## Architecture

```
Signal Agent (haiku) → Optimizer Agent (sonnet) → Executor Agent (sonnet)
       ↓                      ↓                         ↓
  Price feeds           Strategy + Risk            Jupiter Swaps
  Indicators            Backtesting                Jito MEV protection
  Alerts                Grid levels                Tx confirmation
       └──────────── Redis Pub/Sub ────────────────┘
                           ↓
                    Telegram Alerts
```

## Commands

| Command | Description |
|---------|-------------|
| `/grid-bot start` | Start in paper trade or live mode |
| `/grid-bot stop` | Graceful shutdown of all agents |
| `/grid-bot status` | Active grids, positions, P&L |
| `/grid-bot backtest` | Run strategy backtest |
| `/grid-bot config` | View/modify configuration |

## Configuration

### Grid Parameters
- **pair**: Token pair (default: SOL/USDC)
- **gridLevels**: Number of levels above/below price (default: 5)
- **gridSpacingPct**: Spacing between levels (default: 2.5%)
- **capitalUsd**: Total capital to deploy (default: $50)
- **breakoutOverlay**: Enable breakout detection (default: true)

### Risk Profiles
- **low**: 5% max drawdown, 10% per trade, 3 max positions
- **medium**: 10% max drawdown, 20% per trade, 5 max positions
- **high**: 15% max drawdown, 30% per trade, 8 max positions

### Strategy Modes
- **grid**: Pure symmetric grid trading
- **breakout**: Momentum breakout only
- **hybrid**: Grid base + breakout overlay (recommended)

## Project Location

```
grid-bot/
├── src/agents/         # Signal, Optimizer, Executor agents
├── src/indicators/     # Built-in + custom (Pine Script translated)
├── src/bus/            # Redis pub/sub communication
├── src/config/         # Grid, risk, pair configuration
├── src/telegram/       # Telegram bot notifications
└── src/state/          # Position tracking, P&L
```

## Workflow

1. **Configure** — Set pair, capital, risk profile, strategy mode
2. **Paper Trade** — Run in simulation mode (mandatory first)
3. **Validate** — Review paper trade P&L, backtest results
4. **Go Live** — Set `PAPER_TRADE_MODE=false`, fund wallet
5. **Monitor** — Telegram alerts + terminal logs
6. **Adapt** — Adjust grid spacing, indicators, risk as needed

## Agents Used

- `signal-agent` (haiku) — Market data polling + indicator computation
- `optimizer-agent` (sonnet) — Strategy optimization + risk enforcement
- `trade-executor-agent` (sonnet) — On-chain trade execution

## Safety

- Paper trade mode is ON by default
- Kill switches for drawdown, daily loss, API failures
- Bot keypair is isolated from main wallet
- All trades logged with full audit trail
- User confirmation required for high-value trades
