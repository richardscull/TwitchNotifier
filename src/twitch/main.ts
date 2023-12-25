import UpdateStreamerQuery from "../database/lib/updateStreamerQuery";
import StreamerModel from "../database/models/streamers";
import log from "../utils/logger";
import isOnline from "./lib/isOnline";
import SendLiveNotification from "./notifications/sendLiveNotification";
import UpdateLiveNotification from "./notifications/updateLiveNotification";

const updateStreamers = async () => {
  return setInterval(
    async () => {
      const streamers = await StreamerModel.find({}).lean().exec();

      streamers.forEach((streamer) => {
        isOnline({ id: streamer.id }).then((res) => {
          if (!res)
            return log(
              `Couldn't get isOnline response for ${streamer.username}}`
            );

          const { isOnline, data } = res;
          const isStatusChanged = isOnline !== streamer.isOnline;

          Promise.all([UpdateStreamerQuery(streamer.id, data)]).then(
            ([oldData]) => {
              if (!oldData)
                return log("Couldn't find streamer on updateStreamers");

              if (isStatusChanged) {
                if (isOnline) {
                  SendLiveNotification(data);
                } else {
                  UpdateLiveNotification(isOnline, {
                    user_id: oldData.id.toString(),
                    user_login: oldData.username,
                    started_at: oldData.startedAt,
                  } as any);
                }
              }
            }
          );
        });
      });
      log("Checks who is online...");
    },
    //1000 * 60 // 1 minute
    1000 * 5 // 5 seconds FOR TESTING
  );
};

export default updateStreamers();
