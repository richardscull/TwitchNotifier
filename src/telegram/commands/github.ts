import { Attributes, TelegramClient } from "../client";

module.exports = {
  regex: /^\/github$/,
  requireToken: false,
  execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId } = attr;

    const button = {
      text: localizationFile["commands"]["github"]["repository"],
      url: localizationFile["commands"]["github"]["github_link"],
    };

    ctx.Reply(msg, {
      text: localizationFile["commands"]["github"]["text"],
      image: "./assets/random_girl.png",
      options: {
        reply_markup: {
          inline_keyboard: [[button]],
        },
      },
    });
  },
};
