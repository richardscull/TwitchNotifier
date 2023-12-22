import { Attributes, TelegramClient } from "../client";

module.exports = {
  regex: /import/,
  requireToken: true,
  execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId } = attr;

    ctx.Reply(msg, {
      text: `[Hello, world!](https://t.me/TwitchNotifier_tBot?follow=richardscull)`,
    });
  },
};
