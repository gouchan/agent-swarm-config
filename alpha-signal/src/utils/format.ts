/**
 * Escape text for Telegram HTML parse mode.
 * Escapes &, <, >, and " to prevent HTML injection.
 */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Strip all HTML tags from text (for sanitizing LLM output).
 * Preserves the text content between tags.
 */
export function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize LLM output for safe embedding in Telegram HTML messages.
 * Strips any HTML the model may have generated, then escapes for safety.
 */
export function sanitizeLlmOutput(text: string): string {
  return escapeHtml(stripHtml(text));
}

/**
 * Compact large numbers: 1500 → "1.5K", 2300000 → "2.3M"
 */
export function compactNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}
