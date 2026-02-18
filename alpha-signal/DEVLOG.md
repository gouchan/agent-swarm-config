# Alpha Signal - Development Log

## Build Timeline

**Built in a single session** using The Gauntlet agent swarm (Claude Code + 46 agents).

---

### Phase 1: Scaffold + Polymarket Client
- Initialized Node.js project with TypeScript strict mode
- Built Polymarket Gamma API client (`gamma-api.polymarket.com`)
- Discovered: Gamma API requires zero auth for read-only access
- Added TTL cache layer to avoid hammering the API
- **Verified**: Live smoke test returned real market data

### Phase 2: Telegram Bot
- Integrated Grammy framework for Telegram Bot API
- Built `/markets [query]` command - browse and search active markets
- HTML formatting for Telegram messages (bold, links, monospace)
- Graceful error handling with user-friendly messages

### Phase 3: State Management + Watch/Portfolio
- JSON file-backed persistence (no database needed for MVP)
- `/watch <id>` - subscribe to market price changes
- `/portfolio` - view all watched markets with current prices
- State stored in `./data/` directory (gitignored)

### Phase 4: X/Twitter Integration
- Integrated `x-research-skill` as a subprocess for isolation
- Fallback to direct Twitter API v2 if subprocess unavailable
- `/research <topic>` - search recent tweets about any topic
- Results formatted with author, engagement metrics, links

### Phase 5: AI Analysis Pipeline
- Claude Agent SDK integration via `@anthropic-ai/sdk`
- `/signal <topic>` - combines Polymarket odds + X sentiment
- AI generates conviction rating (1-5), key drivers, risk factors
- Graceful degradation: works without API key (skips AI analysis)
- SDK marked as `optionalDependency` - bot runs without it

### Phase 6: Automated Alerts
- `node-cron` scheduler for recurring tasks
- **Price Monitor**: polls watched markets, alerts on threshold breaches
- **Daily Briefing**: AI-generated morning summary of all positions
- Configurable: poll interval, alert threshold, briefing hour
- Dispatcher sends formatted alerts to configured chat ID

### Phase 7: Gauntlet Integration
- Created `agents/alpha-signal-analyst.md` agent definition
- Created `skills/alpha-signal/SKILL.md` skill file
- Created `commands/alpha-signal.md` slash command
- Created `deploy/examples/alpha-signal-bot.ts` for Agent SDK deployment

---

## Security Audit & Hardening

After initial build, ran a full security audit. Found and fixed:

### Critical (3)
1. **LLM output injected raw into HTML** - AI responses could contain HTML tags that Telegram would render. Fixed with `sanitizeLlmOutput()` (strip HTML tags, then escape entities).
2. **Same issue in daily briefing** - Applied same `sanitizeLlmOutput()` fix.
3. **Full `process.env` passed to subprocess** - X research subprocess received all env vars including `ANTHROPIC_API_KEY`. Fixed with `subprocessEnv()` allowlist: only PATH, HOME, USER, SHELL, LANG, TERM, X_BEARER_TOKEN, NODE_ENV.

### Important (12)
4. **Non-null assertions on `ctx.chat`** - Replaced `ctx.chat!.id` with null guards + early return.
5. **Missing `.catch()` on `editMessageText`** - Fire-and-forget edits could throw unhandled rejections. Added `.catch(() => {})`.
6. **No fetch timeouts** - API calls could hang forever. Added `fetchWithTimeout()` with 15s AbortController.
7. **Unvalidated market IDs** - User input used directly in URLs. Added regex validation `[a-zA-Z0-9_-]+`.
8. **`encodeURIComponent` missing** - Market IDs not URL-encoded in fetch calls. Fixed.
9. **Race condition in state writes** - Concurrent cron + user writes could corrupt JSON. Fixed with atomic writes (tmp file + `rename`).
10. **Stale snapshot false alerts** - Price monitor could trigger on hours-old cached data. Added `MAX_SNAPSHOT_AGE_MS` guard.
11. **Unbounded cache growth** - TTL cache had no size limit. Added `MAX_ENTRIES = 100` with eviction.
12. **8 duplicate `escapeHtml` functions** - Consolidated into `src/utils/format.ts`.
13. **Dead code** - Removed unused `prompts/signal.ts` and `prompts/briefing.ts`.
14. **Missing optional dep declaration** - `@anthropic-ai/sdk` not in package.json. Added as `optionalDependencies`.
15. **`getPriceNHoursAgo` drift** - Could return snapshots far outside requested window. Added `maxDrift` guard.

### Minor (12)
- Error messages escaped in HTML output
- LLM prompts include "do NOT use HTML" instruction
- Config values clamped to valid ranges (prevents NaN in cron)
- `unhandledRejection` + `uncaughtException` handlers added
- Chat IDs redacted from log output
- Log level parsing validated

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20+ / tsx |
| Language | TypeScript (strict mode) |
| Telegram | Grammy |
| AI | Anthropic Claude SDK |
| Scheduling | node-cron |
| Data | Polymarket Gamma REST API |
| Social | X/Twitter API v2 |
| State | JSON files (atomic writes) |

## File Stats

- **21 source files** across 7 directories
- **~2,000 lines** of TypeScript
- **0 external databases** - flat file state
- **3 API integrations** - Polymarket, Telegram, Anthropic (+ optional Twitter)
- **26 files total** in initial commit

---

*Built with The Gauntlet v2.0 - 46 agents, 85 skills, 42 commands.*
