# DEV.md — scraper-poc internals

Reference for anyone working on this codebase.

---

## Architecture

```
Browser → index.html (vanilla JS)
              ↓  fetch
           server.js (Express)
              ├── POST /api/scrape  → scraper.js → scrapeUrl()
              ├── POST /api/crawl   → scraper.js → crawl()
              └── GET  /api/download → axios stream proxy
```

No bundler. No framework. Node ESM (`"type": "module"` in package.json).

---

## scraper.js — extraction pipeline

### Entry points

| Function | Does |
|----------|------|
| `scrapeUrl(url, useApi)` | Scrapes a single page, returns structured result |
| `crawl(rootUrl, pathRegex, maxPages, useApi)` | Multi-page BFS crawl |

### scrapeUrl flow

```
fetchDirect / fetchViaScraperApi
    ↓ raw HTML
cheerio.load($)
    ↓
fetchAllCss($, url)         ← fetches all <link> stylesheets + inline <style> blocks once
    ↓ cssBlocks[]
extractFontsFromCss()       ← parses @font-face from pre-fetched cssBlocks (no re-fetch)
extractCssBgImagesFromCss() ← extracts background-image URLs from pre-fetched cssBlocks
extractImages()             ← <img>, srcset, <picture>, inline style, og:image
extractLinks()              ← internal vs external, deduplicated
extractFiles()              ← downloadable assets by extension + heuristic
extractHeadings()           ← h1–h4 in document order (single combined selector)
extractProductBlocks()      ← sections/articles containing price patterns
    ↓
return { meta, summary, images, fonts, files, links, headings, productBlocks }
```

### Key design decisions

**CSS is fetched once.** `fetchAllCss` loads all stylesheets and passes `cssBlocks[]` to both `extractFontsFromCss` and `extractCssBgImagesFromCss`. Previously they each fetched independently (double-fetch bug).

**Headings use a combined selector.** `$("h1, h2, h3, h4")` preserves document order. Iterating tag-by-tag (`$("h1").each...`, then `$("h2").each...`) would group all h1s before all h2s.

**@font-face uses brace counting.** `parseFontFaces` walks character-by-character with a depth counter instead of `[^}]+` regex — handles nested braces in minified CSS that would otherwise truncate early.

**dedupeBy keeps null-key items.** If an item has no value for the dedup key, it's always kept (not silently dropped).

### Fetch functions

| Function | Used for | Size cap | Redirects |
|----------|----------|----------|-----------|
| `fetchDirect` | Main HTML | 10 MB | 3 hops, SSRF-checked manually |
| `fetchViaScraperApi` | JS-rendered sites | 10 MB | Handled by ScraperAPI |
| `fetchCss` | Stylesheets | 2 MB | 3, via axios |

`fetchDirect` handles redirects manually (instead of `maxRedirects: N`) so each hop can be SSRF-checked against private IP ranges. This prevents redirect-based SSRF where an external URL redirects to an internal address.

### crawl BFS

```
queue = [rootUrl]
queued = new Set([rootUrl])   ← O(1) dedup, not queue.includes() which is O(n)
visited = new Set()

while queue and visited.size < maxPages:
    url = queue.shift()
    result = scrapeUrl(url)
    for link in result.links.internal:
        if not visited and not queued and pathFilter.test(pathname):
            queued.add(link)
            queue.push(link)
    sleep(800ms)  ← polite crawl delay
```

---

## server.js — API layer

### SSRF guard (`isPrivateHost`)

Async. Runs on every inbound URL across all three endpoints.

1. **Normalize** — decodes decimal (`2130706433`), hex (`0x7f000001`), octal (`0177.0.0.1`), and IPv6-mapped IPv4 (`::ffff:192.168.1.1`) to dotted-decimal before any checks
2. **String check** — fast regex against localhost, 127.x, 10.x, 172.16-31.x, 192.168.x, 169.254.x, ::1, fe80:, metadata.google.internal
3. **DNS resolution** — resolves the hostname via `dns.lookup({ all: true })` and checks every returned IP — catches DNS rebinding attacks (e.g. `localtest.me → 127.0.0.1`)

Fails closed: any parse error or exception returns `true` (treat as private).

**Limitation:** DNS TOCTOU — there's a window between our check and axios's actual request where a malicious DNS record could change. Mitigated but not eliminated without a custom socket-level check.

### pathFilter sanitization (`makeSafePathRegex`)

Rejects any pattern containing `+ ? { } ( ) | \ [ ] ^ $` — the quantifiers and grouping operators that enable catastrophic backtracking (ReDoS). Only allows literal path characters and `*` as a wildcard (converted to `.*`).

Examples:
- `/blog` → matches paths starting with `/blog`
- `/products/*` → matches `/products/anything`
- `(a+)+` → rejected with 400

### Request body limit

`express.json({ limit: "1mb" })` — reduced from the default 100kb Express limit to prevent large payload attacks while still supporting reasonable crawl configs.

---

## index.html — UI

Single file, ~1300 lines. Structure:

```
<style>          CSS (variables, layout, tabs, cards, dark accents)
<body>           Static HTML scaffold
<script>         All JS — no framework
  doScrape()     Calls /api/scrape, calls renderResult()
  doCrawl()      Calls /api/crawl, renders crawl summary
  renderResult() Routes to tab renderers
  renderImages / renderFonts / renderFiles / renderLinks / renderProducts / renderHeadings / renderJson
  switchTab()    Tab switcher, remembers lastTab across re-renders
  openCrawlPage() Drills into a crawl result page
  triggerDownload() Deferred revokeObjectURL to prevent race condition
  syntaxHighlight() HTML-escapes before regex colorizing (XSS-safe)
  esc()          HTML entity escape — used on all innerHTML assignments
```

### State

```js
let lastResult       // most recent scrape result
let lastCrawlResult  // most recent crawl result
let lastTab          // which tab was active — preserved across re-renders
```

### Known limitations / future work

- No streaming progress for crawl (HTTP connection held open for entire run)
- All JS/CSS in one file — consider splitting for maintainability
- No auth on any endpoint — fine for local dev, not for production
- Rate limiting not implemented — add `express-rate-limit` before exposing publicly
- Font preview injects family name into `style=""` — CSS-escaped but not perfect

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SCRAPERAPI_KEY` | No | Enables ScraperAPI mode for JS-rendered sites |
| `PORT` | No | Server port (default: `3000`) |

`.env` is parsed manually at startup. Supports `KEY=value`, `KEY="value"`, and `KEY='value'` (quotes stripped).

---

## Running

```bash
npm start       # node server.js
npm run dev     # node --watch server.js (auto-restart on file changes)
```

No build step. Changes to `scraper.js` or `server.js` require restart (or use `npm run dev`). Changes to `public/index.html` are served immediately on next request.
