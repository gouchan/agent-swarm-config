import { config } from "../config.js";

/**
 * Analyze signal by cross-referencing Polymarket data with X/Twitter sentiment.
 *
 * If ANTHROPIC_API_KEY is set and Claude Agent SDK is available, uses that.
 * Otherwise falls back to a structured local analysis.
 */
export async function analyzeSignal(
  topic: string,
  marketSummary: string,
  tweetSummary: string
): Promise<string> {
  // Try Claude Agent SDK first
  if (config.anthropicApiKey) {
    try {
      return await analyzeWithAgentSdk(topic, marketSummary, tweetSummary);
    } catch (err) {
      console.warn("Agent SDK failed, falling back to local analysis:", err);
    }
  }

  // Fallback: structured local analysis (no AI)
  return localAnalysis(topic, marketSummary, tweetSummary);
}

async function analyzeWithAgentSdk(
  topic: string,
  marketSummary: string,
  tweetSummary: string
): Promise<string> {
  // Dynamic import - only loads if installed
  const { Anthropic } = await import("@anthropic-ai/sdk" as string).catch(() => {
    throw new Error("@anthropic-ai/sdk not installed");
  });

  const client = new Anthropic({ apiKey: config.anthropicApiKey });

  const prompt = `You are an alpha signal analyst. Analyze the divergence between prediction market pricing and social sentiment for the topic: "${topic}".

## Polymarket Data
${marketSummary || "No matching markets found."}

## X/Twitter Sentiment
${tweetSummary || "No Twitter data available."}

## Your Task
Provide a concise analysis (max 300 words) covering:
1. **Narrative**: What's the dominant story around this topic?
2. **Market vs Sentiment**: Do markets and social sentiment agree or diverge?
3. **Conviction**: Rate 1-5 (1=no signal, 5=strong alpha)
4. **Direction**: Which way does the edge point? (bullish/bearish/neutral)
5. **Risks**: What could invalidate this signal?

Format your response with clear headers using these exact labels. Be direct and actionable.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((block: any) => block.type === "text")
    .map((block: any) => block.text)
    .join("\n");

  return text;
}

function localAnalysis(topic: string, marketSummary: string, tweetSummary: string): string {
  const hasMarkets = marketSummary && !marketSummary.includes("No matching");
  const hasTweets = tweetSummary && !tweetSummary.includes("No Twitter");

  const lines: string[] = [];

  lines.push(`<b>Narrative:</b> ${topic}`);

  if (hasMarkets) {
    lines.push(`\n<b>Markets:</b>\n${escapeHtml(marketSummary)}`);
  } else {
    lines.push("\n<b>Markets:</b> No direct market match found.");
  }

  if (hasTweets) {
    lines.push(`\n<b>Social Sentiment:</b>\n${escapeHtml(tweetSummary)}`);
  } else {
    lines.push("\n<b>Social Sentiment:</b> No Twitter data available.");
  }

  lines.push("\n<b>Conviction:</b> ⚠️ Local analysis only (set ANTHROPIC_API_KEY for AI analysis)");
  lines.push("<b>Direction:</b> Insufficient data for directional call");

  return lines.join("\n");
}

export async function generateBriefing(
  topMovers: string,
  tweetSummary: string
): Promise<string> {
  if (!config.anthropicApiKey) {
    return `<b>Daily Briefing</b>\n\n<b>Top Movers:</b>\n${topMovers}\n\n<b>Social Chatter:</b>\n${tweetSummary}`;
  }

  try {
    const { Anthropic } = await import("@anthropic-ai/sdk" as string);
    const client = new Anthropic({ apiKey: config.anthropicApiKey });

    const response = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `Generate a concise daily prediction market briefing (max 400 words).

## Top Market Movers (24h)
${topMovers}

## X/Twitter Chatter
${tweetSummary}

Format: Start with a 1-sentence headline, then cover top 3-5 stories with market odds and social context. End with "Watch today:" listing 2-3 markets to monitor.`,
        },
      ],
    });

    return response.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text)
      .join("\n");
  } catch (err) {
    return `<b>Daily Briefing</b>\n\n${topMovers}\n\n${tweetSummary}`;
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
