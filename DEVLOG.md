# Development Log

## 2025-02-05 - CLAUDE.md Operational Playbook

### What Changed
Transformed CLAUDE.md from a pure tool catalog into a complete operating manual for Claude agents.

### Additions

**Session Start Checklist**
- Read `tasks/lessons.md` to avoid repeating mistakes
- Read `tasks/todo.md` to resume work
- Run `git status` to understand current state
- Verify last change still builds before continuing

**Workflow Orchestration (7 rules)**
1. Plan Mode Default - enter plan mode for 3+ step tasks
2. Subagent Strategy - offload research/exploration to keep context clean
3. Self-Improvement Loop - capture mistakes in `tasks/lessons.md`
4. Verification Before Done - prove it works before marking complete
5. Demand Elegance - pause and ask "is there a more elegant way?"
6. Autonomous Bug Fixing - just fix it, don't ask for hand-holding
7. Error Recovery - stop, revert, diagnose, re-plan, execute (no fix-on-fix spirals)

**Task Management Protocol**
6-step cycle: Plan First → Verify Plan → Track Progress → Explain Changes → Document Results → Capture Lessons

**Core Principles (with teeth)**
- Simplicity First: smallest change that solves the problem
- No Laziness: find root causes, no `// TODO: fix later`
- Minimal Impact: only touch what's necessary
- No Guessing: read the code or run it, don't assume

**Definition of Done**
| Task Type | Done When |
|-----------|-----------|
| Bugfix | Root cause identified, fix applied, test added, existing tests pass |
| Feature | Implementation complete, tests written, builds clean, no regressions |
| Refactor | Behavior unchanged (proven by tests), no new warnings, cleaner |
| Research | Findings documented, recommendation with tradeoffs, sources cited |

**Project Structure Conventions**
- Generic structure replacing ML-specific scaffold
- `tasks/` directory mandatory for `todo.md` and `lessons.md`

### Why
The original CLAUDE.md listed what tools exist but didn't tell Claude *how to work*. The images from the user showed workflow patterns that make agents effective: planning, self-improvement, error recovery. These behavioral rules are what separate a good agent config from a great one.

### Git Config Fix
Set `user.email` to `robinsonlchan@gmail.com` and `user.name` to `gouchan` so future commits count toward GitHub contributions.

---
