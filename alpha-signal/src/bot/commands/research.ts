import type { Context } from "grammy";
import { searchTwitter, formatTweetTelegram } from "../../data/twitter/client.js";
import { escapeHtml } from "../../utils/format.js";

export async function researchCommand(ctx: Context): Promise<void> {
  const text = ctx.message?.text ?? "";
  const query = text.replace(/^\/research\s*/i, "").trim();

  if (!query) {
    await ctx.reply("Usage: /research <query>\nExample: /research Bitcoin ETF approval");
    return;
  }

  const chatId = ctx.chat?.id;
  if (!chatId) return;

  const thinking = await ctx.reply(`🔍 Searching X for "${escapeHtml(query)}"...`);

  try {
    const result = await searchTwitter(query, { sort: "likes", limit: 5, quick: true });

    if (result.tweets.length === 0) {
      await ctx.api.editMessageText(
        chatId,
        thinking.message_id,
        `No tweets found for "${escapeHtml(query)}". Try a broader search term.`
      ).catch(() => {});
      return;
    }

    const header = `<b>🐦 X Research: "${escapeHtml(query)}"</b>\n${result.tweets.length} results\n`;
    const body = result.tweets.map(formatTweetTelegram).join("\n\n");

    await ctx.api.editMessageText(chatId, thinking.message_id, header + "\n" + body, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    }).catch(() => {});
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await ctx.api.editMessageText(
      chatId,
      thinking.message_id,
      `Research failed: ${escapeHtml(message)}\n\nMake sure X_BEARER_TOKEN is set or x-research is installed.`
    ).catch(() => {});
  }
}
