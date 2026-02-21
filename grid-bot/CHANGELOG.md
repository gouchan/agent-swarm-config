# Changelog

All notable changes to the Phantom Grid Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [0.1.0] - 2026-02-18

### Added

**Project Foundation**
- TypeScript monorepo scaffold with strict type checking
- Package configuration with all dependencies (`@solana/web3.js`, `ioredis`, `node-telegram-bot-api`, `axios`, `bs58`)
- Environment configuration template (`.env.example`) with all required variables
- Main entry point (`src/index.ts`) that boots config, wallet, Redis, and agent stubs

**Redis Message Bus**
- Pub/sub client with publisher + subscriber connections (`src/bus/redis.ts`)
- 6 channel definitions: signals, orders, executions, risk-alerts, heartbeat, commands
- Full message type definitions for all inter-agent communication
- Shared state via Redis hash (get/set/getAll)

**Configuration System**
- Default grid config: SOL/USDC, 5 levels, 2.5% spacing, $50 capital, hybrid strategy
- Three risk profiles (low/medium/high) with drawdown limits, position sizing, slippage tolerance
- Token pair registry with Solana mint addresses (SOL, USDC, USDT)
- Strategy config with breakout overlay parameters

**Indicator Engine**
- Plug-in architecture with `Indicator` interface for custom indicators
- Registry with auto-discovery for built-in and custom indicators
- Consensus engine that aggregates all indicator signals into buy/sell/neutral
- Confidence scoring (0-1) for signal strength

**6 Built-in Indicators** (translated from TradingView Pine Script)
- **RSI** — Relative Strength Index with Wilder's smoothing (period: 14, overbought: 70, oversold: 30)
- **EMA Crossover** — Fast/slow exponential moving average crossover (9/21)
- **ATR** — Average True Range for volatility measurement and dynamic grid spacing
- **MACD** — Moving Average Convergence Divergence with histogram (12/26/9)
- **Bollinger Bands** — Volatility bands with %B position and squeeze detection (20, 2)
- **SuperTrend** — Trend-following overlay for directional bias filtering (ATR: 10, multiplier: 3)

**Pine Script Adapter Layer**
- `src/indicators/custom/` directory for drop-in custom indicators
- Translation guide (`README.md`) with Pine Script to TypeScript mapping
- No rebuild needed — new indicators auto-register with the engine

**Utilities**
- Structured logger with color-coded terminal output + daily file logging
- Solana RPC connection singleton with keypair management (auto-generate on first run)
- Balance checking for SOL and SPL tokens
- Trading math: grid level calculation, position sizing, P&L computation, risk/reward ratio

**Gauntlet Integration**
- 3 new agent definitions: `signal-agent`, `optimizer-agent`, `trade-executor-agent`
- 2 new skills: `grid-trading`, `pine-adapter`
- 1 new command: `/grid-bot` (start, stop, status, backtest, config)
- Phantom MCP skill for wallet SDK documentation

**Infrastructure**
- Redis 8.6.0 installed via Homebrew (local, zero cost)
- Git repository with `.gitignore` (keypair.json, .env, node_modules, dist)
- Zero TypeScript errors on strict mode

### Security
- Bot keypair isolated from main Phantom wallet
- Private keys loaded from file path, never from environment variables
- Keypair file excluded from git via `.gitignore`
- Paper trade mode enabled by default — no live transactions without explicit opt-in

---

## [0.3.1] - 2026-02-21

### Added

**5 Custom Indicators — Pine Script Translations from ChartPrime**

All translated from TradingView Pine Script v5, licensed MPL-2.0. Each indicator votes in the consensus engine alongside the 6 built-in indicators (11 total).

- **Smart Money Range** (`smart-money-range`) — Pivot-based institutional S/R zone detection with touch-count scoring. Signals buy at support zones with bullish rejection candles, sell at resistance with bearish rejection.
- **Fibo Levels with Volume Profile** (`fibo-volume-profile`) — Higher-timeframe pivot point with 6 Fibonacci extensions (0.382/0.618/1.0), volume profile bins, bull/bear volume ratio, Point of Control (POC), and directional target projection.
- **Filtered Volume Profile** (`filtered-volume-profile`) — Kernel-smoothed (sinc/Lanczos) volume profile across 100 price bins. Peak detection via local maxima with percentile thresholding. Student's t-distribution mean scoring for statistical significance. Full gamma function + hypergeometric implementation.
- **Trend Channels with Liquidity Breaks** (`trend-channels`) — Dynamic ascending/descending channels from consecutive pivots with ATR-based width. Detects liquidity breaks when price exits channel boundaries. Volume scoring via WMA normalization (LV/MV/HV classification).
- **Momentum Ghost Machine** (`momentum-ghost`) — Sinc-kernel (Blackman-windowed) smoothed momentum oscillator. Toeplitz convolution for LTI filtering. WMA post-smoothing, double-EMA signal MA, CD histogram with 4-state machine, and 2-bar ghost projection via velocity averaging.

### Changed

- Indicator engine now registers 11 indicators (6 built-in + 5 custom)
- Active indicators list in config updated to include all 11
- ATR `calculateATR` function now exported for reuse by custom indicators

---

## [0.3.0] - 2026-02-20

### Added

**Executor Agent — Paper Trade Simulator**
- Full paper trade execution with realistic slippage simulation (Jupiter-like 0.25% fees)
- Portfolio tracking: capital, P&L (total + daily), win rate, open positions
- FIFO position matching for round-trip trade completion
- Redis state persistence for portfolio and summary
- Midnight UTC daily P&L reset

**Telegram Bot Agent**
- Push notifications for fills, signal changes, risk alerts
- 6 commands: /start, /status, /pnl, /grid, /pause, /resume, /help
- Markdown-formatted status cards with market + portfolio data
- Pause/resume trading via Telegram (publishes to Redis commands channel)
- Graceful optional boot — works without TELEGRAM_BOT_TOKEN

**Dashboard**
- Event-driven ASCII terminal grid snapshots
- Live price, signal, grid level visualization

### Fixed

- Pause/resume commands now propagate to Optimizer and Executor agents
- Telegram fill notifications show correct buy/sell direction from execution metadata
- Midnight daily P&L reset uses date string comparison (no more drift misses)
- Heartbeat publishes wrapped in try/catch across all agents
- Dashboard renderer dead code cleanup

---

## [0.2.0] - 2026-02-19

### Added

- Signal Agent with Birdeye API integration and indicator consensus pipeline
- Optimizer Agent with grid calculator, backtesting engine, and risk management
- Breakout detection overlay with Bollinger squeeze + volume confirmation
- Risk engine with drawdown kill switches and position limits
- Grid config tuned for bear market (2.5% to 1.0% spacing, 5 to 7 levels)

---

## [Unreleased]

### Planned for v0.4.0 (Week 4)
- End-to-end integration testing
- 30-day historical backtest validation
- Security audit (keypair handling, slippage protection)
- Live deployment with $50 capital on SOL/USDC
