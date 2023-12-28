import UpdateStreamerQuery from "../database/lib/updateStreamerQuery";
import StreamerModel from "../database/models/streamers";
import log from "../utils/logger";
import isOnline from "./lib/getStreamStatus";
import SendLiveNotification from "./notifications/sendLiveNotification";
import UpdateLiveNotification from "./notifications/updateLiveNotification";

const updateStreamers = async () => {
  return setInterval(
    async () => {
      const streamers = await StreamerModel.find({}).lean().exec();

      // Split streamers into packs of 100 to avoid Twitch API limit
      const PacksOf100 = streamers.reduce((acc, streamer, i) => {
        const index = Math.floor(i / 100);
        acc[index] = [...(acc[index] || []), streamer.id.toString()];
        return acc;
      }, [] as string[][]);

      // Check who is online for each pack
      PacksOf100.forEach((pack) => {
        isOnline(pack).then((res) => {
          for (const id in res as { [key: string]: StreamStatus }) {
            const { isOnline, data } = res[id];

            const isStatusChanged =
              isOnline !==
              streamers.find((s) => s.id.toString() === id)?.isOnline;

            Promise.all([UpdateStreamerQuery(Number(id), data)]).then(
              ([oldData]) => {
                if (!isStatusChanged) return;

                if (isOnline) {
                  SendLiveNotification(data);
                } else {
                  UpdateLiveNotification(isOnline, {
                    user_id: oldData?.id.toString(),
                    user_login: oldData?.username,
                    started_at: oldData?.startedAt,
                    viewer_count: oldData?.viewers,
                  } as any);
                }
              }
            );
          }
        });
      });

      log("Checks who is online...");
    },
    /// 1000 * 60 // 1 minute
    1000 * 5 // 5 seconds FOR TESTING
  );
};

export default updateStreamers();
