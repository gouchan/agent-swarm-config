import { config, validateConfig } from "./config.js";
import { createBot } from "./bot/bot.js";
import { setDispatcherApi } from "./alerts/dispatcher.js";
import { startScheduler, stopScheduler } from "./alerts/scheduler.js";

async function main(): Promise<void> {
  console.log("⚡ Alpha Signal Bot starting...\n");

  // Validate config
  const missing = validateConfig();
  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(", ")}`);
    console.error("Copy .env.example to .env and fill in your keys.");
    process.exit(1);
  }

  // Create and start bot
  const bot = createBot();

  // Wire up alert dispatcher
  setDispatcherApi(bot.api);

  // Start alert scheduler
  startScheduler();

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\nShutting down...");
    stopScheduler();
    await bot.stop();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  // Start polling
  console.log("Bot is running. Press Ctrl+C to stop.\n");
  console.log("Features:");
  console.log(`  Polymarket: active`);
  console.log(`  X/Twitter: ${config.xBearerToken ? "active" : "inactive (set X_BEARER_TOKEN)"}`);
  console.log(`  AI Analysis: ${config.anthropicApiKey ? "active" : "inactive (set ANTHROPIC_API_KEY)"}`);
  console.log(`  Alerts: ${config.alertChatId ? `active (chat: ${config.alertChatId})` : "inactive (set TELEGRAM_ALERT_CHAT_ID)"}`);
  console.log(`  Price polling: every ${config.pollIntervalMinutes}min`);
  console.log(`  Daily briefing: ${config.briefingHourUtc}:00 UTC\n`);

  await bot.start();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
