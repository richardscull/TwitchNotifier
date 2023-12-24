import axios from "axios";
import getAppToken from "./getAppToken";
import log from "../../utils/logger";

export default async function getUser(username: string) {
  const token = await getAppToken();

  return await axios
    .get(`https://api.twitch.tv/helix/users?login=${username}`, {
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((res) => {
      return res.data.data[0] as TwitchUserAttributes;
    })
    .catch((err) => {
      log(err);
    });
}
