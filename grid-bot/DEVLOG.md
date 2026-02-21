# Dev Log

Build diary for the Phantom Grid Bot. Raw notes, decisions, and learnings from each session.

---

## Week 1 — Foundation (2026-02-18)

### Session: Project Kickoff + Full Scaffold

**Goal:** Stand up the entire project foundation in one session — monorepo, message bus, config, indicator engine, all 6 indicators, and Gauntlet integration.

**Duration:** Single session
**Agents used:** Claude Code (planning + execution)
**Lines of code:** ~1,800 across 18 TypeScript source files

---

### Decisions Made

**1. Wallet: Fresh keypair, not Phantom extension**

The PRD originally spec'd Phantom MCP for transaction signing. For an autonomous terminal bot, a browser extension doesn't make sense. Decision: generate a fresh `Keypair` on first boot, save to `keypair.json`, fund it separately. Phantom MCP is still used as a documentation reference during development via the `/phantom` skill.

**2. Strategy: Hybrid (grid + breakout)**

User wanted the full PRD vision from day one. Rather than starting with just grid or just breakout, we're building both layers:
- Grid as the base layer (symmetric buy/sell levels)
- Breakout as an overlay (Bollinger squeeze + volume spike detection)
- SuperTrend as a directional filter (only grid-buy when bullish)

This is more complex but avoids a rewrite later.

**3. Redis over in-memory bus**

Even though the POC could use an in-memory event emitter, Redis was chosen because:
- Agents can run as separate processes (important for Week 2+)
- Shared state via Redis hashes (grid levels, positions, P&L)
- Natural path to multi-machine deployment later
- Homebrew install is trivial on macOS

**4. Indicator interface as the Pine Script adapter**

Instead of building a Pine Script parser (which is a massive undertaking), we built a clean TypeScript interface that every indicator implements. Pine Scripts get manually translated to TypeScript. The interface is simple enough that translation is mechanical:
- `ta.rsi(close, 14)` → `calculateRSI(closes, 14)`
- `ta.crossover(a, b)` → `prev_a <= prev_b && curr_a > curr_b`
- `input.int(14)` → `params.period`

The user has Pine Scripts ready to add later — they just drop a `.ts` file in `custom/` and register it.

---

### Architecture Notes

**Message Flow:**
```
Signal → Redis:signals → Optimizer → Redis:orders → Executor → Redis:executions → Telegram
```

Each Redis channel has a strongly-typed message interface. The `BusMessage` union type ensures type safety across all agent communication.

**Indicator Consensus Engine:**

All active indicators vote: buy, sell, or neutral. The engine counts votes and averages confidence:
- Majority buy + high confidence = `strong_buy`
- Majority buy + normal confidence = `buy`
- No majority = `neutral`

This prevents single-indicator false signals from triggering trades.

**Risk Profile System:**

Three tiers (low/medium/high) control everything:
- Max drawdown before kill switch
- Position size per trade
- Max open positions
- Daily loss limit
- Min grid spacing (prevents over-dense grids)
- Max slippage tolerance

The Optimizer Agent checks every proposed trade against the active risk profile before publishing to the orders channel.

---

### What Went Smooth

