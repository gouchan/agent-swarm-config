# API / Integration Reference

> Replace this file with documentation specific to your skill's tools or APIs.
> This file is loaded on-demand — keep SKILL.md focused on workflow, put deep docs here.

## Rate Limits

- [Endpoint]: [limit] requests per [period]

## Pagination

- Use cursor-based pagination with `next_cursor` field
- Default page size: [N]
- Max page size: [N]

## Common Error Codes

| Code | Meaning | Action |
|---|---|---|
| 401 | Unauthorized | Refresh API token |
| 429 | Rate limited | Wait [N] seconds, retry |
| 404 | Not found | Verify ID or resource exists |

## Tool Names (MCP)

> List exact tool names from the MCP server — they are case-sensitive.

- `tool_name_one` — What it does
- `tool_name_two` — What it does
