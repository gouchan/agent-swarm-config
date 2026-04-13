---
name: your-skill-name
description: |
  [REQUIRED: What this skill does in one sentence.]
  Use when user says "[trigger phrase 1]", "[trigger phrase 2]", or asks to "[action]".
  [Optional: Do NOT use for [unrelated task] — use [other-skill] instead.]
license: MIT
metadata:
  author: Robinson
  version: 1.0.0
  category: asset-creation  # asset-creation | workflow-automation | mcp-enhancement
  # mcp-server: server-name  # uncomment if MCP-dependent
  # tags: [tag1, tag2]
---

# Skill Name

One-line description: what this does and the primary value it delivers.

---

## Overview

What this skill automates or produces, and why that matters. Keep it to 2–3 sentences. Who would use this and when?

---

## CRITICAL Rules

> List any non-negotiable constraints upfront. Delete this section if none apply.

- Always do X before Y
- Never skip the validation step
- Confirm with user before [destructive action]

---

## Step 1: [First Major Action]

Clear, specific instructions. Not "validate things" — instead: "Run `python scripts/validate.py --input {filename}`"

**Expected output:** Describe what success looks like here.

**If this fails:** Common failure and how to recover.

---

## Step 2: [Next Action]

Continue with the next step. Use numbered sub-steps if needed:

1. Sub-step one
2. Sub-step two
3. Sub-step three

> **Note:** Reference deeper docs when needed: See `references/api-guide.md` for rate limits and error codes.

---

## Step 3: [Final Action / Output]

What the finished result looks like. How to deliver or confirm it.

---

## Gotchas

> This section is the highest-signal part of any skill. Leave it empty to start — populate it from real failures as they happen. Each entry = something Claude actually got wrong.

<!--
### Gotcha: [What went wrong]
**When it happens:** [Specific trigger / context]
**What Claude did:** [The wrong behavior]
**Fix:** [What to do instead]
-->

---

## Error Handling

### Error: [Common Error Message]
**Cause:** Why this happens.
**Solution:** Exact fix — tool call, command, or user action.

### Error: MCP Connection Failed
**Cause:** Server disconnected or token expired.
**Solution:**
1. Check Settings > Extensions > [Service Name] — should show "Connected"
2. Verify API key is valid and not expired
3. Try reconnecting: Settings > Extensions > [Service] > Reconnect
4. Test MCP independently: ask Claude to call the tool directly without the skill

---

## Examples

### Example 1: [Most Common Scenario]
**User says:** "..."
**Actions:**
1. [What Claude does first]
2. [What Claude does next]
3. [Final action]
**Result:** [What the user gets]

### Example 2: [Edge Case or Variation]
**User says:** "..."
**Actions:**
1. ...
**Result:** ...

---

## References

> Link to files in `references/` for deep documentation. Keep SKILL.md under ~5,000 words.

- `references/api-guide.md` — Rate limits, pagination patterns, error codes
- `references/examples/` — Sample inputs and outputs

---

## Performance Notes

- Take your time to do this thoroughly
- Quality is more important than speed
- Do not skip validation steps
