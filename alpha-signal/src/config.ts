import { resolve } from "node:path";

export const config = {
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",
  xBearerToken: process.env.X_BEARER_TOKEN ?? "",
  alertChatId: process.env.TELEGRAM_ALERT_CHAT_ID ?? "",
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY ?? "",

  priceAlertThreshold: clampInt(process.env.PRICE_ALERT_THRESHOLD, 1, 50, 5),
  pollIntervalMinutes: clampInt(process.env.POLL_INTERVAL_MINUTES, 1, 60, 5),
  briefingHourUtc: clampInt(process.env.BRIEFING_HOUR_UTC, 0, 23, 8),
  logLevel: parseLogLevel(process.env.LOG_LEVEL),
  stateDir: resolve(process.env.STATE_DIR ?? "./data"),
} as const;

function clampInt(raw: string | undefined, min: number, max: number, fallback: number): number {
  const n = Number(raw ?? String(fallback));
  if (Number.isNaN(n) || !Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function parseLogLevel(raw: string | undefined): "debug" | "info" | "warn" | "error" {
  const valid = ["debug", "info", "warn", "error"] as const;
  const v = raw?.toLowerCase();
  return valid.includes(v as any) ? (v as any) : "info";
}

export function validateConfig(): string[] {
  const missing: string[] = [];
  if (!config.telegramBotToken) missing.push("TELEGRAM_BOT_TOKEN");
  return missing;
}
