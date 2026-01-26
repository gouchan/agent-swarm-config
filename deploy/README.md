# Deployment Templates

Ready-to-use agents powered by the Claude Agent SDK.

## Prerequisites

```bash
# TypeScript SDK (already installed)
npm install -g @anthropic-ai/claude-agent-sdk

# Set your API key
export ANTHROPIC_API_KEY=your-key-here
```

## Available Agents

### 🔒 Security Scanner
Runs security-auditor and dependency-detective on any codebase.

```bash
npx ts-node examples/security-scanner.ts /path/to/project
```

### 🚀 App Builder
Autonomous app development using the full gauntlet pipeline.

```bash
npx ts-node examples/app-builder.ts "Build a React Native expense tracker with auth"
```

### 🎬 Video Creator
Creates programmatic videos using Remotion.

```bash
npx ts-node examples/video-creator.ts "Create a 30-second product demo"
```

### 📋 Scheduled Audit
Daily/weekly automated codebase audits.

```bash
# Run manually
npx ts-node examples/scheduled-audit.ts

# Or schedule with cron (daily at 9am)
0 9 * * * cd /path/to/project && npx ts-node examples/scheduled-audit.ts
```

## Creating Custom Agents

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

async function myAgent() {
  for await (const message of query({
    prompt: "Your task here",
    options: {
      allowedTools: ["Read", "Write", "Edit", "Bash", "Task"],
      permissionMode: "acceptEdits", // or "bypassPermissions" for read-only
      agents: {
        // Define subagents here
      }
    }
  })) {
    if ("result" in message) {
      console.log(message.result);
    }
  }
}
```

## Permission Modes

| Mode | Use Case |
|------|----------|
| `bypassPermissions` | Read-only audits, analysis |
| `acceptEdits` | Autonomous coding with file writes |
| `default` | Interactive approval for each action |

## Connecting MCP Servers

```typescript
options: {
  mcpServers: {
    firecrawl: {
      command: "npx",
      args: ["-y", "firecrawl-mcp"],
      env: { FIRECRAWL_API_KEY: process.env.FIRECRAWL_API_KEY }
    }
  }
}
```

## Session Persistence

Resume agents across multiple runs:

```typescript
let sessionId: string;

// First run - capture session
for await (const msg of query({ prompt: "Start task" })) {
  if (msg.subtype === "init") sessionId = msg.session_id;
}

// Resume later
for await (const msg of query({
  prompt: "Continue where we left off",
  options: { resume: sessionId }
})) {
  // Full context preserved
}
```
