import axios from "axios";
import getAppToken from "./getAppToken";
import { log } from "console";

export default async function isOnline(ids: string[]) {
  const options = {
    url: `https://api.twitch.tv/helix/streams`,
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${await getAppToken()}`,
      Accept: "application/vnd.twitchtv.v5+json",
    },
  };

  const params = new URLSearchParams({ first: "100", type: "live" });

  ids.forEach((id) => params.append("user_id", id));

  return await axios
    .get(options.url, {
      headers: options.headers,
      params: params,
    })
    .then((res) => {
      const resArray = [...res.data.data];
      const resObject: { [key: string]: StreamStatus } = {};

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const stream = resArray.find((stream) => stream.user_id === id);
        if (stream) {
          resObject[id] = { isOnline: true, data: stream };
        } else {
          resObject[id] = { isOnline: false, data: undefined };
        }
      }

      return resObject;
    })
    .catch((err) => {
      log(err);
      return {} as { [key: string]: StreamStatus };
    });
}
