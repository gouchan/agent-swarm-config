/**
 * Token pair definitions
 *
 * Mint addresses for Solana SPL tokens used in trading.
 * POC starts with SOL/USDC. Add more pairs here for expansion.
 */

export interface TokenPair {
  name: string;
  base: TokenInfo;
  quote: TokenInfo;
  /** Birdeye API pair address (for OHLCV data) */
  birdeyeAddress?: string;
}

export interface TokenInfo {
  symbol: string;
  mint: string;
  decimals: number;
}

// ─── Solana Token Mints ────────────────────────────────────

export const TOKENS = {
  SOL: {
    symbol: 'SOL',
    mint: 'So11111111111111111111111111111111111111112',
    decimals: 9,
  },
  USDC: {
    symbol: 'USDC',
    mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    decimals: 6,
  },
  USDT: {
    symbol: 'USDT',
    mint: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    decimals: 6,
  },
} as const;

// ─── Trading Pairs ─────────────────────────────────────────

export const PAIRS: Record<string, TokenPair> = {
  'SOL/USDC': {
    name: 'SOL/USDC',
    base: TOKENS.SOL,
    quote: TOKENS.USDC,
    birdeyeAddress: 'So11111111111111111111111111111111111111112',
  },
};

export function getPair(name: string): TokenPair {
  const pair = PAIRS[name];
  if (!pair) {
    throw new Error(`Unknown pair: ${name}. Available: ${Object.keys(PAIRS).join(', ')}`);
  }
  return pair;
}
