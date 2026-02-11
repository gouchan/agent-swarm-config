export function buildDailyBriefingPrompt(
  date: string,
  marketMovers: string,
  socialSentiment: string
): string {
  return `You are a prediction market analyst writing the daily morning briefing for ${date}.

## Biggest Market Movers (24h)
${marketMovers}

## Social Pulse (X/Twitter)
${socialSentiment}

Write a concise daily briefing:
1. **Headline** - One sentence summarizing the biggest story
2. **Top Stories** (3-5) - Each with market odds, price movement, and social context
3. **Watch Today** - 2-3 markets to monitor, with reasoning

Tone: Sharp, informed, no fluff. Like a Bloomberg terminal note.
Max 400 words.`;
}
