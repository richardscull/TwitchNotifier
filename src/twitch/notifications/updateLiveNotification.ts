import NotificationModel from "../../database/models/notifications";
import UserModel from "../../database/models/users";
import Client from "../../telegram/client";

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
        if (isOnline) {
          const msg = await Client.editMessageText(
            `🔴 ${data.user_name} is now live!\n\n🎮 ${data.game_name}\n\n📜 ${data.title}\n\nhttps://twitch.tv/${data.user_name}`,
            //TODO: CHANGE TEXT AND ADD BUTTONS
            {
              chat_id: notification.user_id,
              message_id: notification.message_id,
            }
          );
        } else {
          const msg = await Client.editMessageText(
            `🔴 ${
              data.user_name
            } has ended the stream!\n\nHe streamed for ${Math.floor(
              (Date.now() - Number(data.started_at)) / 1000 / 60
            )} minutes\n\nhttps://twitch.tv/${data.user_name}`,
            {
              chat_id: notification.user_id,
              message_id: notification.message_id,
            }
          ); //TODO: CHANGE TEXT AND ADD BUTTONS

          if (!msg) return;

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
