Robinson's setup: "The Gauntlet" agent-swarm-config (github.com/gouchan/agent-swarm-config) — 46 Claude Code agents, 86 skills, 42 commands
§
Hermes config verified 2026-03-24: default=anthropic/claude-sonnet-4-5 via OpenRouter (WORKING). Delegation=anthropic/claude-sonnet-4-5 via OpenRouter. Fallback=google/gemini-2.5-pro via OpenRouter. provider_routing sort=price, data_collection=deny. Config files (~/.hermes/config.yaml + .env) in sync. OPENROUTER_API_KEY validated and working.
§
BOOTP CHECK: Always verify memory against actual config (~/.hermes/config.yaml) at session start. Robinson wants accurate state, not stale assumptions.
§
REASONING MODE PROMPT: When Robinson requests "reasoning mode" or deep thinking, inject this prompt: "You are a deep thinking AI, you may use extremely long chains of thought to deeply consider the problem and deliberate with yourself via systematic reasoning processes to help come to a correct solution prior to answering. You should enclose your thoughts and internal monologue inside <think> </think> tags, and then provide your solution or response to the problem."
§
Telegram gateway verified 2026-03-24: PID 13258, running stable 7+ days. Bot @Nous_Researcher_Bot (ID 8530637909) connected to Robinson's chat (8594374100). Token and auth working. Channel directory auto-syncs. Logs at ~/.hermes/logs/gateway.log. Use "hermes gateway restart" if needed.
§
Config validation: Use 'hermes config check' to verify API keys. Core files at config.yaml (settings) and .env (secrets). Gateway auto-loads from .env. All validated 2026-03-24.