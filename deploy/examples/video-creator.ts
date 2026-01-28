/**
 * Video Creator Agent
 * Creates programmatic videos using Remotion
 *
 * Usage:
 *   npx ts-node video-creator.ts "Create a 30-second product demo"
 */

import { query } from "@anthropic-ai/claude-agent-sdk";

async function createVideo(description: string) {
  console.log(`🎬 Starting video creation: ${description}\n`);

  for await (const message of query({
    prompt: `
      Create a programmatic video using Remotion:
      "${description}"

      Use the /remotion skill for:
      - Animations and transitions
      - Text animations and captions
      - Audio/video embedding
      - TikTok-style effects if appropriate

      Steps:
      1. Set up Remotion project if needed
      2. Create the video composition
      3. Add animations, text, and effects
      4. Render a preview
    `,
    options: {
      allowedTools: ["Read", "Write", "Edit", "Bash", "Glob", "Grep"],
      permissionMode: "acceptEdits",
      settingSources: ["project"], // Load skills from .claude/skills/
    }
  })) {
    if ("result" in message) {
      console.log(message.result);
    }
  }
}

// Run if called directly
const description = process.argv[2] || "Create a simple animated title card";
createVideo(description).catch(console.error);
