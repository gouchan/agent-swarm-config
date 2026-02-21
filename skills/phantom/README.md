# Phantom Wallet Skill

Search and retrieve Phantom developer documentation via MCP for building wallet-integrated trading apps.

## Purpose

This skill connects to the Phantom MCP documentation server (`https://docs.phantom.com/mcp`) to give Claude live access to Phantom's full developer docs — wallet connections, transaction signing, multi-chain support, and Portal (embedded wallet) setup.

## Use Cases

- **Trading projects** — sign swap/DEX transactions, connect Phantom wallet to a trading UI
- **Solana dApps** — integrate `signTransaction`, `signAndSendTransaction`, versioned tx (v0)
- **Multi-chain** — Solana, Ethereum, Base, Polygon, Bitcoin support
- **Portal** — embed a white-label Phantom wallet in your app
- **Message signing** — authenticate users via `signMessage`

## MCP Server Setup

### Claude Code (CLI)
```bash
claude mcp add --transport http phantom-docs https://docs.phantom.com/mcp
```

### `.mcp.json` (for the Gauntlet)
```json
{
  "mcpServers": {
    "phantom-docs": {
      "type": "http",
      "url": "https://docs.phantom.com/mcp"
    }
  }
}
```

### Cursor
```json
{
  "mcpServers": {
    "phantom-docs": {
      "transport": "sse",
      "url": "https://docs.phantom.com/mcp"
    }
  }
}
```

## Activation

Say any of:
- `"Use /phantom to integrate the wallet"`
- `"How do I sign a Solana transaction with Phantom?"`
- `"Set up Phantom wallet connection"`
- `"Use Phantom docs to..."`

## Key Capabilities

| Topic | Description |
|-------|-------------|
| Wallet Connect | Detect, connect, disconnect Phantom |
| Transaction Signing | `signTransaction`, `signAndSendTransaction`, `signAllTransactions` |
| Multi-chain | Solana + EVM (ETH, Base, Polygon) + Bitcoin |
| Portal | Embedded white-label wallet SDK |
| Message Signing | `signMessage` for auth flows |

## Resources

- [Phantom Developer Docs](https://docs.phantom.com)
- [MCP Server](https://docs.phantom.com/mcp)
- [GitHub](https://github.com/phantom)
