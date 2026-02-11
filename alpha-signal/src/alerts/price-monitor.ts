import { fetchMarketById } from "../data/polymarket/client.js";
import { parseOutcomePrices, formatVolume } from "../data/polymarket/types.js";
import {
  getAllWatchedMarketIds,
  getChatIdsWatchingMarket,
  addPriceSnapshot,
  getPriceNHoursAgo,
  wasAlertSentRecently,
  addAlertRecord,
} from "../state/store.js";
import { broadcastAlert } from "./dispatcher.js";
import { config } from "../config.js";

export async function checkPriceMovements(): Promise<void> {
  const marketIds = getAllWatchedMarketIds();
  if (marketIds.length === 0) return;

  for (const marketId of marketIds) {
    try {
      const market = await fetchMarketById(marketId);
      if (!market) continue;

      const prices = parseOutcomePrices(market);

      // Record snapshot
      addPriceSnapshot({
        marketId,
        yesPrice: prices.yes,
        noPrice: prices.no,
        volume: market.volumeNum ?? market.volume,
        timestamp: Date.now(),
      });

      // Check for significant movement (compare with 1hr ago)
      const hourAgo = getPriceNHoursAgo(marketId, 1);
      if (!hourAgo) continue;

      const deltaYes = Math.abs((prices.yes - hourAgo.yesPrice) * 100);

      if (deltaYes >= config.priceAlertThreshold) {
        // Don't spam - check if we already sent this alert recently (1hr cooldown)
        if (wasAlertSentRecently(marketId, "price_move", 60 * 60 * 1000)) continue;

        const direction = prices.yes > hourAgo.yesPrice ? "📈" : "📉";
        const fromPercent = (hourAgo.yesPrice * 100).toFixed(0);
        const toPercent = (prices.yes * 100).toFixed(0);
        const vol = formatVolume(market.volumeNum ?? market.volume);

        const message = [
          `${direction} <b>Price Alert</b>`,
          "",
          `<b>${escapeHtml(market.question)}</b>`,
          `YES: ${fromPercent}% → ${toPercent}% (${deltaYes >= 0 ? "+" : ""}${deltaYes.toFixed(1)}%)`,
          `Volume: ${vol}`,
          "",
          `<i>1hr movement exceeded ${config.priceAlertThreshold}% threshold</i>`,
        ].join("\n");

        const chatIds = getChatIdsWatchingMarket(marketId);
        await broadcastAlert(chatIds, message);

        // Record alert for dedup
        for (const chatId of chatIds) {
          addAlertRecord({
            marketId,
            type: "price_move",
            message,
            sentAt: Date.now(),
            chatId,
          });
        }
      }
    } catch (err) {
      console.error(`Price monitor error for ${marketId}:`, err);
    }
  }
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
