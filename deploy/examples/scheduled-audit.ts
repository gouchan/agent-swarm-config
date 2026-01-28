/**
 * Scheduled Audit Agent
 * Run daily/weekly automated audits on your codebase
 *
 * Usage:
 *   npx ts-node scheduled-audit.ts
 *
 * For cron scheduling:
 *   0 9 * * * cd /path/to/project && npx ts-node scheduled-audit.ts
 */

import { query } from "@anthropic-ai/claude-agent-sdk";
import { appendFileSync } from "fs";

const AUDIT_LOG = "./audit-reports/audit.log";

async function runDailyAudit() {
  const timestamp = new Date().toISOString();
  console.log(`📋 Starting daily audit at ${timestamp}\n`);

  const results: string[] = [];

  for await (const message of query({
    prompt: `
      Run a comprehensive daily audit:

      1. DEPENDENCY CHECK
         - Run npm audit or pip-audit
         - Flag any new high/critical CVEs

      2. CODE QUALITY
         - Check for TODO/FIXME comments
         - Look for console.log/print statements in production code
         - Identify any hardcoded secrets or API keys

      3. GIT HEALTH
         - Check for uncommitted changes
         - Review recent commits for issues
         - Check branch status

      4. PERFORMANCE
         - Identify any obvious performance issues
         - Check bundle sizes if applicable

      Output a structured report with:
      - Summary (1-2 sentences)
      - Critical issues (if any)
      - Warnings
      - Recommendations
    `,
    options: {
      allowedTools: ["Read", "Glob", "Grep", "Bash"],
      permissionMode: "bypassPermissions", // Read-only audit
    }
  })) {
    if ("result" in message) {
      results.push(message.result);
      console.log(message.result);
    }
  }

  // Log results
  const logEntry = `\n=== AUDIT ${timestamp} ===\n${results.join("\n")}\n`;
  try {
    appendFileSync(AUDIT_LOG, logEntry);
    console.log(`\n✅ Audit logged to ${AUDIT_LOG}`);
  } catch {
    console.log("\n⚠️ Could not write to audit log");
  }
}

runDailyAudit().catch(console.error);
