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

---

## 🚀 Install on a New Machine

```bash
# 1. Clone this repo
git clone https://github.com/gouchan/agent-swarm-config.git
cd agent-swarm-config

# 2. Install the gauntlet to ~/.claude/
mkdir -p ~/.claude/agents ~/.claude/skills ~/.claude/commands
cp -r agents/* ~/.claude/agents/
cp -r skills/* ~/.claude/skills/
cp -r commands/* ~/.claude/commands/

# 3. Set up MCP config (add your Firecrawl API key)
cp .mcp.json.example .mcp.json
# Edit .mcp.json and add your FIRECRAWL_API_KEY

# 4. Install Agent SDK for deployment (optional)
npm install -g @anthropic-ai/claude-agent-sdk

# 5. Start Claude Code in this directory
claude
```

**That's it.** Claude now has the full gauntlet: 46 agents, 85 skills, 42 commands.

---

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

## Session Start Checklist

Every new session, before doing anything:

1. Read `tasks/lessons.md` if it exists - don't repeat past mistakes
2. Read `tasks/todo.md` if it exists - pick up where you left off
3. Run `git status` to understand current branch and working state
4. If resuming work: verify the last change still builds/passes before continuing

---

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately (see Error Recovery below)
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

### 7. Error Recovery
When a fix attempt fails or makes things worse:
1. **Stop.** Do not stack another fix on top of a failed fix
2. **Revert** to the last known working state (`git stash` or `git checkout`)
3. **Diagnose** the root cause - read the actual error, don't guess
4. **Re-plan** with the new information - update `tasks/todo.md`
5. **Execute** the new plan from clean state

The anti-pattern to avoid: fix → breaks something → fix that → breaks something else → spiral. Two consecutive failed attempts = full stop and re-plan.

---

## Task Management Protocol

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

---

## Core Principles

- **Simplicity First**: The smallest change that solves the problem is the best change. If you're touching more than 3 files for a bugfix, question whether you're solving the right problem.
- **No Laziness**: Find the root cause. `// TODO: fix later` is not acceptable. If you wouldn't put it in a PR review, don't write it.
- **Minimal Impact**: Only touch what's necessary. Unrelated refactors, style changes, and "while I'm here" improvements go in separate commits or not at all.
- **No Guessing**: If you're unsure about behavior, read the code or run it. Don't assume. Wrong assumptions compound.

## Definition of Done

| Task Type | Done When |
|-----------|-----------|
| **Bugfix** | Root cause identified, fix applied, test added that would have caught it, existing tests pass |
| **Feature** | Implementation complete, tests written, builds clean, no regressions |
| **Refactor** | Behavior unchanged (proven by tests), no new warnings, cleaner than before |
| **Research** | Findings documented, recommendation given with tradeoffs, sources cited |

If you can't check all boxes, it's not done - it's in progress.

---

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

## Project Structure Conventions

Every project should include a `tasks/` directory at the root:

```
project-root/
├── tasks/
│   ├── todo.md          # Current plan with checkable items
│   └── lessons.md       # Mistakes made, rules to prevent repeats
├── src/                 # Source code, organized by domain
├── config/              # Configuration separate from code
├── tests/               # Test suite mirroring src/ structure
└── ...
```

Structure principles:
- **Config separate from code**: No hardcoded values - use config files or env vars
- **Domain-based src/ layout**: Organize by feature/domain, not by file type
- **Mirror tests to src**: `src/auth/login.ts` → `tests/auth/login.test.ts`
- **tasks/ is mandatory**: Always maintain `todo.md` and `lessons.md`

---

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
