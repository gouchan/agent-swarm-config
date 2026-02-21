---
description: Start, stop, and manage the multi-agent grid trading bot
aliases: [grid, trading-bot]
argument-hint: <start|stop|status|backtest|config>
---

# Grid Bot Command

Manage the Phantom Grid Bot — a multi-agent adaptive grid trading system for Solana.

## Usage

```
/grid-bot start           # Start in paper trade mode (default)
/grid-bot start --live    # Start in live trading mode
/grid-bot stop            # Graceful shutdown
/grid-bot status          # Show active grids, positions, P&L
/grid-bot backtest        # Run backtest on historical data
/grid-bot config          # Show current configuration
```

## Subcommands

### `start`
Boot all agents (Signal → Optimizer → Executor) and begin trading.

```bash
cd grid-bot && npm run dev
```

Paper trade mode is ON by default. Set `PAPER_TRADE_MODE=false` in `.env` for live trading.

### `stop`
Send shutdown signal to all agents via Redis.

### `status`
Display:
- Active grid levels with fill status
- Open positions
- Session P&L (realized + unrealized)
- Agent health (heartbeat status)
- Current indicator values

### `backtest`
Run the strategy against historical OHLCV data.
Requires Birdeye API key for data fetch.

### `config`
Show current grid, risk, and strategy configuration.
Supports modifying parameters interactively.

## Requirements

- Redis running locally (`brew services start redis`)
- `.env` file configured (copy from `.env.example`)
- Node.js 18+
- For live trading: funded bot keypair with SOL + USDC

## Project

All code lives in `grid-bot/` directory.
