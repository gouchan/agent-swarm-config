<p align="center">
  <img src="https://img.shields.io/badge/agents-46-blueviolet?style=for-the-badge" />
  <img src="https://img.shields.io/badge/skills-85-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/commands-42-green?style=for-the-badge" />
  <img src="https://img.shields.io/badge/MCP_servers-5-orange?style=for-the-badge" />
</p>

# The Gauntlet

**An autonomous agent swarm for Claude Code.**

Drop in 46 specialized agents, 85 skills, and 42 commands that turn Claude into an orchestrated development team. Build apps, create videos, run security audits, and ship production code — with parallel execution, atomic task claiming, and cost-quality tiers.

```
         You: "Build an expense tracker with auth"
              │
              ▼
┌─────────────────────────────────┐
│         THE GAUNTLET            │
│                                 │
│  analyst    ──▶  architect      │
│  executor   ──▶  executor       │  ← 5 agents working in parallel
│  executor   ──▶  designer       │
│  qa-tester  ──▶  security       │
│  code-reviewer                  │
│                                 │
│  Result: working, tested app    │
└─────────────────────────────────┘
```

---

## Why?

Vanilla Claude Code is one agent doing one thing at a time. The Gauntlet makes it a team:

| | Vanilla Claude | The Gauntlet |
|---|---|---|
| Execution | Sequential | **Parallel** (N agents, atomic task claiming) |
| Role awareness | Generic | **46 specialists** (architect, executor, qa, security...) |
| Cost control | Fixed model | **Tiered** — haiku for simple, opus for complex |
| Orchestration | Chat | **6 modes** — swarm, pipeline, autopilot, ultrapilot, ecomode, ultrawork |
| Video | No | **31 Remotion rules** for programmatic video |
| Guardrails | None | **Enforced constraints** — architect can't write files, executor can't design |
| Deployment | Manual | **Agent SDK templates** — CI/CD, cron, webhooks |

---

## Quick Start

```bash
git clone https://github.com/gouchan/agent-swarm-config.git
cd agent-swarm-config

# Install agents, skills, and commands into Claude Code
mkdir -p ~/.claude/agents ~/.claude/skills ~/.claude/commands
cp -r agents/* ~/.claude/agents/
cp -r skills/* ~/.claude/skills/
cp -r commands/* ~/.claude/commands/

# (Optional) Configure MCP servers
cp .mcp.json.example .mcp.json  # add your Firecrawl API key

# Start Claude Code — the full gauntlet is now loaded
claude
```

---

## Orchestration Modes

### `/swarm` — Parallel Agents

Spin up N agents that claim tasks from a shared queue. Fast agents claim more work. Deadlock-free via 5-minute timeouts and atomic claiming.

```
/swarm 5:executor "Fix all TypeScript errors across the codebase"
```

```
Orchestrator creates task list (30 files)
  ├── executor-1: claims file-1 ✓, claims file-6 ✓, claims file-11 ✓ ...
  ├── executor-2: claims file-2 ✓, claims file-7 ✓, claims file-12 ✓ ...
  ├── executor-3: claims file-3 ✓, claims file-8 ✓ ...
  ├── executor-4: claims file-4 ✓, claims file-9 ✓ ...
  └── executor-5: claims file-5 ✓, claims file-10 ✓ ...
```

### `/pipeline` — Sequential Chain

Output from one agent flows into the next. Each stage builds on the last.

```
/pipeline architect → executor → qa-tester → security-reviewer
```

### `/autopilot` — Full Autonomous

From idea to shipped code in 5 phases, zero intervention.

```
/autopilot "Build a landing page with Stripe checkout"
```

```
Phase 0: Expansion     → analyst extracts requirements, architect writes spec
Phase 1: Planning      → architect creates plan, critic validates
Phase 2: Execution     → executors + designers build in parallel
Phase 3: QA            → build → lint → test → fix (up to 5 cycles)
Phase 4: Validation    → architect, security-reviewer, code-reviewer all APPROVE
```

### `/ultrapilot` — Speed Mode

3-5x parallel workers for time-critical tasks.

### `/ultrawork` — Deep Work

Extended focus mode for complex implementations.

