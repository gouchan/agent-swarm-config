# Skill Building Guide for Claude
> Extracted from "The Complete Guide to Building Skills for Claude" (Anthropic, Jan 2026)
> Last updated: 2026-03-12

This is the canonical reference for how Robinson builds skills in this workspace. Treat it as the source of truth when creating, reviewing, or debugging any skill.

---

## What Is a Skill?

A skill is a folder containing a `SKILL.md` file (plus optional scripts, references, and assets) that teaches Claude how to handle a specific task or workflow consistently — without re-explaining it every conversation.

**Skills are the right tool when you have:**
- Repeatable workflows (sprint planning, asset creation, code review)
- Multi-step processes with MCP tools
- Domain-specific knowledge or brand standards to embed
- Output formats that need to stay consistent (reports, decks, code templates)

**The kitchen analogy:**
- MCP = the professional kitchen (tools, data access, services)
- Skill = the recipe (how to use those tools to produce something valuable)

---

## The Three-Level Progressive Disclosure System

Skills load information in layers to minimize token usage:

1. **YAML frontmatter** — Always in Claude's system prompt. Tells Claude *when* to load the skill.
2. **SKILL.md body** — Loaded when Claude decides the skill is relevant. Contains full instructions.
3. **Linked files** (`references/`, `scripts/`) — Loaded on demand, only when needed.

**Implication:** Write the frontmatter description like a trigger system, not a product blurb. It's Claude's lookup index.

---

## Skill Types (Pick Your Category)

### Category 1: Document & Asset Creation
**For:** Generating consistent, high-quality output — docs, decks, code, designs.
**Key techniques:**
- Embedded style guides and brand standards
- Template structures for consistent output
- Quality checklists before finalizing
- No external tools needed — uses Claude's built-in capabilities

**Example trigger:** "Create a one-pager for our Solana bot"

### Category 2: Workflow Automation
**For:** Multi-step processes that need consistent methodology, often across multiple MCP servers.
**Key techniques:**
- Step-by-step workflow with validation gates
- Templates for recurring structures
- Built-in review and improvement loops
- Iterative refinement patterns

**Example trigger:** "Help me plan this sprint", "Run the onboarding workflow for new customer"

### Category 3: MCP Enhancement
**For:** Wrapping raw MCP tool access in domain-specific workflows and best practices.
**Key techniques:**
- Coordinates multiple MCP calls in sequence
- Embeds domain expertise (what to do, in what order, why)
- Provides context users would otherwise need to specify each time
- Error handling for common MCP failures

**Example trigger:** "Analyze the Sentry errors in this PR", "Create Linear tasks for this feature"

---

## File Structure Reference

```
your-skill-name/
├── SKILL.md              ← Required. Exact spelling. Case-sensitive.
├── scripts/              ← Python, Bash, or other executables
│   ├── validate.py
│   └── fetch_data.sh
├── references/           ← Deep documentation, API guides, examples
│   ├── api-guide.md
│   └── examples/
└── assets/               ← Templates, fonts, icons
    └── report-template.md
```

**Rules:**
- Folder name: `kebab-case` only — no spaces, no capitals, no underscores
- File name: `SKILL.md` exactly — not `skill.md`, `SKILL.MD`, or `Skill.md`
- No `README.md` inside skill folder (use `references/` instead)
- No XML angle brackets (`< >`) anywhere in frontmatter

---

## YAML Frontmatter Reference

### Minimal (required)
```yaml
---
name: your-skill-name
description: What it does. Use when user says "[phrase]" or asks to "[action]".
---
```

### Full (with optional fields)
```yaml
---
name: your-skill-name
description: |
  Full description up to 1024 characters. Include:
  - What the skill does
  - Specific trigger phrases
  - File types if relevant
  - What NOT to use it for (negative triggers if needed)
license: MIT
allowed-tools: "Bash(python:*) Bash(npm:*) WebFetch"
metadata:
  author: Robinson
  version: 1.0.0
  mcp-server: server-name
  category: workflow-automation
  tags: [automation, solana, trading]
---
```

### Description Field — The Most Important Part

The description is what Claude reads to decide whether to load your skill. Get this right.

**Formula:** `[What it does] + [When to use it] + [Key capabilities]`

| ✅ Good | ❌ Bad |
|---|---|
| "Manages Solana trade bot config and executes trades. Use when user says 'deploy trade', 'update config', or asks about solana-trade-bot." | "Helps with trading." |
| "Creates Linear sprint tasks from a project brief. Use when user says 'plan sprint', 'create tickets', or 'set up Linear tasks'." | "Creates tasks in Linear." |
| "Generates UGC-style video reels end-to-end. Use when user says 'create reel', 'make a UGC video', or 'run reelclaw pipeline'." | "Video generation skill." |

**Debugging triggers:** Ask Claude: "When would you use the [skill name] skill?" — it will quote the description back. Adjust based on what's missing.

---

## Instruction Writing Guide

### Recommended SKILL.md Structure

