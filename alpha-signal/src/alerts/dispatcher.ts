import type { Api } from "grammy";

let botApi: Api | null = null;

export function setDispatcherApi(api: Api): void {
  botApi = api;
}

export async function sendAlert(chatId: string, message: string): Promise<void> {
  if (!botApi) {
    console.error("Dispatcher: bot API not initialized");
    return;
  }

  try {
    await botApi.sendMessage(chatId, message, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  } catch (err) {
    console.error(`Failed to send alert to ${chatId}:`, err);
  }
}

export async function broadcastAlert(chatIds: string[], message: string): Promise<void> {
  await Promise.allSettled(chatIds.map((id) => sendAlert(id, message)));
}
