import { Bot } from "grammy";
import { config } from "../config.js";
import { marketsCommand } from "./commands/markets.js";
import { watchCommand, unwatchCommand } from "./commands/watch.js";
import { portfolioCommand } from "./commands/portfolio.js";
import { researchCommand } from "./commands/research.js";
import { signalCommand } from "./commands/signal.js";

export function createBot(): Bot {
  const bot = new Bot(config.telegramBotToken);

  // Error handler
  bot.catch((err) => {
    console.error("Bot error:", err.message);
  });

  // Commands
  bot.command("start", (ctx) =>
    ctx.reply(
      [
        "<b>⚡ Alpha Signal Bot</b>",
        "",
        "Prediction market intelligence powered by Polymarket + X/Twitter.",
        "",
        "<b>Commands:</b>",
        "/markets - Top Polymarket markets by volume",
        "/signal &lt;topic&gt; - AI cross-analysis (market + sentiment)",
        "/watch &lt;market_id&gt; - Watch a market for alerts",
        "/unwatch &lt;market_id&gt; - Stop watching",
        "/portfolio - Your watched markets with live prices",
        "/research &lt;query&gt; - Search X/Twitter for a topic",
        "/help - Show this message",
      ].join("\n"),
      { parse_mode: "HTML" }
    )
  );

  bot.command("help", (ctx) =>
    ctx.reply(
      [
        "<b>⚡ Alpha Signal Commands</b>",
        "",
        "/markets - Browse top prediction markets",
        "/signal &lt;topic&gt; - Cross-reference markets with social sentiment",
        "/watch &lt;id&gt; - Track a market (get alerts on >5% moves)",
        "/unwatch &lt;id&gt; - Remove from watchlist",
        "/portfolio - View all watched markets",
        "/research &lt;query&gt; - Deep Twitter research",
        "",
        "<b>Automated Alerts:</b>",
        "- Price moves >5% in 1hr on watched markets",
        "- Daily briefing at 8am UTC",
      ].join("\n"),
      { parse_mode: "HTML" }
    )
  );

  bot.command("markets", marketsCommand);
  bot.command("signal", signalCommand);
  bot.command("watch", watchCommand);
  bot.command("unwatch", unwatchCommand);
  bot.command("portfolio", portfolioCommand);
  bot.command("research", researchCommand);

  return bot;
}