```markdown
---
name: skill-name
description: [good description with triggers]
---

# Skill Name

Brief one-line overview.

## Overview
What this skill does and when to use it.

## CRITICAL Rules (if any)
Non-negotiable constraints listed upfront.

## Step 1: [First Action]
Specific, actionable instruction.
Run: `python scripts/validate.py --input {filename}`

Expected output: [describe what success looks like]

## Step 2: [Next Action]
...

## Error Handling

### Error: [Common error message]
Cause: [Why it happens]
Solution: [Exact fix]

## Examples

### Example 1: [Common scenario]
User says: "Set up a new project"
Actions:
1. Fetch existing projects via MCP
2. Create project with parameters
Result: Project created with confirmation link

## References
See `references/api-guide.md` for rate limits and error codes.
```

### Writing Rules

- **Be specific:** "Run `python scripts/validate.py`" > "Validate the data"
- **Use bullet points and numbered lists** for steps, not paragraphs
- **Put critical rules at the top** — use `## CRITICAL` or `## IMPORTANT` headers
- **Keep SKILL.md under ~5,000 words** — move deep docs to `references/`
- **Include error handling** for every MCP tool call
- **Add negative triggers** if skill is overtriggering: "Do NOT use for simple data exploration (use data-viz skill instead)"
- **For critical validations:** use a script (`scripts/`) rather than language instructions — code is deterministic, language is not
- **Gotchas > Instructions:** The highest-signal section of any skill is `## Gotchas` — populated iteratively from real failures. Start it empty and add to it every time Claude gets something wrong. These are worth more than any upfront instruction you write.

---

## On-Demand Hooks

Skills can register session-scoped slash commands that activate guardrails or behavior changes only when called. These don't run automatically — the user or skill invokes them explicitly.

### How They Work

Add a `hooks:` block to your YAML frontmatter:

```yaml
---
name: solana-trade-bot
description: Manages Solana trade bot config and executes trades. Use when user says "deploy trade", "update config", or asks about the bot.
hooks:
  - name: careful
    description: Blocks destructive commands (deploys, deletes, config overwrites) until session ends or /uncareful is called
  - name: freeze
    description: Restricts all file edits to the solana-trade-bot/ directory only
---
```

When a user (or the skill itself) calls `/careful`, Claude enters a restricted mode for that session — refusing destructive commands, asking for confirmation, etc. `/freeze` locks edits to a single directory.

### When to Use

| Hook | Use case |
|---|---|
| `/careful` | Before touching anything near prod, live funds, or live APIs |
| `/freeze` | Debugging a specific project — prevent Claude from accidentally editing other directories |

### For This Workspace

These are most relevant on: `solana-trade-bot`, `bet-scan-scheduler`, `crypto-ai-hedge-fund`. Any skill that touches real money or live systems should have a `/careful` hook defined.

**Pattern:** Start sessions on those projects by calling `/careful` before any build or deploy steps.

---

## Workflow Patterns

### Pattern 1: Sequential Orchestration
Use when: Users need multi-step processes in a specific order.

```markdown
## Step 1: Create Account
Call MCP tool: `create_customer`
Parameters: name, email, company

## Step 2: Setup Payment
Call MCP tool: `setup_payment_method`
Wait for: payment method verification

## Step 3: Create Subscription
Call MCP tool: `create_subscription`
Parameters: plan_id, customer_id (from Step 1)
```

Key: explicit ordering, inter-step dependencies, validation gates, rollback on failure.

### Pattern 2: Multi-MCP Coordination
Use when: Workflow spans multiple services.

```markdown
## Phase 1: Design Export (Figma MCP)
1. Export design assets
2. Generate specs

## Phase 2: Asset Storage (Drive MCP)
1. Create project folder
2. Upload all assets

## Phase 3: Task Creation (Linear MCP)
1. Create dev tasks
2. Attach asset links
```

Key: clear phase separation, data passing between MCPs, validate before next phase.

### Pattern 3: Iterative Refinement
Use when: Output quality improves with iteration.

```markdown
## Initial Draft
1. Fetch data via MCP
2. Generate first draft
3. Save to temp file

## Quality Check
1. Run: `scripts/check_output.py`
2. Identify: missing sections, format errors, data issues

## Refinement Loop
1. Address each issue
2. Regenerate affected sections
3. Re-validate
4. Repeat until quality threshold met
```

Key: explicit quality criteria, know when to stop.

### Pattern 4: Context-Aware Tool Selection
Use when: Same goal, different tools depending on context.

```markdown
## Decision Tree
1. Check file type and size
2. Determine storage:
   - Large files (>10MB): cloud storage MCP
   - Collaborative docs: Notion MCP
   - Code: GitHub MCP
   - Temp: local storage
3. Execute with chosen tool
4. Explain choice to user
```

### Pattern 5: Domain-Specific Intelligence
Use when: Skill adds specialized knowledge beyond tool access.

