/** Simple in-memory IP-based rate limiter for Next.js API routes */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const hits = new Map<string, RateLimitEntry>();

/**
 * Returns true if the request is allowed, false if rate-limited.
 * @param ip     Caller's IP address (use "unknown" as fallback)
 * @param max    Max requests per window
 * @param windowMs  Window duration in milliseconds
 */
export function rateLimit(ip: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = hits.get(ip);

  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= max) return false;

  entry.count++;
  return true;
}

/** Extract caller IP from a Next.js request */
export function getIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}
