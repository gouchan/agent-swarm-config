# Alpha Signal

Prediction market intelligence bot for Telegram. Combines real-time Polymarket data with X/Twitter sentiment analysis and AI-powered signal generation.

```
┌──────────────────────────────────────────────────────┐
│                   ALPHA SIGNAL                        │
│                                                      │
│   Polymarket Data ──┐                                │
│                     ├──► Claude AI ──► Telegram Bot  │
│   X/Twitter Feed ───┘                                │
│                                                      │
│   Read-only MVP  |  No trade execution               │
└──────────────────────────────────────────────────────┘
```

## Features

| Command | Description |
|---------|-------------|
| `/markets [query]` | Browse active Polymarket prediction markets |
| `/watch <id>` | Track a market and get price change alerts |
| `/portfolio` | View all watched markets at a glance |
| `/signal <topic>` | AI analysis combining market odds + social sentiment |
| `/research <topic>` | Deep X/Twitter research on any topic |
| `/help` | List all commands |

### Automated Alerts
- **Price Monitor** - Polls watched markets every N minutes, alerts on significant moves (configurable threshold)
- **Daily Briefing** - AI-generated morning summary of all watched markets (configurable hour UTC)

## Architecture

```
alpha-signal/
├── src/
│   ├── index.ts                 # Entry point, starts bot + scheduler
│   ├── config.ts                # Environment config with validation
│   ├── bot/
│   │   ├── bot.ts               # Grammy Telegram bot setup
│   │   └── commands/            # /markets, /watch, /signal, etc.
│   ├── data/
│   │   ├── polymarket/          # Gamma API client + TTL cache
│   │   └── twitter/             # X research via subprocess or API
│   ├── analysis/
│   │   └── agent-sdk.ts         # Claude AI analysis pipeline
│   ├── alerts/
│   │   ├── scheduler.ts         # node-cron job registration
│   │   ├── price-monitor.ts     # Poll & detect price changes
│   │   ├── daily-briefing.ts    # Morning AI briefing
│   │   └── dispatcher.ts        # Send alerts to Telegram
│   ├── state/
│   │   └── store.ts             # JSON file-backed persistence
│   └── utils/
│       └── format.ts            # HTML escaping, sanitization
├── data/                        # Runtime state (gitignored)
├── package.json
└── tsconfig.json
```

### Design Decisions

- **Read-only** - No trade execution, no wallet integration. Pure intelligence.
- **Graceful degradation** - Works without `ANTHROPIC_API_KEY` (skips AI analysis) and without `X_BEARER_TOKEN` (Polymarket-only mode).
- **Subprocess isolation** - X/Twitter research runs in a sandboxed subprocess with restricted env vars.
- **Atomic writes** - State files written via tmp + rename to prevent corruption.
- **LLM output sanitization** - All AI-generated text is stripped of HTML and escaped before embedding in Telegram messages.

## Quick Start

### 1. Prerequisites

- Node.js 20+
- A Telegram Bot Token (from [@BotFather](https://t.me/BotFather))

### 2. Install

```bash
cd alpha-signal
npm install
```

### 3. Configure

```bash
cp .env.example .env
# Edit .env with your keys
```

Required:
```
TELEGRAM_BOT_TOKEN=your-bot-token
```

Optional (enables additional features):
```
ANTHROPIC_API_KEY=sk-ant-...        # Enables /signal AI analysis + daily briefing
X_BEARER_TOKEN=AAAA...              # Enables /research X/Twitter integration
TELEGRAM_ALERT_CHAT_ID=123456789    # Chat ID for automated alerts
PRICE_ALERT_THRESHOLD=5             # % change to trigger alert (default: 5)
POLL_INTERVAL_MINUTES=5             # How often to check prices (default: 5)
BRIEFING_HOUR_UTC=8                 # Daily briefing hour in UTC (default: 8)
STATE_DIR=./data                    # Where to store state files
LOG_LEVEL=info                      # debug | info | warn | error
```

### 4. Run

```bash
# Development (hot reload)
npm run dev

# Production
npm start
```

## API Dependencies

| Service | Auth Required | Used For |
|---------|--------------|----------|
| [Polymarket Gamma API](https://gamma-api.polymarket.com) | No | Market data, prices, volumes |
| [Telegram Bot API](https://core.telegram.org/bots/api) | Yes (token) | User interface |
| [Anthropic Claude API](https://docs.anthropic.com) | Yes (API key) | AI signal analysis |
| [X/Twitter API v2](https://developer.twitter.com) | Yes (bearer) | Social sentiment |

## Security

- All user inputs validated and escaped before use in API calls or HTML
- LLM outputs sanitized (HTML stripped + escaped) before Telegram display
- Subprocess env restricted to allowlist (PATH, HOME, X_BEARER_TOKEN only)
- Fetch calls have 15s timeouts via AbortController
- Market IDs validated against `[a-zA-Z0-9_-]` pattern
- State files use atomic write (tmp + rename) to prevent corruption
- No secrets logged; chat IDs redacted from logs

## Gauntlet Integration

Alpha Signal is built to work with [The Gauntlet](https://github.com/gouchan/agent-swarm-config) agent swarm:

```bash
# Use the dedicated agent
# (auto-loaded from agents/alpha-signal-analyst.md)

# Use the slash command
/alpha-signal "Will Trump win 2024?"

# Deploy as autonomous bot via Agent SDK
npx tsx deploy/examples/alpha-signal-bot.ts
```

## License

MIT
