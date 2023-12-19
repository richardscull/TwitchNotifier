import { Message } from "node-telegram-bot-api";
import { Attributes, TelegramClient } from "../client";
import IsTwitchTokenValid from "../../database/lib/isTwitchTokenValid";
import CreateLoginRequest from "../../database/lib/createLoginRequest";
import log from "../../utils/logger";

const { HOST_URI } = process.env;

module.exports = {
  regex: /login/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any, ctx: TelegramClient) {
    if ((await IsTwitchTokenValid(attr.message.from?.id!)) === false) {
      const state = await CreateLoginRequest(attr.message.from?.id!);
      if (!state) {
        log("Error while creating login request!");
        return ctx.Reply(attr.message, `🚨 ${localizationFile["errors"]["error"]}`);
      }

      ctx.Reply(attr.message, localizationFile["commands"]["login"]["login_link"], {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: localizationFile["commands"]["login"]["login"],
                url: `${HOST_URI}/auth/twitch?state=${state}`,
              },
            ],
          ],
        },
        includelocalhost: true,
      });
    } else {
      ctx.Reply(
        attr.message,
        localizationFile["commands"]["login"]["already_logged_in"]
      );
    }
  },
};
