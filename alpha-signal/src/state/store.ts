import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import { config } from "../config.js";
import type { UserWatchlist, WatchedMarket, PriceSnapshot, AlertRecord } from "./types.js";

const stateDir = config.stateDir;

function ensureDir(): void {
  if (!existsSync(stateDir)) mkdirSync(stateDir, { recursive: true });
}

function readJson<T>(filename: string, fallback: T): T {
  ensureDir();
  const path = join(stateDir, filename);
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, "utf-8"));
  } catch {
    return fallback;
  }
}

function writeJson(filename: string, data: unknown): void {
  ensureDir();
  const path = join(stateDir, filename);
  const tmpPath = path + ".tmp";
  writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  renameSync(tmpPath, path);
}

// Watchlist operations

export function getWatchlist(chatId: string): WatchedMarket[] {
  const watchlists = readJson<Record<string, UserWatchlist>>("watchlists.json", {});
  return watchlists[chatId]?.markets ?? [];
}

export function addToWatchlist(chatId: string, market: WatchedMarket): void {
  const watchlists = readJson<Record<string, UserWatchlist>>("watchlists.json", {});
  if (!watchlists[chatId]) {
    watchlists[chatId] = { chatId, markets: [] };
  }
  // Don't add duplicates
  if (watchlists[chatId].markets.some((m) => m.marketId === market.marketId)) return;
  watchlists[chatId].markets.push(market);
  writeJson("watchlists.json", watchlists);
}

export function removeFromWatchlist(chatId: string, marketId: string): boolean {
  const watchlists = readJson<Record<string, UserWatchlist>>("watchlists.json", {});
  if (!watchlists[chatId]) return false;
  const before = watchlists[chatId].markets.length;
  watchlists[chatId].markets = watchlists[chatId].markets.filter((m) => m.marketId !== marketId);
  if (watchlists[chatId].markets.length === before) return false;
  writeJson("watchlists.json", watchlists);
  return true;
}

export function getAllWatchedMarketIds(): string[] {
  const watchlists = readJson<Record<string, UserWatchlist>>("watchlists.json", {});
  const ids = new Set<string>();
  for (const wl of Object.values(watchlists)) {
    for (const m of wl.markets) ids.add(m.marketId);
  }
  return [...ids];
}

export function getChatIdsWatchingMarket(marketId: string): string[] {
  const watchlists = readJson<Record<string, UserWatchlist>>("watchlists.json", {});
  return Object.values(watchlists)
    .filter((wl) => wl.markets.some((m) => m.marketId === marketId))
    .map((wl) => wl.chatId);
}

// Price history operations

export function addPriceSnapshot(snapshot: PriceSnapshot): void {
  const history = readJson<Record<string, PriceSnapshot[]>>("price-history.json", {});
  if (!history[snapshot.marketId]) history[snapshot.marketId] = [];
  history[snapshot.marketId].push(snapshot);

  // Keep only last 24h
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  history[snapshot.marketId] = history[snapshot.marketId].filter((s) => s.timestamp > cutoff);

  writeJson("price-history.json", history);
}

export function getPriceHistory(marketId: string): PriceSnapshot[] {
  const history = readJson<Record<string, PriceSnapshot[]>>("price-history.json", {});
  return history[marketId] ?? [];
}

export function getLatestPrice(marketId: string): PriceSnapshot | null {
  const history = getPriceHistory(marketId);
  return history.length > 0 ? history[history.length - 1] : null;
}

export function getPriceNHoursAgo(marketId: string, hours: number): PriceSnapshot | null {
  const history = getPriceHistory(marketId);
  const targetTime = Date.now() - hours * 60 * 60 * 1000;
  const maxDrift = hours * 60 * 60 * 1000; // Don't return snapshots further than the window

  // Find closest snapshot to target time
  let closest: PriceSnapshot | null = null;
  let closestDiff = Infinity;
  for (const snap of history) {
    const diff = Math.abs(snap.timestamp - targetTime);
    if (diff < closestDiff && diff <= maxDrift) {
      closestDiff = diff;
      closest = snap;
    }
  }
  return closest;
}

// Alert history

export function addAlertRecord(record: AlertRecord): void {
  const history = readJson<AlertRecord[]>("alert-history.json", []);
  history.push(record);
  // Keep last 1000
  if (history.length > 1000) history.splice(0, history.length - 1000);
  writeJson("alert-history.json", history);
}

export function wasAlertSentRecently(marketId: string, type: string, withinMs: number): boolean {
  const history = readJson<AlertRecord[]>("alert-history.json", []);
  const cutoff = Date.now() - withinMs;
  return history.some(
    (r) => r.marketId === marketId && r.type === type && r.sentAt > cutoff
  );
}
