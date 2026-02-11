export const config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  xBearerToken: process.env.X_BEARER_TOKEN ?? "",
  alertChatId: process.env.TELEGRAM_ALERT_CHAT_ID ?? "",
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY ?? "",

  priceAlertThreshold: Number(process.env.PRICE_ALERT_THRESHOLD ?? "5"),
  pollIntervalMinutes: Number(process.env.POLL_INTERVAL_MINUTES ?? "5"),
  briefingHourUtc: Number(process.env.BRIEFING_HOUR_UTC ?? "8"),
  logLevel: (process.env.LOG_LEVEL ?? "info") as "debug" | "info" | "warn" | "error",
  stateDir: process.env.STATE_DIR ?? "./data",
} as const;

export function validateConfig(): string[] {
  const missing: string[] = [];
  if (!config.telegramBotToken) missing.push("TELEGRAM_BOT_TOKEN");
  return missing;
}
