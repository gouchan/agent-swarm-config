/**
 * scraper.js
 * Core extraction engine for the scraper POC.
 *
 * Extracts from any URL:
 *   - Images  (img src, srcset, CSS background-image, picture sources)
 *   - Fonts   (follows <link> stylesheets, parses @font-face rules)
 *   - Files   (PDFs, ZIPs, DOCs, XLSXs, and any downloadable asset)
 *   - Links   (internal + external, deduped)
 *   - Headings
 *   - Product/pricing blocks
 *
 * Two fetch modes:
 *   direct  — fetch the URL ourselves (works for static / non-JS pages)
 *   api     — delegate to ScraperAPI (set SCRAPERAPI_KEY in .env)
 */

import axios from "axios";
import * as cheerio from "cheerio";
import { URL } from "url";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.9",
};

const DOWNLOADABLE_EXTENSIONS = new Set([
  "pdf", "zip", "gz", "tar", "rar", "7z",
  "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "csv", "txt", "md",
  "mp3", "mp4", "wav", "mov", "avi",
  "svg", "eps", "ai", "psd", "sketch", "fig",
]);

const FONT_EXTENSIONS = new Set(["woff", "woff2", "ttf", "otf", "eot"]);

const IMAGE_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "avif", "svg", "ico", "bmp", "tiff",
]);

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

/**
 * Fetch HTML via ScraperAPI (handles JS-rendered / bot-protected sites).
 * GET https://api.scraperapi.com?api_key=KEY&url=TARGET&render=true
 */
async function fetchViaScraperApi(url) {
  const apiKey = process.env.SCRAPERAPI_KEY;
  if (!apiKey) throw new Error("SCRAPERAPI_KEY not set in environment");

  const res = await axios.get("https://api.scraperapi.com", {
    params: { api_key: apiKey, url, render: true },
    timeout: 60_000,
    maxContentLength: 10 * 1024 * 1024, // 10 MB cap
  });
  return res.data;
}

/**
 * Fetch HTML directly (works for static sites / server-rendered pages).
 */
async function fetchDirect(url, _hops = 0) {
  if (_hops > 3) throw new Error("Too many redirects");

  const res = await axios.get(url, {
    headers: DEFAULT_HEADERS,
    timeout: 20_000,
    maxRedirects: 0,              // manual redirect following so we can SSRF-check each hop
    maxContentLength: 10 * 1024 * 1024, // 10 MB cap
    validateStatus: (s) => s < 400 || (s >= 300 && s < 400),
  });

  // Follow redirects manually, validating each hop against private ranges
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.location;
    if (!location) throw new Error("Redirect with no Location header");
    const redirectUrl = new URL(location, url).toString();
    if (isPrivateHostSync(redirectUrl)) {
      throw new Error("Redirect to a private/internal address was blocked");
    }
    return fetchDirect(redirectUrl, _hops + 1);
  }

  return res.data;
}

/** Sync string-based private-host check used for redirect validation */
function isPrivateHostSync(urlStr) {
  try {
    const { hostname, protocol } = new URL(urlStr);
    if (!["http:", "https:"].includes(protocol)) return true;
    const h = hostname.replace(/^\[|\]$/g, "");
    if (/^(localhost|127\.|0\.0\.0\.0)/.test(h)) return true;
    if (/^10\./.test(h)) return true;
    if (/^172\.(1[6-9]|2[0-9]|3[01])\./.test(h)) return true;
    if (/^192\.168\./.test(h)) return true;
    if (/^169\.254\./.test(h)) return true;
    if (h === "::1" || /^fe[89ab]/i.test(h)) return true;
    if (h === "metadata.google.internal") return true;
    return false;
  } catch {
    return true;
  }
}

/**
 * Fetch a CSS file. Returns empty string on any error so we degrade gracefully.
 */
async function fetchCss(url) {
  try {
    const res = await axios.get(url, {
      headers: { ...DEFAULT_HEADERS, Accept: "text/css,*/*;q=0.1" },
      timeout: 10_000,
      maxRedirects: 3,
      maxContentLength: 2 * 1024 * 1024, // 2 MB cap for CSS files
    });
    return { css: res.data, finalUrl: res.request?.res?.responseUrl ?? url };
  } catch {
    return { css: "", finalUrl: url };
  }
}

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

