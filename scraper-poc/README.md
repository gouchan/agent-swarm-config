# scraper-poc

A web scraper that extracts **images, fonts, PDFs, links, headings, and product blocks** from any URL. Single-page UI, no build step, proxy-download endpoint to bypass CORS.

## What it extracts

| Tab | Source |
|-----|--------|
| **Images** | `<img>`, `srcset`, `<picture>`, CSS `background-image`, OG/Twitter meta |
| **Fonts** | Follows `<link>` stylesheets, parses all `@font-face` blocks, finds `.woff2/.woff/.ttf/.otf` |
| **Files** | `<a href>` pointing to `.pdf`, `.zip`, `.docx`, `.xlsx`, `.mp4`, etc. |
| **Links** | Internal + external, deduplicated |
| **Products** | Sections/cards containing price patterns (`$`, `€`, `AU$`, …) |
| **Headings** | h1–h4 in document order |
| **JSON** | Full raw output, downloadable |

**Crawl mode** starts at the root URL and follows internal links filtered by a path pattern (e.g. `/blog` or `/blog/*`) up to N pages.

**Download** routes every asset through `/api/download`, which proxies the file server-side — bypasses browser CORS restrictions entirely.

---

## Quick start

```bash
cd scraper-poc
npm install
npm start
# → http://localhost:3000
```

For development with auto-restart:

```bash
npm run dev
```

---

## ScraperAPI (for JS-rendered / bot-protected sites)

Direct fetch works for most static and server-rendered sites (Shopify, Squarespace, WordPress, etc.). For JS-heavy or bot-protected sites:

1. Get a key at [scraperapi.com](https://www.scraperapi.com)
2. Create `.env` in the project root: `SCRAPERAPI_KEY=your_key_here`
3. Check **"Use ScraperAPI"** in the UI before scraping

---

## Project structure

```
scraper-poc/
├── server.js         Express API + SSRF guard + security middleware
├── scraper.js        Core extraction engine
├── public/
│   └── index.html    Single-page UI (vanilla JS, no build step)
├── .env              Optional — add SCRAPERAPI_KEY here
└── package.json
```

---

## API

### `POST /api/scrape`
```json
{ "url": "https://example.com", "useApi": false }
```
Returns `{ meta, summary, images, fonts, files, links, headings, productBlocks }`.

### `POST /api/crawl`
```json
{
  "url": "https://example.com",
  "pathFilter": "/blog/*",
  "maxPages": 10,
  "useApi": false
}
```
`pathFilter` supports literal paths and `*` wildcards (e.g. `/blog`, `/products/*`). Arbitrary regex is not accepted.

Returns `{ pages: N, results: [...] }` — each result has the same shape as `/api/scrape`.

### `GET /api/download?url=...&filename=...`
Proxies the remote asset as a browser download. Sets `Content-Disposition` and mirrors `Content-Type`.

---

## Security

- **SSRF protection** on all endpoints — blocks localhost, RFC-1918 ranges, link-local, IPv6 loopback, AWS/GCP metadata. DNS resolution catches domain-based bypasses (e.g. `localtest.me → 127.0.0.1`). Encoded IPs (decimal, hex, octal, IPv6-mapped) are normalized before checking.
- **Redirect validation** — redirects are followed manually (up to 3 hops) with SSRF checks at each hop.
- **ReDoS prevention** — `pathFilter` only accepts literal paths + `*` wildcards. Regex quantifiers are rejected server-side.
- **Response size caps** — HTML: 10 MB, CSS: 2 MB, downloads: 50 MB.
- **Security headers** — `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy` on every response.
- **Error messages** — raw error details are logged server-side only; clients receive generic messages.

---

## Extending

- **More file types** → add extensions to `DOWNLOADABLE_EXTENSIONS` in `scraper.js`
- **More stylesheets** → raise the `jobs.slice(0, 10)` cap in `fetchAllCss`
- **Video/audio** → handle `<video src>`, `<source src>`, add `.mp4/.webm` to the image or files extractor
- **Swap fetch backend** → replace `fetchDirect` calls in `scrapeUrl` with any other HTTP client or API
