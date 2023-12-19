import { Message } from "node-telegram-bot-api";
import { TelegramClient } from "../client";

module.exports = {
  regex: /start/,
  execute(msg: Message, ctx: TelegramClient) {
    ctx.Reply(msg, "Hello, world!", );
  },
};
