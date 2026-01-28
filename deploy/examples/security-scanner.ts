/**
 * Security Scanner Agent
 * Runs security-auditor and dependency-detective on a codebase
 *
 * Usage:
 *   npx ts-node security-scanner.ts /path/to/project
 */

import { query } from "@anthropic-ai/claude-agent-sdk";

async function runSecurityScan(projectPath: string) {
  console.log(`🔒 Starting security scan on ${projectPath}\n`);

  for await (const message of query({
    prompt: `
      Run a comprehensive security audit on this codebase:
      1. Use dependency-detective to scan for CVEs in dependencies
      2. Use security-auditor to review code for vulnerabilities
      3. Generate a security report with findings and recommendations
    `,
    options: {
      workingDirectory: projectPath,
      allowedTools: ["Read", "Glob", "Grep", "Bash", "Task"],
      permissionMode: "bypassPermissions",
    }
  })) {
    if ("result" in message) {
      console.log(message.result);
    }
  }
}

// Run if called directly
const projectPath = process.argv[2] || process.cwd();
runSecurityScan(projectPath).catch(console.error);
