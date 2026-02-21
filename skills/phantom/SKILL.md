---
name: phantom
description: Use when the user needs Phantom wallet integration, Solana/multi-chain transaction signing, wallet connection, or any Phantom SDK documentation. Searches the Phantom developer docs MCP server for relevant guides, API references, and code examples.
---

# Phantom Wallet Skill

[PHANTOM MODE ACTIVATED]

## Objective

Search and retrieve Phantom developer documentation to assist with wallet integration, transaction signing, multi-chain support, and Portal setup for trading projects.

## MCP Tool

This skill uses the `phantom-docs` MCP server via the `SearchPhantomDeveloper` tool.

**Endpoint**: `https://docs.phantom.com/mcp`

## When to Use This Skill

- Connecting Phantom wallet to a dApp or trading interface
- Signing and sending transactions (swap, transfer, trade)
- Multi-chain support (Solana, Ethereum, Base, Polygon, Bitcoin)
- Portal (embedded wallet) setup and configuration
- Message authentication / signing arbitrary messages
- SDK integration patterns and code examples
- Troubleshooting wallet connection issues

## How to Search

Use `SearchPhantomDeveloper` with targeted queries. Be specific:

```
Good:  "how to sign a Solana transaction with Phantom"
Good:  "connect Phantom wallet React dApp"
Good:  "Portal embedded wallet setup"
Bad:   "wallet" (too broad)
```

## Workflow

1. **Identify the integration need** — wallet connect, tx signing, multi-chain, Portal, etc.
2. **Search with `SearchPhantomDeveloper`** using a focused query
3. **Retrieve code examples** and relevant API references from the results
4. **Implement** using the exact patterns from Phantom docs
5. **If results are sparse**, refine query and search again

## Key Topics

### Wallet Connection
- `connect` / `disconnect` methods
- `window.phantom.solana` provider detection
- React hooks for wallet state

### Transaction Signing (Trading)
- `signTransaction` — sign without sending
- `signAndSendTransaction` — sign + broadcast
- `signAllTransactions` — batch signing
- Versioned transactions (v0) for Solana

### Multi-Chain
- Solana (primary)
- Ethereum, Base, Polygon (EVM chains)
- Bitcoin

### Portal (Embedded Wallet)
- SDK installation and setup
- White-label wallet UI
- Custom RPC configuration

### Message Signing
- `signMessage` — arbitrary message signing
- Verification patterns

## Output Format

After searching, provide:
- **Integration Pattern** — the recommended approach
- **Code Example** — working snippet from Phantom docs
- **Key Methods** — relevant SDK methods
- **Gotchas** — common pitfalls or caveats

## Trading Project Notes

For a trading project, the most critical Phantom capabilities are:
1. **Transaction signing** — sign swap/trade transactions from DEX aggregators (Jupiter, Raydium, etc.)
2. **Wallet detection** — check if Phantom is installed, handle mobile deep links
3. **Multi-chain** — if trading across EVM chains + Solana
4. **signAndSendTransaction** — preferred for atomic trade execution

Always check for the latest Phantom SDK version and use `window.phantom` (not `window.solana`) for future compatibility.
