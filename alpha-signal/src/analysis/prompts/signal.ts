export function buildSignalPrompt(topic: string, marketData: string, twitterData: string): string {
  return `Analyze the alpha signal for "${topic}".

## Polymarket Data
${marketData}

## X/Twitter Sentiment
${twitterData}

Provide:
1. Narrative summary (2-3 sentences)
2. Market vs Sentiment divergence assessment
3. Conviction rating (1-5)
4. Directional edge (bullish/bearish/neutral)
5. Key risks (2-3 bullet points)

Be concise and actionable. Max 250 words.`;
}

export function buildBriefingPrompt(topMovers: string, socialData: string): string {
  return `Generate a daily prediction market briefing.

## Top Movers
${topMovers}

## Social Sentiment
${socialData}

Format as a punchy morning briefing. Lead with the biggest story. Cover 3-5 markets. End with what to watch today. Max 400 words.`;
}
