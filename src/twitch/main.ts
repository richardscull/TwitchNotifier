import StreamerModel from "../database/models/streamers";
import log from "../utils/logger";
import isOnline from "./lib/isOnline";

(async () => {
  return setInterval(
    async () => {
      const streamers = await StreamerModel.find({}).lean().exec();

      streamers.forEach((streamer) => {
        isOnline(streamer.username).then((isOnline) => {
          if (isOnline) {
            console.log(streamer.username + " is online");
          }
        });
      });
      console.log("CheckWhoOnline");
    },
    //1000 * 60 // 1 minute
    1000 * 5 // 5 seconds FOR TESTING
  );
})();
