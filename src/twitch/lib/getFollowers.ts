import axios from "axios";
import getAppToken from "./getAppToken";
import log from "../../utils/logger";

export default async function getFollowers(streamerId: string) {
  const token = await getAppToken();

  return await axios
    .get(
      `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${streamerId}`,
      {
        headers: {
          "Client-ID": process.env.TWITCH_CLIENT_ID,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      return res.data.total;
    })
    .catch((err) => {
      log(err);
    });
}