- TypeScript strict mode passed on first compile (zero errors)
- Redis installed + running in 30 seconds via Homebrew
- All 6 indicators implemented with correct math (Wilder's smoothing for RSI, proper EMA calculation)
- Gauntlet integration was clean — agent definitions follow the existing pattern exactly
- Monorepo structure is easy to navigate

### What To Watch

- `node-telegram-bot-api` has deprecated dependencies (har-validator, request). Works fine but may need replacement eventually.
- 17 npm audit vulnerabilities (mostly from transitive deps in telegram lib). None in our direct code.
- Birdeye API rate limits — Signal Agent polling interval needs to respect them (30s minimum).
- Jupiter v6 API has been stable but no official TypeScript SDK. We'll use raw HTTP via axios.

---

### Files Created

```
grid-bot/
├── package.json, tsconfig.json, .env.example, .gitignore
├── src/index.ts
├── src/bus/channels.ts, redis.ts, types.ts
├── src/config/default.ts, risk-profiles.ts, pairs.ts
├── src/indicators/types.ts, engine.ts
├── src/indicators/built-in/rsi.ts, ema.ts, atr.ts, macd.ts, bollinger.ts, supertrend.ts
├── src/indicators/custom/README.md
├── src/utils/logger.ts, math.ts, solana.ts

Gauntlet:
├── agents/signal-agent.md, optimizer-agent.md, trade-executor-agent.md
├── skills/grid-trading/SKILL.md, pine-adapter/SKILL.md, phantom/SKILL.md
├── commands/grid-bot.md
```

---

### Next Session: Week 2

**Priority:**
1. Birdeye API integration (price feed + OHLCV history)
2. Signal Agent main loop (poll → compute → publish)
3. Grid calculator (levels from price + spacing + capital)
4. Backtest engine (OHLCV replay with simulated fills)
5. Risk engine (drawdown tracking, kill switches)
6. Optimizer Agent main loop (receive → validate → backtest → approve)

**Open Questions:**
- Birdeye free tier rate limits? May need a paid key for production polling.
- Jupiter priority fee estimation — need to research dynamic fee calculation.
- Backtest data source — Birdeye OHLCV endpoint vs. cached local files.

---

## Week 2 — Signal + Optimizer (2026-02-19)

### Session: Birdeye Integration + Full Agent Pipeline

**Goal:** Get Signal Agent polling live data, Optimizer proposing orders, and the complete signal-to-order pipeline running.

- Birdeye API integration for OHLCV price feeds
- Signal Agent main loop: poll → compute indicators → publish consensus
- Optimizer Agent: receive signals → calculate grid → validate risk → propose orders
- Backtesting engine for strategy validation
- Risk engine with drawdown kill switches
- Grid tuned for bear market conditions (tighter spacing, more levels)

---

## Week 3 — Executor + Telegram (2026-02-20)

### Session: Paper Trading Pipeline + Telegram Bot

**Goal:** Complete the execution layer and user-facing notifications.

- Paper Trade Executor with slippage simulation and FIFO position matching
- Portfolio tracking: capital, P&L, win rate, trade history
- Telegram Bot with 6 commands: /status, /pnl, /grid, /pause, /resume, /help
- Push notifications for fills, signal changes, risk alerts
- ASCII terminal dashboard for live monitoring
- 5 safety fixes: pause/resume, fill direction, midnight reset, heartbeat error handling, renderer cleanup

---

## Week 3.5 — Pine Script Confluence (2026-02-21)

### Session: 5 ChartPrime Indicators Translation

**Goal:** Translate 5 TradingView Pine Script indicators (ChartPrime suite) into TypeScript for 11-indicator confluence trading.

**Duration:** Single session
**Agents used:** Claude Code (analysis + translation)
**Lines of code:** ~1,800 across 5 custom indicator files

---

### Decisions Made

**1. Signal logic added to zone/visual indicators**

The ChartPrime Pine Scripts are primarily visual — they draw boxes, lines, and labels but don't emit explicit buy/sell signals. For each indicator, we extracted the core detection logic and added signal generation:
- Zone indicators (SMR, FVP, FiboVP) → signal when price enters zone + confirmation candle
- Trend Channels → signal on channel position + liquidity breaks
- Momentum Ghost → native signal from CD state machine + projection

**2. Performance: capped lookbacks**

Pine's `max_bars_back = 2000` loops are fine when TV runs them once on the last bar. In our bot running every 30s, O(2000 × 100 levels) is expensive. We capped the touch-count lookback at 500 bars and the volume profile at 200 bars. Tradeoff: slightly less historical depth, but sub-10ms compute time.

**3. Sinc kernel implemented, not approximated**

The Momentum Ghost Machine uses a full Blackman-windowed sinc filter with Toeplitz convolution. We could have approximated it with cascaded EMAs, but the whole point of this indicator is its noise-rejection properties from proper DSP. The exact implementation matches Pine's math.

**4. Gamma function for statistical scoring**

The Filtered Volume Profile uses Student's t-distribution for peak scoring. We ported the full Lanczos gamma approximation (11-term DK series) and hypergeometric 2F1 function rather than using a lookup table. This ensures accuracy matches TradingView output.

---

### Indicators Translated

| # | Indicator | Core Technique | Signal Type |
|---|---|---|---|
| 1 | Smart Money Range | Pivot S/R + touch counting | Zone reversal |
| 2 | Fibo Volume Profile | Pivot point + fib extensions + volume | Fibo level + volume bias |
| 3 | Filtered Volume Profile | Sinc kernel smoothing + peak detection + t-dist | POC proximity + volume strength |
| 4 | Trend Channels | Pivot channels + ATR width + liquidity breaks | Channel break + position |
| 5 | Momentum Ghost | Sinc filter + CD histogram + ghost projection | Momentum + CD state + projection |

### Verification

All 11 indicators tested together on synthetic data:
- Clean TypeScript compilation (zero errors)
- Consensus engine correctly aggregates all 11 votes
- Individual smoke tests confirm correct signal generation
- Uptrend data → Momentum Ghost produces buy @ 0.816 confidence

---

### Files Created

```
src/indicators/custom/
├── smart-money-range.ts       # ~250 lines
├── fibo-volume-profile.ts     # ~230 lines
├── filtered-volume-profile.ts # ~350 lines (gamma, t-dist, sinc kernel)
├── trend-channels.ts          # ~280 lines
└── momentum-ghost.ts          # ~300 lines (sinc filter, Toeplitz convolution)
```

Modified: `engine.ts` (imports + registration), `config/default.ts` (active indicators list)

---

### Next Session: Week 4

**Priority:**
1. End-to-end integration test (full pipeline with all 11 indicators)
2. 30-day historical backtest with the new indicator suite
3. Compare 6-indicator vs 11-indicator consensus quality
4. Security audit (keypair, slippage, API key handling)
5. Live deployment prep with $50 capital

---

*Built with [The Gauntlet](https://github.com/gouchan/agent-swarm-config) agent swarm.*