function safeAbsolute(href, base) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function getExtension(url) {
  try {
    const pathname = new URL(url).pathname;
    const parts = pathname.split(".");
    if (parts.length < 2) return "";
    return parts.pop().toLowerCase().split("?")[0];
  } catch {
    return "";
  }
}

function dedupeBy(arr, key) {
  const seen = new Set();
  return arr.filter((item) => {
    const k = item[key];
    if (k == null) return true; // can't dedup items with no key — keep them all
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Image extraction
// ---------------------------------------------------------------------------

function extractImages(html, $, baseUrl) {
  const images = [];

  // <img src> and srcset
  $("img").each((_, el) => {
    const src = $(el).attr("src");
    const srcset = $(el).attr("srcset") || $(el).attr("data-srcset");
    const alt = $(el).attr("alt") || "";

    if (src) {
      const abs = safeAbsolute(src, baseUrl);
      if (abs) images.push({ src: abs, alt, source: "img" });
    }

    if (srcset) {
      parseSrcset(srcset, baseUrl).forEach((s) =>
        images.push({ src: s, alt, source: "img[srcset]" })
      );
    }
  });

  // <picture><source srcset>
  $("picture source").each((_, el) => {
    const srcset = $(el).attr("srcset");
    if (srcset) {
      parseSrcset(srcset, baseUrl).forEach((s) =>
        images.push({ src: s, alt: "", source: "picture>source" })
      );
    }
  });

  // Inline style background-image
  $("[style]").each((_, el) => {
    const style = $(el).attr("style") || "";
    extractBgImages(style, baseUrl).forEach((s) =>
      images.push({ src: s, alt: "", source: "inline-style" })
    );
  });

  // <meta og:image>
  $('meta[property="og:image"], meta[name="twitter:image"]').each((_, el) => {
    const content = $(el).attr("content");
    if (content) {
      const abs = safeAbsolute(content, baseUrl);
      if (abs) images.push({ src: abs, alt: "og:image", source: "og:image" });
    }
  });

  return dedupeBy(
    images.filter((i) => i.src),
    "src"
  );
}

function parseSrcset(srcset, base) {
  return srcset
    .split(",")
    .map((part) => {
      const [url] = part.trim().split(/\s+/);
      return safeAbsolute(url, base);
    })
    .filter(Boolean);
}

function extractBgImages(css, base) {
  const urls = [];
  const re = /url\(['"]?([^'")\s]+)['"]?\)/gi;
  let m;
  while ((m = re.exec(css)) !== null) {
    // Absolutize first — raw value may be relative (e.g. ../img/bg.png)
    const abs = safeAbsolute(m[1], base);
    if (!abs) continue;
    const ext = getExtension(abs);
    if (IMAGE_EXTENSIONS.has(ext)) urls.push(abs);
  }
  return urls;
}

// ---------------------------------------------------------------------------
// Font extraction
// ---------------------------------------------------------------------------

/**
 * Fetch all stylesheets (external + inline) once.
 * Returns an array of { css, base } objects consumed by font and image extractors.
 * Capped at 10 sheets to stay polite.
 */
async function fetchAllCss($, baseUrl) {
  const jobs = [];

  $('link[rel~="stylesheet"][href]').each((_, el) => {
    const abs = safeAbsolute($(el).attr("href"), baseUrl);
    if (abs) jobs.push({ url: abs, inline: false });
  });

  $("style").each((_, el) => {
    jobs.push({ css: $(el).text(), url: baseUrl, inline: true });
  });

  return Promise.all(
    jobs.slice(0, 10).map(async (job) => {
      if (job.inline) return { css: job.css, base: baseUrl };
      const { css, finalUrl } = await fetchCss(job.url);
      return { css, base: finalUrl };
    })
  );
}

function extractFontsFromCss(cssBlocks) {
  const fonts = [];
  for (const { css, base } of cssBlocks) {
    fonts.push(...parseFontFaces(css, base));
  }
  return dedupeBy(fonts, "key");
}

/**
 * Parse @font-face blocks from a CSS string.
 * Uses brace-counting instead of [^}]+ so nested braces don't truncate early.
 * Returns an array of font descriptor objects.
 */
function parseFontFaces(css, base) {
  const fonts = [];
  let i = 0;

  while (i < css.length) {
    const atIdx = css.indexOf("@font-face", i);
    if (atIdx === -1) break;

    const openBrace = css.indexOf("{", atIdx);
    if (openBrace === -1) break;

    // Match closing brace with depth counter
    let depth = 1;
    let j = openBrace + 1;
    while (j < css.length && depth > 0) {
      if (css[j] === "{") depth++;
      else if (css[j] === "}") depth--;
      j++;
    }

    const body = css.slice(openBrace + 1, j - 1);
    i = j;

    const family = extractCssProp(body, "font-family");
    const weight = extractCssProp(body, "font-weight") || "400";
    const style  = extractCssProp(body, "font-style")  || "normal";
    const src    = extractCssProp(body, "src");

    if (!src) continue;

    const sources = parseFontSrc(src, base);
    if (sources.length === 0) continue;

    // Best URL: prefer woff2 → woff → ttf → otf → eot
    const best = pickBestFontSource(sources);

    const familyClean = family?.replace(/['"]/g, "").trim() || "Unknown Font";

    fonts.push({
      family: familyClean,
      weight,
      style,
      sources,
      downloadUrl: best?.url ?? sources[0].url,
      format: best?.format ?? sources[0].format,
      key: `${familyClean}|${weight}|${style}`,
    });
  }

  return fonts;
}

function extractCssProp(css, prop) {
  const re = new RegExp(`${prop}\\s*:\\s*([^;]+)`, "i");
  const m = css.match(re);
  return m ? m[1].trim() : null;
}

function parseFontSrc(src, base) {
  const sources = [];
  const urlRe = /url\(['"]?([^'")\s]+)['"]?\)(?:\s+format\(['"]?([^'")\s]+)['"]?\))?/gi;
  let m;
  while ((m = urlRe.exec(src)) !== null) {
    const rawUrl = m[1];
    const hintFormat = m[2]?.toLowerCase();
    const abs = safeAbsolute(rawUrl, base);
    if (!abs) continue;

    const ext = getExtension(abs);
    if (!FONT_EXTENSIONS.has(ext)) continue;

    const format = hintFormat || ext;
    sources.push({ url: abs, format });
  }
  return sources;
}

function pickBestFontSource(sources) {
  const priority = ["woff2", "woff", "ttf", "otf", "eot"];
  for (const fmt of priority) {
    const found = sources.find((s) => s.format === fmt);
    if (found) return found;
  }
  return sources[0] ?? null;
}

// ---------------------------------------------------------------------------
// File / PDF extraction
// ---------------------------------------------------------------------------

// Keywords in link text / aria-label that strongly hint at a downloadable file
const DOWNLOAD_HINT_RE =
  /\b(pdf|download|report|whitepaper|white\s*paper|brochure|guide|ebook|e-book|spec|datasheet|data\s*sheet|form|application|invoice|receipt|manual|handbook|press\s*kit|media\s*kit|catalog|catalogue)\b/i;

function extractFiles($, baseUrl) {
  const files = [];

  function push(url, text, ext) {
    const abs = safeAbsolute(url, baseUrl);
    if (!abs) return;
    const resolvedExt = ext || getExtension(abs);
    files.push({
      url: abs,
      text: (text || "").trim().replace(/\s+/g, " ") || fileName(abs),
      type: resolvedExt.toUpperCase() || "FILE",
      ext: resolvedExt,
    });
  }

  // 1. <a href> — URL ends in a known extension
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const ext = getExtension(href);
    if (DOWNLOADABLE_EXTENSIONS.has(ext)) {
      push(href, $(el).text(), ext);
    }
  });

  // 2. <a href> — URL doesn't end in .pdf but link text / attributes hint at it
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    const ext = getExtension(href);
    if (DOWNLOADABLE_EXTENSIONS.has(ext)) return; // already captured above

    const text   = $(el).text().trim();
    const label  = $(el).attr("aria-label") || "";
    const title  = $(el).attr("title") || "";
    const dlAttr = $(el).attr("download");

    const isPdfHint =
      DOWNLOAD_HINT_RE.test(text) ||
      DOWNLOAD_HINT_RE.test(label) ||
      DOWNLOAD_HINT_RE.test(title) ||
      dlAttr !== undefined ||                      // has download= attribute
      /\.(pdf|docx?|xlsx?|pptx?)(\?|$)/i.test(href); // extension in query string

    if (isPdfHint) {
      // Guess type from URL path or hint keywords
      const guessedExt =
        /pdf/i.test(href + text + label) ? "pdf" :
        /doc/i.test(href + text + label) ? "docx" :
        /xls/i.test(href + text + label) ? "xlsx" : "";
      push(href, text || label || title, guessedExt);
    }
  });

  // 3. <iframe src>, <embed src>, <object data> — often used for inline PDFs
  $("iframe[src], embed[src], object[data]").each((_, el) => {
    const src = $(el).attr("src") || $(el).attr("data");
    if (!src) return;
    const ext = getExtension(src);
    if (ext === "pdf" || DOWNLOADABLE_EXTENSIONS.has(ext)) {
      const title = $(el).attr("title") || $(el).attr("name") || "";
      push(src, title, ext || "pdf");
    }
  });

  // 4. Inline <script> / data attributes — some React/Next sites embed file
  //    URLs as JSON in data-* props (e.g. data-file-url, data-pdf-url)
  $("[data-pdf-url], [data-file-url], [data-download-url], [data-href]").each((_, el) => {
    const url =
      $(el).attr("data-pdf-url") ||
      $(el).attr("data-file-url") ||
      $(el).attr("data-download-url") ||
      $(el).attr("data-href");
    if (url) {
      const ext = getExtension(url);
      push(url, $(el).text().trim(), ext || "pdf");
    }
  });

  return dedupeBy(files, "url");
}

function fileName(url) {
  try {
    return decodeURIComponent(new URL(url).pathname.split("/").pop()) || url;
  } catch {
    return url;
  }
}

// ---------------------------------------------------------------------------
// Link extraction
// ---------------------------------------------------------------------------

function extractLinks($, baseUrl) {
  const base = new URL(baseUrl);
  const internal = [];
  const external = [];

  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:") || href === "#")
      return;

    const abs = safeAbsolute(href, baseUrl);
    if (!abs) return;

    const parsed = new URL(abs);
    const text = $(el).text().trim().replace(/\s+/g, " ").slice(0, 80);
    const link = { href: abs.split("#")[0], text };

    if (parsed.hostname === base.hostname) internal.push(link);
    else external.push(link);
  });

  return {
    internal: dedupeBy(internal, "href"),
    external: dedupeBy(external, "href"),
  };
}

