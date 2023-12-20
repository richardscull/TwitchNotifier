import { Attributes, TelegramClient } from "../client";
import { IsHasTwitchToken } from "../../database/lib/isTwitchTokenValid";

module.exports = {
  regex: /logout/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId } = attr;

    if ((await IsHasTwitchToken(userId)) === false)
      ctx.Reply(
        msg,
        localizationFile["commands"]["logout"]["already_logged_out"]
      );

    const buttons = [
      {
        text: `✅ ${localizationFile["commands"]["logout"]["logout"]}`,
        callback_data: "confirm",
      },
      {
        text: `❌ ${localizationFile["commands"]["logout"]["changed_mind"]}`,
        callback_data: "cancel",
      },
    ];

    ctx.Reply(msg, localizationFile["commands"]["logout"]["are_you_sure"], {
      reply_markup: {
        inline_keyboard: [ctx.LinkButtons("logout", buttons)],
      },
    });
  },
};

module.exports.confirm = (attr: Attributes, localizationFile: any) => {
  const { ctx, msg } = attr;

  //todo: handle logout!

  ctx.EditMessage(msg, localizationFile["commands"]["logout"]["logged_out"]);
};

module.exports.cancel = (attr: Attributes, localizationFile: any) => {
  const { ctx, msg } = attr;

  ctx.EditMessage(msg, localizationFile["commands"]["logout"]["cancelled"]);
};
