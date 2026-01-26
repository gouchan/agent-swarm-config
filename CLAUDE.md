# The Gauntlet v2.0

An autonomous agent swarm for building iOS, desktop, and web applications with programmatic video creation.

```
┌────────────────────────────────────────────────────────────────────────────┐
│                            THE GAUNTLET                                    │
│                                                                            │
│    "I am inevitable." - but for shipping software                         │
│                                                                            │
│    46 Agents | 85 Skills | 42 Commands | 5 MCP Servers                    │
└────────────────────────────────────────────────────────────────────────────┘
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ORCHESTRATION LAYER                              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐       │
│  │  /swarm     │ │  /pipeline  │ │ /ultrapilot │ │  /autopilot │       │
│  │ N parallel  │ │  Sequential │ │ 3-5x workers│ │  Autonomous │       │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘       │
├─────────────────────────────────────────────────────────────────────────┤
│                           AGENT LAYER (46)                               │
│  ┌────────────────────────────────────────────────────────────────────┐ │
│  │ ARCHITECTS    │ BUILDERS      │ QUALITY       │ SPECIALISTS       │ │
│  │ architect     │ executor      │ qa-tester     │ prd-writer        │ │
│  │ planner       │ build-fixer   │ code-reviewer │ frontend-designer │ │
│  │ researcher    │ tdd-guide     │ security-*    │ vision            │ │
│  │ analyst       │ designer      │ critic        │ scientist         │ │
│  └────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                          SKILLS LAYER (85)                               │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐   │
│  │ RESEARCH     │ │ DEVELOPMENT  │ │ VIDEO        │ │ DIAGRAMS     │   │
│  │ /perplexity  │ │ /react-dev   │ │ /remotion    │ │ /mermaid     │   │
│  │ /deepsearch  │ │ /tdd         │ │ 31 rules     │ │ /excalidraw  │   │
│  │ /research    │ │ /build-fix   │ │ animations   │ │ /c4          │   │
│  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                         MCP SERVERS (5)                                  │
│  Firecrawl │ Roblox Studio │ Chrome │ Notion │ Stripe                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Orchestration Modes

| Command | What it does | Use when |
|---------|--------------|----------|
| `/swarm` | N agents claim tasks from shared queue | Large parallel workloads |
| `/pipeline` | Sequential chain, data passes between | Multi-stage builds |
| `/ultrapilot` | 3-5x parallel workers | Speed-critical tasks |
| `/autopilot` | Full autonomous execution | "Just build it" |
| `/ultrawork` | Deep work mode | Complex implementations |
| `/ecomode` | 30-50% token savings | Cost-conscious work |

## Core Agents

### Product & Planning
- `prd-writer` - Product requirements documentation
- `project-task-planner` - Break projects into tasks
- `planner` - Strategic planning
- `architect` - System design (has -low, -medium tiers)

### Development
- `executor` - Code implementation (has -low, -high tiers)
- `build-fixer` - Fix build errors
- `tdd-guide` - Test-driven development
- `designer` - UI implementation (has -low, -high tiers)
- `frontend-designer` - UI/UX design

### Quality & Security
- `qa-tester` - Quality assurance (has -high tier)
- `code-reviewer` - Code review (has -low tier)
- `security-auditor` - Security vulnerabilities
- `security-reviewer` - Security review (has -low tier)
- `critic` - Constructive criticism

### Research & Analysis
- `researcher` - Deep research (has -low tier)
- `scientist` - Data analysis (has -low, -high tiers)
- `analyst` - Analysis tasks
- `explore` - Codebase exploration (has -medium, -high tiers)

### Specialized
- `vision` - Visual analysis
- `writer` - Technical writing
- `git-guru` - Git history management
- `test-time-travel` - Git bisect bug hunting
- `dependency-detective` - CVE scanning
- `perf-profiler` - Performance optimization

## Key Skills

### Orchestration
- `/orchestrate` - Multi-agent coordination
- `/swarm` - Parallel agent swarm
- `/pipeline` - Sequential pipeline
- `/autopilot`, `/ultrapilot`, `/ultrawork` - Execution modes
- `/ralph` - Autonomous development framework

### Research
- `/perplexity` - Web research
- `/deepsearch` - Deep codebase search
- `/research` - Parallel research orchestration
- `/codex` - Deep code analysis

### Development
- `/react-dev` - React patterns
- `/tdd` - Test-driven development
- `/build-fix` - Fix build errors
- `/code-review` - Code review workflow
- `/security-review` - Security analysis
- `/git-master` - Git operations

### Video (Remotion)
- `/remotion` - Programmatic video creation
  - 31 rule files: animations, transitions, captions, audio, 3D, charts
  - TikTok-style captions, Lottie, GIFs, fonts
  - React + Tailwind integration

### Diagrams & Docs
- `/mermaid-diagrams` - Architecture diagrams
- `/excalidraw` - Whiteboard sketches
- `/c4-architecture` - C4 model diagrams
- `/draw-io` - Draw.io diagrams

### Utilities
- `/humanizer` - Make AI text natural
- `/compose-email` - Professional emails
- `/viral-tweet` - Social content
- `/doctor` - System diagnostics
- `/hud` - Status display

## MCP Servers

| Server | Capability |
|--------|------------|
| **Firecrawl** | Scrape any URL to markdown, crawl sites, extract structured data |
| **Roblox Studio** | Game development, instance manipulation, scripting |
| **Chrome** | Browser automation, screenshots, form filling |
| **Notion** | Documentation, databases, pages |
| **Stripe** | Payments, subscriptions, invoices |

## Quick Start

### Build an App
```
"Use /swarm to build a React Native expense tracker with authentication"
"Run /autopilot to create a landing page with Stripe integration"
"Use /pipeline: architect → executor → qa-tester → security-reviewer"
```

### Create Video
```
"Use /remotion to create a TikTok-style video with captions"
"Build an animated data visualization video"
"Create a product demo with text animations and transitions"
```

### Research & Plan
```
"Use /perplexity to research iOS App Store requirements"
"Run /deepsearch to understand the auth flow"
"Use prd-writer to create requirements for a habit tracker app"
```

## Agent Tiers

Many agents have tiered versions for cost/quality tradeoffs:
- `-low` - Faster, cheaper, good for simple tasks
- `-medium` - Balanced
- `-high` - Maximum quality, complex tasks

Example: `architect-low` vs `architect` vs `architect-medium`

## File Locations

```
~/.claude/
├── agents/     # 46 agent definitions
├── skills/     # 85 skill directories
├── commands/   # 42 slash commands
└── hooks/      # Event triggers
```

## Environment

- Node.js: `/usr/local/bin/node`
- Python 3: `/opt/homebrew/bin/python3`
- Firecrawl API: Configured in `.mcp.json`

---

## Deployment (Claude Agent SDK)

The gauntlet can be deployed as autonomous agents using the Claude Agent SDK.

### Installation
```bash
# TypeScript (installed globally)
npm install -g @anthropic-ai/claude-agent-sdk

# Set API key
export ANTHROPIC_API_KEY=your-key-here
```

### Ready-to-Deploy Agents

| Agent | Command | Description |
|-------|---------|-------------|
| **Security Scanner** | `npx ts-node deploy/examples/security-scanner.ts` | CVE scanning + code audit |
| **App Builder** | `npx ts-node deploy/examples/app-builder.ts "description"` | Full autonomous app dev |
| **Video Creator** | `npx ts-node deploy/examples/video-creator.ts "description"` | Remotion video generation |
| **Scheduled Audit** | `npx ts-node deploy/examples/scheduled-audit.ts` | Daily codebase audits |

### Quick Deploy Example

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

### Permission Modes

| Mode | Use Case |
|------|----------|
| `bypassPermissions` | Read-only audits, analysis |
| `acceptEdits` | Autonomous coding with file writes |
| `default` | Interactive approval for each action |

### Use Cases

- **CI/CD Integration** - Run security scans on every PR
- **Scheduled Tasks** - Daily audits, dependency updates
- **API-Driven** - Trigger agents from webhooks
- **Production Services** - Autonomous coding bots

See `deploy/README.md` for full documentation.
