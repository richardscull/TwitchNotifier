import axios from "axios";
import getAppToken from "./getAppToken";

interface Params {
  username?: string;
  id?: string | number;
}

export default async function isOnline(params: Params) {
  if (!params.username && !params.id)
    throw new Error("No username or id provided");

  const { username, id } = params;

  const options = {
    url: `https://api.twitch.tv/helix/streams`,
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${await getAppToken()}`,
      Accept: "application/vnd.twitchtv.v5+json",
    },
  };

  return await axios
    .get(options.url, {
      headers: options.headers,
      params: { user_id: id, user_login: username, type: "live" },
    })
    .then((res) => {
      if (res.data.data[0]) {
        return { isOnline: true, data: res.data.data[0] };
      } else {
        return { isOnline: false, data: undefined };
      }
    })
    .catch((err) => {
      console.log(err);
    });
}
