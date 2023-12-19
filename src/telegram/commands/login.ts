import { Message } from "node-telegram-bot-api";
import { TelegramClient } from "../client";
import IsTwitchTokenValid from "../../database/lib/isTwitchTokenValid";
import CreateLoginRequest from "../../database/lib/createLoginRequest";
import log from "../../utils/logger";

const { HOST_URI } = process.env;

module.exports = {
  regex: /login/,
  async execute(msg: Message, ctx: TelegramClient) {
    if ((await IsTwitchTokenValid(msg.from?.id!)) === false) {
      const state = await CreateLoginRequest(msg.from?.id!);
      if (!state) {
        log("Error while creating login request!");
        return ctx.Reply(msg, "🚨 An error occured!");
      }

      ctx.Reply(msg, `Please login with this link below!`, {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Login",
                url: `${HOST_URI}/auth/twitch?state=${state}`,
              },
            ],
          ],
        },
        includelocalhost: true,
      });
    } else {
      ctx.Reply(msg, "You are already logged in! 🚀");
    }
  },
};
