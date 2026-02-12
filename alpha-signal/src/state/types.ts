export interface WatchedMarket {
  marketId: string;
  question: string;
  entryYesPrice: number;
  entryNoPrice: number;
  watchedAt: number; // epoch ms
}

export interface UserWatchlist {
  chatId: string;
  markets: WatchedMarket[];
}

export interface PriceSnapshot {
  marketId: string;
  yesPrice: number;
  noPrice: number;
  volume: number;
  timestamp: number;
}

export interface AlertRecord {
  marketId: string;
  type: "price_move" | "narrative" | "briefing";
  message: string;
  sentAt: number;
  chatId: string;
}

export interface AppState {
  watchlists: Record<string, UserWatchlist>; // keyed by chatId
  priceHistory: Record<string, PriceSnapshot[]>; // keyed by marketId, last 24h
  alertHistory: AlertRecord[];
}