### `/ecomode` — Budget Mode

30-50% token savings. Same quality, smarter routing.

---

## Agents (46)

Every agent has a defined role, model assignment, and tool restrictions. The architect **cannot** write files. The executor **cannot** design architecture. This prevents the chaos of a generalist trying to do everything.

### Architecture & Planning

| Agent | Model | Role |
|-------|-------|------|
| `architect` | opus | Strategic design advisor. **Read-only** — analyzes, never implements. |
| `architect-medium` | sonnet | Balanced architecture analysis |
| `architect-low` | haiku | Quick architectural questions |
| `planner` | sonnet | Strategic task planning |
| `analyst` | sonnet | Requirements analysis |
| `prd-writer` | sonnet | Product requirements docs |
| `project-task-planner` | sonnet | Break projects into tasks |

### Building

| Agent | Model | Role |
|-------|-------|------|
| `executor` | sonnet | Code implementation — full write access |
| `executor-high` | opus | Complex implementations |
| `executor-low` | haiku | Simple changes, fast & cheap |
| `designer` | sonnet | UI implementation |
| `designer-high` | opus | Complex UI/UX work |
| `designer-low` | haiku | Simple UI tweaks |
| `build-fixer` | sonnet | Fix build and compilation errors |
| `tdd-guide` | sonnet | Test-driven development |
| `frontend-designer` | sonnet | UI/UX design patterns |

### Quality & Security

| Agent | Model | Role |
|-------|-------|------|
| `qa-tester` | sonnet | Quality assurance, tmux-based CLI testing |
| `qa-tester-high` | opus | Deep QA with edge case coverage |
| `code-reviewer` | sonnet | Code quality review |
| `security-reviewer` | sonnet | Security vulnerability analysis |
| `security-auditor` | sonnet | Full security audit |
| `critic` | sonnet | Constructive criticism |

### Research & Analysis

| Agent | Model | Role |
|-------|-------|------|
| `researcher` | sonnet | Deep research with web search |
| `scientist` | sonnet | Data analysis with persistent Python REPL |
| `scientist-high` | opus | Complex data science |
| `explore` | sonnet | Codebase exploration |
| `vision` | sonnet | Visual analysis (screenshots, diagrams) |

### Specialized

| Agent | Model | Role |
|-------|-------|------|
| `writer` | sonnet | Technical writing |
| `git-guru` | sonnet | Git history, squash, PRs |
| `test-time-travel` | sonnet | `git bisect` bug hunting |
| `dependency-detective` | sonnet | CVE scanning, dependency audits |
| `perf-profiler` | sonnet | Performance profiling |
| `mermaid-diagram-specialist` | sonnet | Architecture diagrams |

### Cost-Quality Tiers

Most agents come in tiered versions. Use the right tier for the job:

```
executor-low   → haiku   → fast, cheap   → rename a variable
executor       → sonnet  → balanced      → implement a feature
executor-high  → opus    → best quality  → redesign auth system
```

---

## Skills (85)

Skills are reusable capabilities that agents invoke. Full catalog in [SKILLS.md](SKILLS.md).

### Orchestration
`/swarm` `/pipeline` `/autopilot` `/ultrapilot` `/ultrawork` `/ecomode` `/ralph` `/orchestrate`

### Research
`/perplexity` `/deepsearch` `/codex` `/research` `/gemini`

### Development
`/react-dev` `/tdd` `/build-fix` `/code-review` `/security-review` `/git-master` `/frontend-ui-ux` `/database-schema-designer` `/openapi-to-typescript` `/mui`

### Video (Remotion)
`/remotion` — programmatic video creation with 31 rule files covering animations, transitions, captions, audio, 3D (Three.js), charts, Lottie, GIFs, fonts, Tailwind, and Mapbox.

```
/remotion "Create a TikTok-style video with animated captions"
```

### Diagrams
`/mermaid-diagrams` `/excalidraw` `/c4-architecture` `/draw-io` `/marp-slide`

### Communication
`/compose-email` `/viral-tweet` `/humanizer` `/professional-communication`

### Utilities
`/doctor` `/hud` `/note` `/learner` `/release` `/cancel`

---

## MCP Servers (5)

