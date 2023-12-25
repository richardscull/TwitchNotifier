import TelegramBot from "node-telegram-bot-api";
import NotificationModel from "../../database/models/notifications";
import Client from "../../telegram/client";
import {
  GetLocalizationByUserId,
  GetLocalizationFile,
} from "../../utils/localization";
import { getDuration } from "../../utils/formatDuration";

export default async function UpdateLiveNotification(
  isOnline: boolean,
  data: TwitchStreamAttributes
) {
  await NotificationModel.find({
    streamer_id: data.user_id,
  })
    .lean()
    .exec()
    .then((notifications) => {
      notifications.forEach(async (notification) => {
        const localizationFile = await GetLocalizationFile(
          Number(notification.user_id)
        );

        const localization = await GetLocalizationByUserId(
          Number(notification.user_id)
        );

        const defaultOptions = {
          parse_mode: "Markdown" as TelegramBot.ParseMode,
          chat_id: notification.user_id,
          message_id: notification.message_id,
        };

        const button = {
          text: localizationFile["embeds"]["stream_is_live"]["watch_button"],
          url: `https://twitch.tv/${data.user_login}`,
        };

        if (isOnline) {
          // ! Probably need to deprecate, because we doesnt update message, only if stream is offline
          await Client.editMessageText(
            localizationFile["embeds"]["stream_is_live"]["text"]
              .replace("%live_emoji%", "🔴")
              .replace("%streamer%", data.user_login)
              .replace("%url%", `https://twitch.tv/${data.user_login}`)
              .replace("%title%", data.title)
              .replace("%game%", data.game_name),
            {
              reply_markup: {
                inline_keyboard: [[button]],
              },
              ...defaultOptions,
            }
          );
        } else {
          const streamStartedAt = (Date.now() - Number(data.started_at)) / 1000;

          await Client.editMessageText(
            localizationFile["embeds"]["stream_is_offline"]["text"]
              .replace("%streamer%", data.user_login)
              .replace("%url%", `https://twitch.tv/${data.user_login}`)
              .replace(
                "%duration%",
                getDuration(streamStartedAt, localization as any)
              ),
            defaultOptions
          );

          NotificationModel.findOneAndDelete({
            user_id: notification.user_id,
            streamer_id: notification.streamer_id,
          })
            .lean()
            .exec();
        }
      });
    });
}
