import NotificationModel from "../../database/models/notifications";
import UserModel from "../../database/models/users";
import Client from "../../telegram/client";
import { GetLocalizationFile } from "../../utils/localization";
import log from "../../utils/logger";

export default async function SendLiveNotification(
  data: TwitchStreamAttributes
) {
  await UserModel.find({
    streamers: { $in: [data.user_id] },
  })
    .lean()
    .exec()
    .then((users) => {
      users.forEach(async (user) => {
        const localizationFile = await GetLocalizationFile(
          Number(user.user_id)
        );

        const button = {
          text: localizationFile["embeds"]["stream_is_live"]["watch_button"],
          url: `https://twitch.tv/${data.user_name}`,
        };

        const msg = await Client.sendMessage(
          user.user_id,
          localizationFile["embeds"]["stream_is_live"]["text"]
            .replace("%streamer%", data.user_name)
            .replace("%url%", `https://twitch.tv/${data.user_login}`)
            .replace("%title%", data.title)
            .replace("%game%", data.game_name),
          {
            reply_markup: {
              inline_keyboard: [[button]],
            },
            parse_mode: "Markdown",
          }
        );

        if (!msg)
          return log(
            `Couldn't send message to ${user.user_id}, probably blocked the bot`
          );

        NotificationModel.create({
          user_id: user.user_id,
          message_id: msg.message_id,
          streamer_id: data.user_id,
        });
      });
    });
}
