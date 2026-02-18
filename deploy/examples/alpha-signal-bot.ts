/**
 * Alpha Signal Bot - Deployable via Claude Agent SDK
 *
 * A prediction market intelligence bot that cross-references
 * Polymarket data with X/Twitter sentiment.
 *
 * Usage:
 *   TELEGRAM_BOT_TOKEN=xxx ANTHROPIC_API_KEY=xxx npx tsx alpha-signal-bot.ts
 *
 * Or deploy the standalone bot:
 *   cd alpha-signal && npm start
 */

import { query } from "@anthropic-ai/claude-agent-sdk";

async function analyzeSignal(topic: string) {
  console.log(`⚡ Analyzing signal for: ${topic}\n`);

  for await (const message of query({
    prompt: `
      You are an alpha signal analyst. Perform the following analysis for "${topic}":

      1. Fetch Polymarket data:
         - Use WebFetch to get: https://gamma-api.polymarket.com/markets?active=true&closed=false&order=volume&ascending=false&limit=10
         - Filter for markets matching "${topic}"
         - Extract: market question, YES/NO prices, volume

      2. Search X/Twitter for social sentiment:
         - Use WebSearch to find recent tweets and discussion about "${topic}"
         - Note: engagement levels, key voices, bullish vs bearish sentiment

      3. Cross-reference and analyze:
         - Where do markets and social sentiment agree? Disagree?
         - Rate conviction 1-5 (5 = strong alpha signal)
         - Identify directional edge (bullish/bearish/neutral)
         - List 2-3 key risks

      4. Output a structured signal report.

      Be concise and actionable. This is analysis, not financial advice.
    `,
    options: {
      allowedTools: ["WebSearch", "WebFetch", "Read", "Task"],
      permissionMode: "bypassPermissions",
      agents: {
        "alpha-signal-analyst": {
          description: "Cross-references prediction markets with social sentiment",
          prompt: "Analyze divergences between market pricing and social narrative. Rate conviction 1-5.",
          tools: ["WebSearch", "WebFetch"]
        },
        "researcher": {
          description: "Gathers social sentiment data from X/Twitter",
          prompt: "Search for and summarize social media discussion and sentiment",
          tools: ["WebSearch"]
        }
      }
    }
  })) {
    if ("result" in message) {
      console.log("\n--- SIGNAL REPORT ---\n");
      console.log(message.result);
    }
    if (message.type === "assistant" && "content" in message) {
      for (const block of message.content) {
        if (block.type === "text") {
          process.stdout.write(block.text);
        }
      }
    }
  }
}

// Run
const topic = process.argv[2] || "Bitcoin ETF approval";
analyzeSignal(topic).catch(console.error);
