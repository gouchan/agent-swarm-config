---
description: Run alpha signal analysis combining Polymarket data with X/Twitter sentiment
aliases: [signal, alpha]
---

Run alpha signal analysis for: {{ARGUMENTS}}

## Instructions

1. Search Polymarket for markets related to the topic using WebSearch or WebFetch:
   - URL: `https://gamma-api.polymarket.com/markets?active=true&closed=false&order=volume&ascending=false&limit=10`
   - Filter results for markets matching the topic keywords

2. Search X/Twitter for social sentiment:
   - If x-research skill is available, use it: `search "<topic>" --sort likes --limit 10`
   - Otherwise use WebSearch to find recent X/Twitter discussion

3. Delegate cross-reference analysis to the alpha-signal-analyst agent:
   ```
   Task(subagent_type="alpha-signal-analyst", prompt="
     Analyze the alpha signal for: <topic>

     Market Data:
     <polymarket results>

     Social Sentiment:
     <twitter results>

     Provide: narrative, conviction (1-5), directional edge, risks.
   ")
   ```

4. Present the final analysis with clear formatting.
