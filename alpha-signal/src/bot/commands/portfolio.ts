import type { Context } from "grammy";
import { fetchMarketById } from "../../data/polymarket/client.js";
import { parseOutcomePrices, formatVolume } from "../../data/polymarket/types.js";
import { getWatchlist } from "../../state/store.js";
import { escapeHtml } from "../../utils/format.js";

export async function portfolioCommand(ctx: Context): Promise<void> {
  const chatId = String(ctx.chat?.id ?? "");
  if (!chatId) return;

  const watchlist = getWatchlist(chatId);

  if (watchlist.length === 0) {
    await ctx.reply("Your watchlist is empty.\nUse /markets to browse, then /watch <id> to add.");
    return;
  }

  try {
    const lines: string[] = ["<b>📋 Your Watchlist</b>\n"];

    // Fetch all markets in parallel
    const markets = await Promise.all(
      watchlist.map((w) => fetchMarketById(w.marketId).catch(() => null))
    );

    for (let i = 0; i < watchlist.length; i++) {
      const watched = watchlist[i];
      const market = markets[i];

      if (!market) {
        lines.push(`${i + 1}. <s>${escapeHtml(watched.question)}</s> (unavailable)`);
        continue;
      }

      const prices = parseOutcomePrices(market);
      const currentYes = prices.yes * 100;
      const entryYes = watched.entryYesPrice * 100;
      const delta = currentYes - entryYes;
      const deltaStr = delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
      const emoji = delta > 2 ? "🟢" : delta < -2 ? "🔴" : "⚪";

      lines.push(
        [
          `${emoji} <b>${i + 1}. ${escapeHtml(market.question)}</b>`,
          `   YES: ${entryYes.toFixed(0)}% → ${currentYes.toFixed(0)}% (${deltaStr}%)`,
          `   Vol: ${formatVolume(market.volumeNum ?? market.volume)}`,
          `   /unwatch <code>${escapeHtml(market.id)}</code>`,
        ].join("\n")
      );
    }

    await ctx.reply(lines.join("\n\n"), { parse_mode: "HTML" });
  } catch (err) {
    console.error("portfolio command error:", err);
    await ctx.reply("Failed to fetch portfolio. Try again.");
  }
}
