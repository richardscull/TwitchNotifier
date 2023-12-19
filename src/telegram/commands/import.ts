import { Message } from "node-telegram-bot-api";
import { Attributes, TelegramClient } from "../client";

module.exports = {
  regex: /import/,
  requireToken: true,
  execute(attr: Attributes, localizationFile: any, ctx: TelegramClient) {
    ctx.Reply(attr.message, "Hello, world!");
  },
};
