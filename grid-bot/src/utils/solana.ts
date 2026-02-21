/**
 * Solana RPC connection helpers and wallet utilities
 */

import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import bs58 from 'bs58';
import { logger } from './logger.js';

let connectionInstance: Connection | null = null;

/**
 * Get or create a Solana RPC connection (singleton)
 */
export function getConnection(rpcUrl?: string): Connection {
  if (!connectionInstance) {
    // Prefer Helius RPC if API key is set (faster, more reliable, higher limits)
    const heliusKey = process.env.HELIUS_API_KEY;
    let url: string;
    if (heliusKey) {
      url = `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`;
    } else {
      url = rpcUrl || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    }
    connectionInstance = new Connection(url, 'confirmed');
    const displayUrl = heliusKey ? 'Helius RPC (premium)' : url;
    logger.info(`Solana RPC connected: ${displayUrl}`);
  }
  return connectionInstance;
}

/**
 * Load bot keypair from file, or generate a new one if not found
 */
export function loadOrCreateKeypair(path?: string): Keypair {
  const keypairPath = path || process.env.BOT_KEYPAIR_PATH || './keypair.json';

  if (existsSync(keypairPath)) {
    const raw = readFileSync(keypairPath, 'utf-8');
    const secretKey = new Uint8Array(JSON.parse(raw));
    const keypair = Keypair.fromSecretKey(secretKey);
    logger.info(`Wallet loaded: ${keypair.publicKey.toBase58()}`);
    return keypair;
  }

  // Generate fresh keypair
  const keypair = Keypair.generate();
  writeFileSync(keypairPath, JSON.stringify(Array.from(keypair.secretKey)));
  logger.warn(`New keypair generated: ${keypair.publicKey.toBase58()}`);
  logger.warn(`Fund this wallet with SOL + USDC before going live`);
  logger.warn(`Keypair saved to: ${keypairPath}`);
  return keypair;
}

/**
 * Get SOL balance for a public key
 */
export async function getSolBalance(
  connection: Connection,
  publicKey: PublicKey,
): Promise<number> {
  const lamports = await connection.getBalance(publicKey);
  return lamports / LAMPORTS_PER_SOL;
}

/**
 * Get SPL token balance for a specific mint
 */
export async function getTokenBalance(
  connection: Connection,
  walletPubkey: PublicKey,
  mintAddress: string,
): Promise<number> {
  const mint = new PublicKey(mintAddress);
  const tokenAccounts = await connection.getTokenAccountsByOwner(walletPubkey, {
    mint,
  });

  if (tokenAccounts.value.length === 0) return 0;

  const accountInfo = await connection.getTokenAccountBalance(
    tokenAccounts.value[0].pubkey,
  );

  return Number(accountInfo.value.uiAmount || 0);
}

/**
 * Shorten a public key for display
 */
export function shortAddress(address: string): string {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

/**
 * Convert lamports to SOL
 */
export function lamportsToSol(lamports: number): number {
  return lamports / LAMPORTS_PER_SOL;
}