// ---------------------------------------------------------------------------
// Headings extraction
// ---------------------------------------------------------------------------

function extractHeadings($) {
  const headings = [];
  // Single combined selector preserves document order (not grouped by tag)
  $("h1, h2, h3, h4").each((_, el) => {
    const text = $(el).text().trim().replace(/\s+/g, " ");
    if (text) headings.push({ level: el.name, text });
  });
  return headings;
}

// ---------------------------------------------------------------------------
// Product / pricing block extraction
// ---------------------------------------------------------------------------

function extractProductBlocks($, baseUrl) {
  const blocks = [];
  const priceRe = /(?:AU\$|USD?\$|\$|€|£|¥)\s?\d[\d,]*(?:\.\d{2})?/gi;

  // Check sections, articles, divs with class hints
  const selectors = [
    "section",
    "article",
    '[class*="product"]',
    '[class*="card"]',
    '[class*="price"]',
    '[class*="item"]',
  ];

  const seen = new Set();

  selectors.forEach((sel) => {
    $(sel).each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, " ");
      if (!text || seen.has(text.slice(0, 80))) return;

      const priceMatches = text.match(priceRe);
      if (!priceMatches) return;

      seen.add(text.slice(0, 80));

      // Grab any image inside the block
      const imgEl = $(el).find("img[src]").first();
      const imgSrc = imgEl.length
        ? safeAbsolute(imgEl.attr("src"), baseUrl)
        : null;

      // Grab heading inside block
      const heading = $(el).find("h1,h2,h3,h4,h5").first().text().trim();

      blocks.push({
        heading: heading || "",
        prices: [...new Set(priceMatches)],
        image: imgSrc,
        snippet: text.slice(0, 400),
      });
    });
  });

  return blocks.slice(0, 30); // cap for demo
}

