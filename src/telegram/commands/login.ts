import { Attributes, TelegramClient } from "../client";
import IsTwitchTokenValid from "../../database/lib/isTwitchTokenValid";
import CreateLoginRequest from "../../database/lib/createLoginRequest";
import log from "../../utils/logger";

const { HOST_URI } = process.env;

module.exports = {
  regex: /login/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId } = attr;

    if ((await IsTwitchTokenValid(userId)) === false) {
      const state = await CreateLoginRequest(userId);
      if (!state) {
        log("Error while creating login request!");
        return ctx.Reply(msg, `🚨 ${localizationFile["errors"]["error"]}`);
      }

      ctx.Reply(msg, localizationFile["commands"]["login"]["login_link"], {
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
        msg,
        localizationFile["commands"]["login"]["already_logged_in"]
      );
    }
  },
};
