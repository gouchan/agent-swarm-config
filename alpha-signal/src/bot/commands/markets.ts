import type { Context } from "grammy";
import { fetchMarkets, formatMarketTelegram } from "../../data/polymarket/client.js";

export async function marketsCommand(ctx: Context): Promise<void> {
  try {
    const markets = await fetchMarkets({ limit: 10 });

    if (markets.length === 0) {
      await ctx.reply("No active markets found.");
      return;
    }

    const header = "<b>📊 Top Polymarket Markets</b>\n";
    const body = markets.map((m, i) => formatMarketTelegram(m, i + 1)).join("\n\n");
    const footer = "\n\n<i>Use /watch &lt;id&gt; to track a market</i>";

    await ctx.reply(header + body + footer, { parse_mode: "HTML" });
  } catch (err) {
    console.error("markets command error:", err);
    await ctx.reply("Failed to fetch markets. Try again in a moment.");
  }
}