| Server | What it does |
|--------|-------------|
| **Firecrawl** | Scrape any URL to markdown, crawl sites, extract structured data |
| **Chrome** | Browser automation, screenshots, form filling |
| **Roblox Studio** | Game development, instance manipulation, Lua scripting |
| **Notion** | Read/write pages, databases, documentation |
| **Stripe** | Payments, subscriptions, invoices, checkout flows |

---

## Deployment

The Gauntlet agents can run autonomously via the [Claude Agent SDK](https://docs.anthropic.com/en/docs/agents-and-tools/claude-agent-sdk).

```bash
npm install -g @anthropic-ai/claude-agent-sdk
export ANTHROPIC_API_KEY=your-key
```

### Ready-to-Deploy Examples

| Agent | Command | Use Case |
|-------|---------|----------|
| Security Scanner | `npx ts-node deploy/examples/security-scanner.ts` | CVE scanning + code audit |
| App Builder | `npx ts-node deploy/examples/app-builder.ts "desc"` | Autonomous app development |
| Video Creator | `npx ts-node deploy/examples/video-creator.ts "desc"` | Remotion video generation |
| Scheduled Audit | `npx ts-node deploy/examples/scheduled-audit.ts` | Daily codebase audits |

### Quick Example

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

for await (const message of query({
  prompt: "Build a React Native expense tracker",
  options: {
    allowedTools: ["Read", "Write", "Edit", "Bash", "Task"],
    permissionMode: "acceptEdits",
  }
})) {
  if ("result" in message) console.log(message.result);
}
```

Deploy as CI/CD pipelines, webhook handlers, cron jobs, or standalone services. See [`deploy/README.md`](deploy/README.md) for full docs.

---

## Project Structure

```
.
├── agents/                  # 46 agent definitions
│   ├── architect.md         #   read-only strategic advisor (opus)
│   ├── executor.md          #   full-write implementation (sonnet)
│   ├── executor-low.md      #   cheap/fast variant (haiku)
│   ├── qa-tester.md         #   interactive testing (tmux)
│   ├── scientist.md         #   data analysis (python repl)
│   └── ...
├── skills/                  # 85 skill definitions
│   ├── swarm/               #   parallel agent orchestration
│   ├── autopilot/           #   5-phase autonomous execution
│   ├── remotion/            #   video creation (31 rules)
│   ├── pipeline/            #   sequential chaining
│   └── ...
├── commands/                # 42 slash commands
│   ├── swarm.md
│   ├── autopilot.md
│   ├── pipeline.md
│   └── ...
├── deploy/                  # Agent SDK deployment templates
│   └── examples/
│       ├── app-builder.ts
│       ├── security-scanner.ts
│       ├── video-creator.ts
│       └── scheduled-audit.ts
├── CLAUDE.md                # Full architecture reference
├── SKILLS.md                # Skills catalog
└── package.json
```

---

## Examples

### Build an app from scratch
```
/autopilot "Build a habit tracker with streaks, reminders, and a stats dashboard"
```

### Fix bugs in parallel
```
/swarm 5:executor "Fix all lint warnings"
```

### Research then build
```
/pipeline researcher → architect → executor → qa-tester
"Research best practices for WebSocket auth, then implement it"
```

### Create a product demo video
```
/remotion "30-second product demo with screen recordings and animated captions"
```

### Security audit
```
/security-review
```

### Deep codebase exploration
```
/deepsearch "How does the payment flow work?"
```

### Cost-conscious development
```
/ecomode
"Refactor the user service to use dependency injection"
```

---

## Configuration

### MCP Servers

Copy the example config and add your API keys:

```bash
cp .mcp.json.example .mcp.json
```

```json
{
  "mcpServers": {
    "firecrawl": {
      "command": "npx",
      "args": ["-y", "firecrawl-mcp"],
      "env": { "FIRECRAWL_API_KEY": "your-key" }
    }
  }
}
```

### Environment

- **Node.js:** v22+ (`/usr/local/bin/node`)
- **Python 3:** (`/opt/homebrew/bin/python3`)
- **Claude Agent SDK:** `npm install -g @anthropic-ai/claude-agent-sdk`

---

## License

UNLICENSED — Private project
