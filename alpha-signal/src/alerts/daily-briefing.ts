import { fetchMarkets } from "../data/polymarket/client.js";
import { parseOutcomePrices, formatVolume } from "../data/polymarket/types.js";
import { searchTwitter } from "../data/twitter/client.js";
import { generateBriefing } from "../analysis/agent-sdk.js";
import { sendAlert } from "./dispatcher.js";
import { config } from "../config.js";
import { sanitizeLlmOutput } from "../utils/format.js";

export async function sendDailyBriefing(): Promise<void> {
  if (!config.alertChatId) {
    console.log("Daily briefing: no TELEGRAM_ALERT_CHAT_ID configured, skipping.");
    return;
  }

  try {
    console.log("Generating daily briefing...");

    // Get top markets by volume
    const markets = await fetchMarkets({ limit: 10 });

    const topMovers = markets
      .map((m) => {
        const p = parseOutcomePrices(m);
        return `- "${m.question}" | YES: ${(p.yes * 100).toFixed(0)}% | Vol: ${formatVolume(m.volumeNum ?? m.volume)}`;
      })
      .join("\n");

    // Try to get Twitter sentiment on top topics
    let tweetSummary = "Twitter data unavailable.";
    try {
      const topQuestion = markets[0]?.question ?? "prediction markets";
      const result = await searchTwitter(topQuestion, { sort: "likes", limit: 5, quick: true });
      tweetSummary = result.tweets
        .slice(0, 3)
        .map((t) => `- @${t.authorUsername}: "${t.text.slice(0, 80)}..." (${t.metrics.likes} likes)`)
        .join("\n");
    } catch {
      // Twitter is optional for briefing
    }

    const briefing = await generateBriefing(topMovers, tweetSummary);
    const safeBriefing = sanitizeLlmOutput(briefing);

    const date = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const message = `<b>📰 Daily Briefing - ${date}</b>\n\n${safeBriefing}`;

    await sendAlert(config.alertChatId, message);
    console.log("Daily briefing sent.");
  } catch (err) {
    console.error("Daily briefing failed:", err);
  }
}
