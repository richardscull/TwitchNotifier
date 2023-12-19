import { Message } from "node-telegram-bot-api";
import { TelegramClient } from "../client";

module.exports = {
  regex: /import/,
  requireToken: true,
  execute(msg: Message, localizationFile: any, ctx: TelegramClient) {
    ctx.Reply(msg, "Hello, world!");
  },
};
