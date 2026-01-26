/**
 * App Builder Agent
 * Autonomous app development using the gauntlet's pipeline
 *
 * Usage:
 *   npx ts-node app-builder.ts "Build a React Native expense tracker"
 */

import { query } from "@anthropic-ai/claude-agent-sdk";

async function buildApp(description: string) {
  console.log(`🚀 Starting autonomous build: ${description}\n`);

  for await (const message of query({
    prompt: `
      Build this application autonomously:
      "${description}"

      Use the following pipeline:
      1. prd-writer → Create product requirements
      2. architect → Design the system architecture
      3. executor → Implement the code
      4. qa-tester → Test the implementation
      5. security-reviewer → Security review
      6. git-guru → Clean commits and prepare for deployment

      Work autonomously. Ask clarifying questions only if critical.
    `,
    options: {
      allowedTools: ["Read", "Write", "Edit", "Glob", "Grep", "Bash", "Task", "WebSearch"],
      permissionMode: "acceptEdits",
      agents: {
        "prd-writer": {
          description: "Creates product requirement documents",
          prompt: "Create detailed PRD with user stories and acceptance criteria",
          tools: ["Read", "Write", "WebSearch"]
        },
        "architect": {
          description: "Designs system architecture",
          prompt: "Design scalable, secure architecture. Create diagrams.",
          tools: ["Read", "Write", "Glob", "Grep"]
        },
        "executor": {
          description: "Implements code",
          prompt: "Write clean, tested, production-ready code",
          tools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"]
        },
        "qa-tester": {
          description: "Tests the implementation",
          prompt: "Write and run tests. Verify functionality.",
          tools: ["Read", "Write", "Bash", "Glob", "Grep"]
        },
        "security-reviewer": {
          description: "Reviews code for security issues",
          prompt: "Audit for OWASP top 10, dependency vulnerabilities",
          tools: ["Read", "Bash", "Glob", "Grep"]
        }
      }
    }
  })) {
    if ("result" in message) {
      console.log(message.result);
    }
    if (message.type === "assistant" && "content" in message) {
      // Stream assistant messages
      for (const block of message.content) {
        if (block.type === "text") {
          process.stdout.write(block.text);
        }
      }
    }
  }
}

// Run if called directly
const description = process.argv[2] || "Build a simple todo app";
buildApp(description).catch(console.error);
