/**
 * server.js
 * Express API server for the scraper POC.
 *
 * Endpoints:
 *   POST /api/scrape          — scrape a single URL
 *   POST /api/crawl           — multi-page crawl
 *   GET  /api/download        — proxy-download a remote asset (handles CORS)
 */

import { readFileSync } from "fs";
import dns from "dns/promises";
import express from "express";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";
import { scrapeUrl, crawl } from "./scraper.js";

// Load .env manually (no extra dependency needed)
try {
  const env = readFileSync(new URL(".env", import.meta.url), "utf8");
  for (const line of env.split("\n")) {
    const [k, ...v] = line.trim().split("=");
    if (k && !k.startsWith("#") && !process.env[k]) {
      // Strip surrounding quotes so KEY="value" and KEY='value' both work
      process.env[k] = v.join("=").replace(/^(['"])(.*)\1$/, "$2").trim();
    }
  }
} catch { /* .env is optional */ }

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// Security headers — applied to every response
// ---------------------------------------------------------------------------
app.use((_, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// ---------------------------------------------------------------------------
// SSRF guard
// ---------------------------------------------------------------------------

/** Check if a resolved IP string is in a private/reserved range */
function isPrivateIp(ip) {
  if (/^127\./.test(ip) || ip === "::1" || ip === "0.0.0.0") return true;
  if (/^10\./.test(ip)) return true;
  if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(ip)) return true;
  if (/^192\.168\./.test(ip)) return true;
  if (/^169\.254\./.test(ip)) return true;   // link-local (AWS/GCP metadata)
  if (/^fe[89ab]/i.test(ip) || /^fc/i.test(ip) || /^fd/i.test(ip)) return true;
  return false;
}

/** Normalize numeric/hex/octal/IPv6-mapped encoded IPs to dotted-decimal */
function normalizeHost(hostname) {
  // Strip IPv6 brackets: [::1] → ::1
  hostname = hostname.replace(/^\[|\]$/g, "");

  // IPv6-mapped IPv4: ::ffff:192.168.1.1
  const v4mapped = hostname.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  if (v4mapped) return v4mapped[1];

  // Pure decimal integer: 2130706433 → 127.0.0.1
  if (/^\d+$/.test(hostname)) {
    const n = parseInt(hostname, 10);
    if (n >= 0 && n <= 0xFFFFFFFF) {
      return [(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF].join(".");
    }
  }

  // Hex encoded: 0x7f000001 → 127.0.0.1
  if (/^0x[0-9a-f]+$/i.test(hostname)) {
    const n = parseInt(hostname, 16);
    if (n >= 0 && n <= 0xFFFFFFFF) {
      return [(n >>> 24) & 0xFF, (n >>> 16) & 0xFF, (n >>> 8) & 0xFF, n & 0xFF].join(".");
    }
  }

  // Octal-dotted: 0177.0.0.1
  if (/^(0[0-7]*)(\.(0[0-7]*))*$/.test(hostname)) {
    const parts = hostname.split(".").map((p) => parseInt(p, 8));
    if (parts.length === 4 && parts.every((n) => n >= 0 && n <= 255)) {
      return parts.join(".");
    }
  }

  return hostname;
}

function isRawIp(h) {
  return /^[\d.]+$/.test(h) || /^[0-9a-f:]+$/i.test(h);
}

/**
 * Async SSRF guard.
 * 1. Normalizes encoded IPs (decimal, hex, octal, IPv6-mapped)
 * 2. Resolves hostname via DNS to catch DNS rebinding (e.g. localtest.me → 127.0.0.1)
 * Fails closed on any error.
 */
async function isPrivateHost(urlStr) {
  try {
    const { hostname, protocol } = new URL(urlStr);
    if (!["http:", "https:"].includes(protocol)) return true;

    const host = normalizeHost(hostname);

    if (isPrivateIp(host) || host === "localhost" || host === "metadata.google.internal") {
      return true;
    }

    // DNS resolution — catches DNS rebinding attacks
    if (!isRawIp(host)) {
      const results = await dns.lookup(host, { all: true }).catch(() => []);
      for (const { address } of results) {
        if (isPrivateIp(address)) return true;
      }
    }

    return false;
  } catch {
    return true; // fail closed
  }
}

// ---------------------------------------------------------------------------
// Safe path filter — prevents ReDoS from user-supplied regex
// ---------------------------------------------------------------------------

/**
 * Converts a simple path pattern to a RegExp.
 * Only allows literal path characters and * wildcards.
 * Rejects regex metacharacters that enable catastrophic backtracking.
 */
function makeSafePathRegex(pattern) {
  if (!pattern || pattern === ".*" || pattern === "*") return /.*/i;

  if (typeof pattern !== "string" || pattern.length > 200) {
    throw new Error("pathFilter must be a string ≤ 200 characters");
  }

  // Block metacharacters that cause ReDoS: nested quantifiers, groups, alternation
  if (/[+?{}()|\\[\]^$]/.test(pattern)) {
    throw new Error(
      "pathFilter only supports path text and * wildcards — e.g. /blog or /blog/*"
    );
  }

  // Convert * wildcard → .* (no nested quantifiers possible after this transform)
  const escaped = pattern.replace(/\./g, "\\.").replace(/\*/g, ".*");
  return new RegExp(escaped, "i");
}

// ---------------------------------------------------------------------------
app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------------------------------------------
// POST /api/scrape
// Body: { url: string, useApi?: boolean }
// ---------------------------------------------------------------------------
app.post("/api/scrape", async (req, res) => {
  const { url, useApi = false } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url (string) is required" });
  }

  try {
    const p = new URL(url);
    if (!["http:", "https:"].includes(p.protocol)) throw new Error();
  } catch {
    return res
      .status(400)
      .json({ error: "Invalid URL — must start with http:// or https://" });
  }

  if (await isPrivateHost(url)) {
    return res
      .status(403)
      .json({ error: "Requests to private or internal addresses are not allowed" });
  }

  console.log(`[scrape] ${url} (api=${useApi})`);

  try {
    const result = await scrapeUrl(url, useApi);
    res.json(result);
  } catch (err) {
    console.error(`[scrape] Error: ${err.message}`);
    const isBlocked = err.message.includes("403") || err.message.includes("blocked");
    res.status(500).json({
      error: "Scraping failed. The site may be blocking automated requests.",
      tip: isBlocked
        ? "Enable 'Use ScraperAPI' and supply SCRAPERAPI_KEY in .env."
        : undefined,
    });
  }
});

// ---------------------------------------------------------------------------
// POST /api/crawl
// Body: { url: string, pathFilter?: string, maxPages?: number, useApi?: boolean }
// ---------------------------------------------------------------------------
app.post("/api/crawl", async (req, res) => {
  const { url, pathFilter = ".*", maxPages = 5, useApi = false } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "url (string) is required" });
  }

  if (await isPrivateHost(url)) {
    return res
      .status(403)
      .json({ error: "Requests to private or internal addresses are not allowed" });
  }

  let re;
  try {
    re = makeSafePathRegex(pathFilter);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }

  // Validate maxPages: must be a positive integer (0 is not valid)
  const rawMax = Number(maxPages);
  const cap = Math.min(Number.isInteger(rawMax) && rawMax > 0 ? rawMax : 5, 20);

  console.log(`[crawl] root=${url} filter=${pathFilter} max=${cap}`);

  try {
    const results = await crawl(url, re, cap, useApi);
    res.json({ pages: results.length, results });
  } catch (err) {
    console.error(`[crawl] Error: ${err.message}`);
    res.status(500).json({ error: "Crawl failed. Please check the URL and try again." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/download?url=...&filename=...
// Proxy-downloads a remote asset so the browser can save it without CORS.
// ---------------------------------------------------------------------------
const MAX_DOWNLOAD_BYTES = 50 * 1024 * 1024; // 50 MB cap

app.get("/api/download", async (req, res) => {
  const { url, filename } = req.query;

  if (!url) return res.status(400).json({ error: "url query param required" });

  try {
    const p = new URL(url);
    if (!["http:", "https:"].includes(p.protocol)) throw new Error("bad protocol");
  } catch {
    return res.status(400).json({ error: "Invalid URL" });
  }

  if (await isPrivateHost(url)) {
    return res
      .status(403)
      .json({ error: "Requests to private or internal addresses are not allowed" });
  }

  try {
    const upstream = await axios.get(url, {
      responseType: "stream",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
          "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: new URL(url).origin,
      },
      timeout: 30_000,
      maxRedirects: 3,
      maxContentLength: MAX_DOWNLOAD_BYTES,
    });

    const ct = upstream.headers["content-type"] || "application/octet-stream";
    const cl = upstream.headers["content-length"];
    const name =
      filename ||
      decodeURIComponent(url.split("/").pop().split("?")[0]) ||
      "download";

    res.setHeader("Content-Type", ct);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(name)}"`
    );
    if (cl) res.setHeader("Content-Length", cl);

    upstream.data.on("error", (streamErr) => {
      console.error(`[download] stream error: ${streamErr.message}`);
      if (!res.headersSent) {
        res.status(502).json({ error: "Download stream failed. Please try again." });
      } else {
        res.destroy();
      }
    });
    upstream.data.pipe(res);
  } catch (err) {
    console.error(`[download] ${err.message}`);
    if (!res.headersSent) {
      res.status(502).json({ error: "Could not fetch the requested asset. Please try again." });
    }
  }
});

// ---------------------------------------------------------------------------
// Fallback: serve index.html for any unmatched GET
// ---------------------------------------------------------------------------
app.get("*", (_, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n  Scraper POC running at http://localhost:${PORT}\n`);
});
