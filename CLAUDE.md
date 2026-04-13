# CLAUDE.md

This file is the hot cache — loaded every session. Full memory lives in `memory/`.

## Who I'm Working With

**Robinson Chan** — Visual designer at Robinhood. Uses Claude as a co-builder to ship code, automate workflows, and bring projects to life. Aspiring solo founder / creative consultant.

| | |
|---|---|
| **Day job** | Visual Designer, Robinhood |
| **GitHub** | [gouchan](https://github.com/gouchan) |
| **Interests** | Crypto/markets, AI agents, image/video gen, TikTok content, creative consulting |
| **Goal** | Autonomous creative/strategy/AI practice |

**Active projects:** `solana-trade-bot`, `crypto-ai-hedge-fund`, `eliza-starter`, `ZerePy`, `OpenManus`, `reelclaw`, `bet-scan-scheduler`, `Channy-AI`

## How to Work

1. **Ask first** — clarify before acting on anything non-trivial
2. **Show options** — present 2–3 approaches before committing to one
3. **Build** — execute clearly, think out loud on tradeoffs
4. **Save** — always write files to the workspace folder, default to `.md`, version when iterating

## Voice

Conversational & clear. No sycophantic openers, no jargon, no restating the question. Say the thing. → Full guide: `memory/voice-and-style.md`

## Memory Files

| File | What's in it |
|---|---|
| `memory/about-me.md` | Full context on Robinson, projects, priorities |
| `memory/voice-and-style.md` | Tone, formatting rules, hard no's, examples |
| `memory/working-rules.md` | Operating manual — how Claude should behave |
| `memory/skill-building-guide.md` | Skills reference from Anthropic guide |

---

This file provides guidance when working with code in this repository.

## Environment Overview

This is a development home directory containing multiple independent projects, primarily focused on AI agents, cryptocurrency/Solana trading bots, and automation tools.

**Key projects:**
- `solana-trade-bot/` - Solana trading bot
- `crypto-ai-hedge-fund/` - AI-powered cryptocurrency hedge fund
- `eliza-starter/` - Eliza AI agent starter project
- `ZerePy/` - AI agent framework
- `OpenManus/` - Python-based AI agent project
- `bet-scan-scheduler/` - Betting scanner/scheduler
- `Channy-AI/` - AI assistant with src/ directory
- `CascadeProjects/` - Contains rapteegenerator and virattt-ai-hedge-fund

## Development Environment

**Languages & Runtimes:**
- Node.js (located at `/usr/local/bin/node`)
- Python 3 (located at `/opt/homebrew/bin/python3`)
- npm global packages installed to `~/.npm-global/bin`

**Root-level dependencies:**
- Node: `openai`, `solana-agent-kit`
- Dev tools: TypeScript, pyright (Python type checker)

## Working with Projects

**Navigation:**
Each subdirectory is a separate project with its own dependencies and build process. Always `cd` into the specific project directory before running commands.

**Common patterns:**
- Node.js projects: Look for `package.json` and use `npm install`, `npm run build`, `npm test`
- Python projects: Look for `requirements.txt`, `main.py`, or `setup.py`. Use `pip install -r requirements.txt`
- Check individual project READMEs for specific setup and run instructions

## Important Notes

- This home directory is tracked as a git repository (unusual setup)
- LM Studio CLI tools available at `~/.lmstudio/bin`
- When working on a specific project, always navigate to that project's directory first
- Each project likely has different environment variable requirements (check for `.env` or `.env.example` files)

---

## Skills

Build a skill for any repeatable workflow you'd explain more than once. Full guide: `memory/skill-building-guide.md` | Template: `skills/_template/SKILL.md`

| Skill | Location | Purpose |
|---|---|---|
| reelclaw | `skills/reelclaw/` | UGC-style short-form video reel pipeline |
| _(add new skills here)_ | `skills/[name]/` | |
