import type { Context } from "grammy";
import { fetchMarketById } from "../../data/polymarket/client.js";
import { parseOutcomePrices } from "../../data/polymarket/types.js";
import { addToWatchlist, removeFromWatchlist } from "../../state/store.js";
import { escapeHtml } from "../../utils/format.js";

const MARKET_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

export async function watchCommand(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";
  const args = text.split(/\s+/).slice(1);

  if (args.length === 0) {
    await ctx.reply(
      "Usage:\n/watch <market_id> - Watch a market\n/unwatch <market_id> - Stop watching",
      { parse_mode: "HTML" }
    );
    return;
  }

  const marketId = args[0];
  const chatId = String(ctx.chat?.id ?? "");
  if (!chatId) return;

  if (!MARKET_ID_PATTERN.test(marketId)) {
    await ctx.reply("Invalid market ID format.");
    return;
  }

  try {
    const market = await fetchMarketById(marketId);
    if (!market) {
      await ctx.reply(`Market <code>${escapeHtml(marketId)}</code> not found.`, { parse_mode: "HTML" });
      return;
    }

    const prices = parseOutcomePrices(market);
    addToWatchlist(chatId, {
      marketId: market.id,
      question: market.question,
      entryYesPrice: prices.yes,
      entryNoPrice: prices.no,
      watchedAt: Date.now(),
    });

    const yesPercent = (prices.yes * 100).toFixed(0);
    await ctx.reply(
      `👁 Now watching:\n<b>${escapeHtml(market.question)}</b>\nEntry: YES ${yesPercent}%\n\nUse /portfolio to see all watched markets.`,
      { parse_mode: "HTML" }
    );
  } catch (err) {
    console.error("watch command error:", err);
    await ctx.reply("Failed to watch market. Try again.");
  }
}

export async function unwatchCommand(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";
  const marketId = text.split(/\s+/)[1];
  const chatId = String(ctx.chat?.id ?? "");
  if (!chatId) return;

  if (!marketId) {
    await ctx.reply("Usage: /unwatch <market_id>");
    return;
  }

  if (!MARKET_ID_PATTERN.test(marketId)) {
    await ctx.reply("Invalid market ID format.");
    return;
  }

  const removed = removeFromWatchlist(chatId, marketId);
  if (removed) {
    await ctx.reply(`Removed market <code>${escapeHtml(marketId)}</code> from watchlist.`, { parse_mode: "HTML" });
  } else {
    await ctx.reply("Market not found in your watchlist.");
  }
}
