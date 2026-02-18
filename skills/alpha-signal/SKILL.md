---
name: alpha-signal
description: Prediction market intelligence - cross-reference Polymarket data with X/Twitter sentiment to detect alpha signals
argument-hint: <topic to analyze>
---

# Alpha Signal Skill

Cross-reference prediction market pricing (Polymarket) with social sentiment (X/Twitter) to detect divergence and alpha signals.

## Usage

```
/alpha-signal <topic>
/alpha-signal "Trump tariffs"
/alpha-signal "Bitcoin ETF"
/alpha-signal "AI regulation"
```

## How It Works

1. **Market Data** - Fetches matching Polymarket markets (prices, volume, movement)
2. **Social Sentiment** - Searches X/Twitter for trending discourse on the topic
3. **AI Analysis** - Routes both datasets to `alpha-signal-analyst` agent for cross-referencing
4. **Signal Output** - Narrative, conviction rating (1-5), directional edge, risks

## Protocol

When invoked with a topic:

### Step 1: Gather Market Data
Search Polymarket Gamma API for markets matching the topic:
```
Fetch: https://gamma-api.polymarket.com/markets?active=true&closed=false&order=volume&ascending=false
Filter: markets where question contains topic keywords
Extract: question, YES/NO prices, volume, recent movement
```

### Step 2: Gather Social Data
Use x-research skill or X API to search for the topic:
```
Search: "<topic>" --sort likes --limit 10 --quick
Extract: top tweets, engagement metrics, key accounts
```

### Step 3: Cross-Reference Analysis
Delegate to `alpha-signal-analyst` agent:
```
Task(subagent_type="alpha-signal-analyst", prompt="
  Analyze divergence between market pricing and social sentiment for: <topic>

  Market Data:
  <market summary>

  Social Data:
  <tweet summary>
")
```

### Step 4: Format Output
Present the analysis with:
- Narrative summary
- Conviction rating (1-5)
- Directional edge (bullish/bearish/neutral)
- Key risks
- Data sources used

## Telegram Bot

Alpha Signal also runs as a standalone Telegram bot. See `alpha-signal/` directory.

### Bot Commands
| Command | Description |
|---------|-------------|
| `/markets` | Top Polymarket markets by volume |
| `/signal <topic>` | Full AI cross-analysis |
| `/watch <id>` | Watch a market for price alerts |
| `/portfolio` | View watched markets |
| `/research <query>` | X/Twitter research |

### Automated Alerts
- Price moves >5% in 1hr on watched markets
- Daily briefing at 8am UTC

## Dependencies

- Polymarket Gamma API (no auth required)
- X Bearer Token (for Twitter data)
- Anthropic API Key (for AI analysis)
