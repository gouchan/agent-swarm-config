# Phantom Grid Bot

A multi-agent adaptive grid trading system for Solana, built with TypeScript and powered by an AI agent swarm.

```
┌─────────────────────────────────────────────────────────────┐
│                    PHANTOM GRID BOT                          │
│                                                              │
│    4 Agents  |  11 Indicators  |  Hybrid Strategy            │
│    Grid + Breakout  |  Solana/Jupiter  |  Telegram Alerts    │
│                                                              │
│    "Set the grid. Let the swarm trade."                      │
└─────────────────────────────────────────────────────────────┘
```

## What Is This?

A terminal-based autonomous trading bot that coordinates three AI agents to execute grid trading with a breakout overlay on Solana DEXs via Jupiter. The agents communicate over Redis pub/sub, enforce configurable risk rules, and report everything to Telegram.

This is not a single bot. It's a **coordinated agent swarm** where each agent has a specialized role:

| Agent | Role | What It Does |
|-------|------|-------------|
| **Signal Agent** | Sentinel | Polls market data, computes 11 indicators, publishes consensus signals |
| **Optimizer Agent** | Strategist | Receives signals, runs backtests, computes grid levels, enforces risk rules, approves trades |
| **Executor Agent** | Worker | Simulates (paper) or submits (live) trades via Jupiter API with MEV protection |
| **Telegram Bot** | Reporter | Push notifications, /status, /pnl, /grid, /pause, /resume commands |

## Architecture

```
[Birdeye API] ─── OHLCV ───▶ [Signal Agent]
                                    │
                              indicators + consensus
                                    │
                           Redis: "grid:signals"
                                    │
                                    ▼
                             [Optimizer Agent]
                                    │
                         backtest + risk check + grid levels
                                    │
                           Redis: "grid:orders"
                                    │
                                    ▼
                             [Executor Agent]
                                    │
                         Jupiter quote ─▶ sign ─▶ submit ─▶ confirm
                                    │
                           Redis: "grid:executions"
                                    │
                                    ▼
                             [Telegram Bot]
                                    │
                           alerts + P&L + trade log
```

## Quick Start

### Prerequisites