```markdown
## Before Processing (Compliance Check)
1. Fetch transaction details via MCP
2. Apply rules:
   - Check sanctions lists
   - Verify jurisdiction
   - Assess risk level
3. Document compliance decision

## Processing
IF compliance passed: proceed with MCP tool
ELSE: flag for review, create case

## Audit Trail
Log all checks and decisions
```

---

## Testing Framework

### Test Coverage Areas

**1. Trigger Tests**
- ✅ Triggers on obvious task descriptions
- ✅ Triggers on paraphrased requests
- ❌ Does NOT trigger on unrelated topics
- Run 10–20 test queries; aim for ~90% accuracy on relevant ones

**2. Functional Tests**
- Valid outputs are generated
- MCP calls succeed
- Error handling works for known edge cases
- Edge cases covered

**3. Performance Comparison**
Compare with/without skill:
- Token usage (skill should reduce total tokens)
- Number of back-and-forths with user
- Failed API calls (target: 0)

### Iteration Signals

| Signal | Meaning | Fix |
|---|---|---|
| Skill never loads | Description too vague | Add specific trigger phrases |
| Users manually enabling skill | Same | Same |
| Skill loads for wrong queries | Description too broad | Add negative triggers, narrow scope |
| Instructions not followed | Too verbose or buried | Put key steps at top, use CRITICAL headers |
| Inconsistent outputs | Logic ambiguous | Add validation scripts |
| MCP calls failing | Server disconnected or wrong tool names | Check Settings > Extensions, verify tool names |

---

## Troubleshooting Reference

### Upload Errors

**"Could not find SKILL.md in uploaded folder"**
- Rename file to exactly `SKILL.md` (case-sensitive)
- Verify: `ls -la` should show `SKILL.md`

**"Invalid frontmatter"**
```yaml
# Wrong — missing delimiters
name: my-skill
description: Does things

# Wrong — unclosed quotes
name: my-skill
description: "Does things

# Correct
---
name: my-skill
description: Does things
---
```

**"Invalid skill name"**
- Must be kebab-case: `my-skill` ✅ not `My Skill` ❌ or `my_skill` ❌

### Runtime Issues

**Skill doesn't trigger:**
Add more specific trigger phrases. Include keywords for technical terms users actually type.

**Skill triggers too often:**
```yaml
description: Processes PDF legal documents for contract review.
  Do NOT use for general document reading or non-legal files.
```

**Instructions not followed:**
- Put critical rules at top
- Use `## CRITICAL` headers
- Add explicit encouragement: "Take your time. Quality over speed. Do not skip validation."
- Note: these work better in user prompts than in SKILL.md itself

**Large context / slow responses:**
- Keep SKILL.md under 5,000 words
- Move docs to `references/`, link from SKILL.md
- Don't enable more than 20–50 skills simultaneously

---

## Distribution & Deployment

### Individual Use
1. Create skill folder with `SKILL.md`
2. Zip the folder
3. Upload: Claude.ai > Settings > Capabilities > Skills
4. Or place in Claude Code skills directory

### Organization-Wide
- Admins can deploy skills workspace-wide (requires org admin access)
- Skills update automatically for all members

### Via API
- Use `/v1/skills` endpoint
- Add to Messages API via `container.skills` parameter
- Works with Claude Agent SDK for custom agents
- Requires Code Execution Tool beta

### GitHub Hosting (recommended for sharing)
1. Host skill in a public repo
2. Add clear README at repo level (NOT inside skill folder)
3. Include screenshots and example usage
4. Link from MCP documentation if MCP-dependent

---

## Quick Checklist

### Before Starting
- [ ] Identified 2–3 concrete use cases
- [ ] Identified which tools are needed (built-in or MCP)
- [ ] Planned folder structure

### During Development
- [ ] Folder: kebab-case name
- [ ] `SKILL.md`: exact filename, case-sensitive
- [ ] YAML: `---` delimiters present
- [ ] `name`: kebab-case, no spaces/capitals
- [ ] `description`: includes WHAT and WHEN (trigger phrases)
- [ ] No XML tags (`< >`) anywhere in frontmatter
- [ ] Instructions are clear and actionable (not vague)
- [ ] Error handling included for MCP tools
- [ ] Examples provided with real user phrases

### Before Upload
- [ ] Trigger tests pass on obvious queries
- [ ] Trigger tests pass on paraphrased queries
- [ ] Doesn't trigger on unrelated topics
- [ ] Functional tests pass
- [ ] MCP integration works (if applicable)
- [ ] Folder zipped (if uploading via UI)

### After Upload
- [ ] Test in real conversations
- [ ] Monitor for under/over-triggering
- [ ] Iterate on description and instructions
- [ ] Update `version` in metadata after changes

---

## Resources

- Anthropic Best Practices Guide: https://docs.claude.ai
- Skills Documentation: https://docs.claude.ai
- Public Skills Repo: https://github.com/anthropics/skills
- Community Support: Claude Developers Discord
- Bug Reports: https://github.com/anthropics/skills/issues
