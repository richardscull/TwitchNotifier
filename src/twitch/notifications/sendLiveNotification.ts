import NotificationModel from "../../database/models/notifications";
import UserModel from "../../database/models/users";
import Client from "../../telegram/client";

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
        const msg = await Client.sendMessage(
          user.user_id,
          `🔴 ${data.user_name} is now live!\n\n🎮 ${data.game_name}\n\n📜 ${data.title}\n\nhttps://twitch.tv/${data.user_name}`
          //TODO: CHANGE TEXT AND ADD BUTTONS
        );

        if (!msg) return;

        NotificationModel.create({
          user_id: user.user_id,
          message_id: msg.message_id,
          streamer_id: data.user_id,
        });
      });
    });
}
