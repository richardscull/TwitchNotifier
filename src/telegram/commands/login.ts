import { Attributes } from "../client";
import IsTwitchTokenValid from "../../database/lib/isTwitchTokenValid";
import CreateLoginRequest from "../../database/lib/createLoginRequest";
import log from "../../utils/logger";
import { BRANCH } from "../..";

const { HOST_URI } = process.env;

module.exports = {
  regex: /^\/login$/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId } = attr;

    if ((await IsTwitchTokenValid(userId)) === false) {
      const state = await CreateLoginRequest(userId);
      if (!state) {
        log("Error while creating login request!");
        return ctx.Reply(msg, {
          text: `🚨 ${localizationFile["errors"]["error"]}`,
        });
      }

      const loginLink = `${HOST_URI}/auth/twitch?state=${state}`;

      const button = {
        text: localizationFile["commands"]["login"]["login"],
        url: loginLink,
      };

      ctx.Reply(msg, {
        text:
          localizationFile["commands"]["login"]["login_link"] +
          `${(BRANCH == "DEV" && `\n\n🔗: ${loginLink}`) || ""}`,
        options: {
          reply_markup:
            (BRANCH == "PROD" && { inline_keyboard: [[button]] }) || undefined,
          includelocalhost: true, // ! Maybe should be removed
        },
      });
    } else {
      ctx.Reply(msg, {
        text: localizationFile["commands"]["login"]["already_logged_in"],
      });
    }
  },
};
