import { TelegramClient } from "../client";

export function SendNotification(
  user_id: string,
  message: string,
  ctx: TelegramClient
) {
  ctx.sendMessage(user_id, message);
}
