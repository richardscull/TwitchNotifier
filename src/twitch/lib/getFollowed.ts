import axios from "axios";
import log from "../../utils/logger";

export default async function getFollowed(userId: string, userToken: string) {
  const streamers = [] as TwitchFollowedStreamer[];

  let cursor = "";
  let hasCursor = false;
  for (let firstRun = true; hasCursor || firstRun; firstRun = false) {
    await axios
      .get(`https://api.twitch.tv/helix/channels/followed`, {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
        params: {
          user_id: userId,
          after: cursor,
          first: 100,
        },
      })
      .then((res) => {
        cursor = res.data.pagination.cursor;
        hasCursor = !!cursor && cursor !== "";
        for (let i = 0; i < res.data.data.length; i++) {
          const streamer = res.data.data[i];
          streamers.push(streamer);
        }
      })
      .catch((err) => {
        log(err);
        hasCursor = false;
      });
  }

  return streamers;
}