// ---------------------------------------------------------------------------
// CSS background-image sweep — uses pre-fetched CSS blocks (no double-fetch)
// ---------------------------------------------------------------------------

function extractCssBgImagesFromCss(cssBlocks) {
  const images = [];
  for (const { css, base } of cssBlocks) {
    for (const url of extractBgImages(css, base)) {
      images.push({ src: url, alt: "", source: "css-background" });
    }
  }
  return images;
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Scrape a URL and return a structured result object.
 *
 * @param {string} url       - Target URL
 * @param {boolean} useApi   - true = use ScraperAPI, false = direct fetch
 * @returns {Promise<object>}
 */
export async function scrapeUrl(url, useApi = false) {
  const html = useApi ? await fetchViaScraperApi(url) : await fetchDirect(url);

  const $ = cheerio.load(html);
  const title = $("title").text().trim().replace(/\s+/g, " ");
  const description =
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    "";

  // Fetch all stylesheets once, then extract fonts and CSS bg-images from them
  const cssBlocks = await fetchAllCss($, url);
  const fonts = extractFontsFromCss(cssBlocks);
  const cssBgImages = extractCssBgImagesFromCss(cssBlocks);

  const imgsDirect = extractImages(html, $, url);
  const allImages = dedupeBy([...imgsDirect, ...cssBgImages], "src");

  const { internal: internalLinks, external: externalLinks } = extractLinks(
    $,
    url
  );
  const files = extractFiles($, url);
  const headings = extractHeadings($);
  const productBlocks = extractProductBlocks($, url);

  return {
    meta: {
      url,
      title,
      description,
      scrapedAt: new Date().toISOString(),
      mode: useApi ? "scraperapi" : "direct",
    },
    summary: {
      images: allImages.length,
      fonts: fonts.length,
      files: files.length,
      internalLinks: internalLinks.length,
      externalLinks: externalLinks.length,
      productBlocks: productBlocks.length,
      headings: headings.length,
    },
    images: allImages,
    fonts,
    files,
    links: { internal: internalLinks, external: externalLinks },
    headings,
    productBlocks,
  };
}

/**
 * Multi-page crawl: start at rootUrl, follow internal links that match
 * pathFilter, up to maxPages pages.
 *
 * @param {string}   rootUrl    - Starting URL
 * @param {RegExp}   pathFilter - Only follow links whose pathname matches
 * @param {number}   maxPages   - Maximum pages to visit
 * @param {boolean}  useApi
 */
export async function crawl(
  rootUrl,
  pathFilter = /.*/,
  maxPages = 10,
  useApi = false
) {
  const queue = [rootUrl];
  const visited = new Set();
  const queued = new Set([rootUrl]); // tracks what's already in the queue (O(1) lookup)
  const results = [];

  while (queue.length > 0 && visited.size < maxPages) {
    const url = queue.shift();
    if (visited.has(url)) continue;
    visited.add(url);

    console.log(`[crawl] Scraping (${visited.size}/${maxPages}): ${url}`);

    try {
      const data = await scrapeUrl(url, useApi);
      results.push(data);

      // Enqueue matching internal links not yet visited
      for (const link of data.links.internal) {
        if (!visited.has(link.href) && !queued.has(link.href)) {
          try {
            const pathname = new URL(link.href).pathname;
            if (pathFilter.test(pathname)) {
              queued.add(link.href);
              queue.push(link.href);
            }
          } catch {
            // skip malformed
          }
        }
      }
    } catch (err) {
      console.error(`[crawl] Failed ${url}: ${err.message}`);
      results.push({ error: err.message, url });
    }

    // Polite delay between pages
    if (queue.length > 0) await sleep(800);
  }

  return results;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
