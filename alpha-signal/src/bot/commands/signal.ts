import type { Context } from "grammy";
import { searchMarkets, fetchMarkets } from "../../data/polymarket/client.js";
import { parseOutcomePrices, formatVolume } from "../../data/polymarket/types.js";
import { searchTwitter } from "../../data/twitter/client.js";
import { analyzeSignal } from "../../analysis/agent-sdk.js";

export async function signalCommand(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";
  const topic = text.replace(/^\/signal\s*/i, "").trim();

  if (!topic) {
    await ctx.reply("Usage: /signal <topic>\nExample: /signal Trump tariffs");
    return;
  }

  const thinking = await ctx.reply(`⚡ Analyzing signal for "${topic}"...\n\nFetching market data and social sentiment...`);

  try {
    // Fetch Polymarket and Twitter data in parallel
    const [markets, twitterResult] = await Promise.allSettled([
      searchMarkets(topic, 5).then((results) =>
        results.length > 0 ? results : fetchMarkets({ limit: 5 })
      ),
      searchTwitter(topic, { sort: "likes", limit: 10, quick: true }).catch(() => null),
    ]);

    const marketData = markets.status === "fulfilled" ? markets.value : [];
    const twitterData = twitterResult.status === "fulfilled" ? twitterResult.value : null;

    // Update thinking message
    await ctx.api.editMessageText(
      ctx.chat!.id,
      thinking.message_id,
      `⚡ Analyzing signal for "${topic}"...\n\n✅ Market data: ${marketData.length} markets\n${twitterData ? `✅ X data: ${twitterData.tweets.length} tweets` : "⚠️ X data unavailable"}\n\n🧠 Running AI analysis...`
    );

    // Build market summary for the prompt
    const marketSummary = marketData
      .map((m) => {
        const p = parseOutcomePrices(m);
        return `- "${m.question}" | YES: ${(p.yes * 100).toFixed(0)}% | Vol: ${formatVolume(m.volumeNum ?? m.volume)}`;
      })
      .join("\n");

    // Build tweet summary for the prompt
    const tweetSummary = twitterData
      ? twitterData.tweets
          .slice(0, 5)
          .map((t) => `- @${t.authorUsername} (${t.metrics.likes} likes): "${t.text.slice(0, 100)}"`)
          .join("\n")
      : "No Twitter data available.";

    // Run AI analysis
    const analysis = await analyzeSignal(topic, marketSummary, tweetSummary);

    // Format result
    const result = [
      `<b>⚡ Alpha Signal: "${escapeHtml(topic)}"</b>`,
      "",
      analysis,
      "",
      `<i>📊 ${marketData.length} markets | 🐦 ${twitterData?.tweets.length ?? 0} tweets analyzed</i>`,
    ].join("\n");

    await ctx.api.editMessageText(ctx.chat!.id, thinking.message_id, result, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await ctx.api.editMessageText(
      ctx.chat!.id,
      thinking.message_id,
      `Signal analysis failed: ${message}\n\nEnsure ANTHROPIC_API_KEY is set for AI analysis.`
    );
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