- Node.js 18+
- Redis (`brew install redis && brew services start redis`)
- A Birdeye API key ([birdeye.so/developers](https://birdeye.so/developers))

### Install

```bash
git clone https://github.com/gouchan/phantom-grid-bot.git
cd phantom-grid-bot
npm install
cp .env.example .env
# Edit .env with your API keys
```

### Run (Paper Trade)

```bash
npm run dev
```

The bot starts in **paper trade mode** by default. No real transactions are submitted. It fetches live market data, runs the full signal/optimizer/executor pipeline, and logs simulated trades.

### Go Live

```bash
# 1. Generate a fresh wallet (auto-created on first run)
npm run dev
# Note the wallet address printed in logs

# 2. Fund the wallet
# Send SOL (for fees) + USDC (for trading) to the printed address

# 3. Switch to live mode
# Set PAPER_TRADE_MODE=false in .env

# 4. Start trading
npm run dev
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SOLANA_RPC_URL` | Solana RPC endpoint | mainnet-beta |
| `BOT_KEYPAIR_PATH` | Path to bot wallet keypair | `./keypair.json` |
| `BIRDEYE_API_KEY` | Birdeye API key for OHLCV data | required |
| `REDIS_URL` | Redis connection URL | `redis://localhost:6379` |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token (from @BotFather) | optional |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID | optional |
| `DEFAULT_RISK_PROFILE` | Risk tier: `low`, `medium`, `high` | `low` |
| `PAPER_TRADE_MODE` | Simulate trades without submitting | `true` |

### Risk Profiles

| Setting | Low | Medium | High |
|---------|-----|--------|------|
| Max Drawdown | 5% | 10% | 15% |
| Max Per Trade | 10% | 20% | 30% |
| Max Open Positions | 3 | 5 | 8 |
| Daily Loss Limit | 3% | 5% | 8% |
| Min Grid Spacing | 3% | 2% | 1% |
| Max Slippage | 50 bps | 75 bps | 100 bps |

### Strategy Modes

- **`hybrid`** (default) — Grid base + breakout overlay. Recommended.
- **`grid`** — Pure symmetric grid trading around current price.
- **`breakout`** — Momentum breakout only, no grid.

## Indicators

11 indicators vote in a consensus engine. Majority signal + average confidence determines the trade recommendation.

### Built-in (6)

| Indicator | Category | Signal Logic |
|-----------|----------|-------------|
| **RSI** | Momentum | Buy when oversold (<30), sell when overbought (>70) |
| **EMA Crossover** | Trend | Buy on golden cross (fast > slow), sell on death cross |
| **ATR** | Volatility | Volatility measurement for dynamic grid spacing |
| **MACD** | Momentum | Buy/sell on MACD/signal line crossovers |
| **Bollinger Bands** | Volatility | Buy near lower band, sell near upper band |
| **SuperTrend** | Trend | Directional bias filter (only grid-buy when bullish) |

### Custom — ChartPrime Pine Script Translations (5)

| Indicator | Category | Signal Logic |
|-----------|----------|-------------|
| **Smart Money Range** | S/R Zones | Pivot-based institutional S/R with touch-count scoring. Buy at support + bullish rejection, sell at resistance + bearish rejection. |
| **Fibo Volume Profile** | Fibo + Volume | Pivot point fibs (0.382/0.618/1.0) with bull/bear volume ratio. Targets based on volume dominance and price position relative to fib midpoint. |
| **Filtered Volume Profile** | Volume + Stats | Sinc-kernel smoothed volume across 100 bins. Peak detection with Student's t-distribution scoring. Buy/sell at high-volume nodes based on volume polarity. |
| **Trend Channels** | Structure | Dynamic pivot channels with ATR width. Buy on bullish liquidity breaks or dips in ascending channels. Sell on bearish breaks or rallies in descending channels. |
| **Momentum Ghost** | Momentum | Blackman-windowed sinc momentum with CD histogram and 2-bar ghost projection. 4-state machine: bullish rising/falling, bearish rising/falling. |

### Adding Custom Indicators

Drop a `.ts` file in `src/indicators/custom/`, register it in `engine.ts`, and add the name to `activeIndicators` in `config/default.ts`.

See [`src/indicators/custom/README.md`](src/indicators/custom/README.md) for the Pine Script translation guide.

## Project Structure

```
phantom-grid-bot/
├── src/
│   ├── index.ts                  # Main entry point
│   ├── agents/
│   │   ├── signal/               # Market data + indicators
│   │   ├── optimizer/            # Strategy + risk + backtesting
│   │   └── executor/             # Jupiter swaps + tx signing
│   ├── indicators/
│   │   ├── engine.ts             # Indicator registry + consensus
│   │   ├── types.ts              # Plug-in interface
│   │   ├── built-in/             # RSI, EMA, ATR, MACD, Bollinger, SuperTrend
│   │   └── custom/               # Your Pine Script translations
│   ├── bus/                      # Redis pub/sub communication
│   ├── config/                   # Grid, risk, pair configuration
│   ├── state/                    # Position tracking, P&L
│   ├── telegram/                 # Notifications + commands
│   └── utils/                    # Logger, Solana helpers, trading math
├── data/
│   ├── historical/               # Cached OHLCV for backtesting
│   └── logs/                     # Daily trade + signal logs
└── tests/
    ├── unit/                     # Indicator + math tests
    ├── integration/              # Agent communication tests
    └── backtest/                 # Strategy replay scripts
```

## Safety

- **Paper trade by default** — no live trades until you explicitly opt in
- **Kill switches** — auto-exit on max drawdown, daily loss limit, or API failures
- **Isolated wallet** — bot generates its own keypair, separate from your main wallet
- **Jito MEV protection** — transactions include Jito tips to prevent front-running
- **Full audit trail** — every signal, decision, and trade logged with timestamps
- **Private keys never logged** — keypair loaded from file, never in env vars or logs

## Roadmap

- [x] **Week 1** — Foundation: project scaffold, Redis bus, config, indicator engine, 6 built-in indicators
- [x] **Week 2** — Signal Agent + Optimizer Agent with backtesting and risk engine
- [x] **Week 3** — Executor Agent + paper trading + Telegram bot + dashboard
- [x] **Week 3.5** — 5 ChartPrime Pine Script translations (11-indicator confluence)
- [ ] **Week 4** — Integration testing, paper trade validation, $50 live deployment

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Language | TypeScript (Node.js) |
| DEX Routing | Jupiter v6 API |
| Market Data | Birdeye API |
| Blockchain | Solana (`@solana/web3.js`) |
| Message Bus | Redis pub/sub (ioredis) |
| Notifications | Telegram (`node-telegram-bot-api`) |
| MEV Protection | Jito |

## Built With The Gauntlet

This project was built using [The Gauntlet](https://github.com/gouchan/agent-swarm-config) — an autonomous agent swarm for shipping software. The grid bot's four agents are registered as Gauntlet agents, making it possible to use `/swarm`, `/pipeline`, and other orchestration commands during development.

## Disclaimer

This software is for educational and personal use only. All trading involves substantial risk of loss. Past performance of any strategy does not guarantee future results. The authors are not responsible for any financial losses incurred through use of this software. Always start with paper trading and never risk more than you can afford to lose.

## License

MIT
