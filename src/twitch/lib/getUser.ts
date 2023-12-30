import axios from "axios";
import getAppToken from "./getAppToken";
import log from "../../utils/logger";

interface Attributes {
  username?: string;
  user_id?: string;
}

export interface ResultAttributes {
  username?: string;
  user_id?: string;
  data: TwitchUserAttributes | undefined;
}

export default async function getUser(attr: Attributes[], userToken?: string) {
  const options = {
    url: `https://api.twitch.tv/helix/users`,
    headers: {
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Authorization: `Bearer ${userToken || (await getAppToken())}`,
      "Content-Type": "application/json",
    },
  };

  const params = new URLSearchParams({});

  attr.forEach((user) => {
    const { username, user_id } = user;
    username ? params.append("login", username) : null;
    user_id ? params.append("id", user_id) : null;
  });

  return await axios
    .get(options.url, {
      headers: options.headers,
      params: params,
    })
    .then(async (res) => {
      // If userToken is provided, we are looking for our own user.
      if (userToken) return [{ data: res.data.data[0] }] as ResultAttributes[];

      const resArray = [...res.data.data];
      const returnArray = [] as ResultAttributes[];

      for (let i = 0; i < attr.length; i++) {
        const { username, user_id } = attr[i];
        const userData = resArray.find(
          (user) => user.login === username || user.id === user_id
        );

        if (!username && !user_id) log("No username or user_id provided");

        returnArray.push({ username, user_id, data: userData });
      }

      // If we found all users, return them
      const undefinedChannels = returnArray.filter((user) => !user.data);
      if (undefinedChannels.length == 0) return returnArray;

      returnArray.splice(
        returnArray.findIndex((user) => !user.data),
        undefinedChannels.length
      );

      // If we didn't find all users, try to find them by their broadcaster_id (Works for banned users)
      const params = new URLSearchParams({});
      undefinedChannels.forEach((user) => {
        const { user_id } = user;
        user_id ? params.append("broadcaster_id", user_id) : null;
      });

      return await axios
        .get("https://api.twitch.tv/helix/channels", {
          headers: {
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            Authorization: `Bearer ${await getAppToken()}`,
            "Content-Type": "application/json",
          },
          params: params,
        })
        .then((res) => {
          const resArray = [...res.data.data];

          for (let i = 0; i < undefinedChannels.length; i++) {
            const { username, user_id } = undefinedChannels[i];
            const userData = resArray.find(
              (user) =>
                user.broadcaster_login === username ||
                user.broadcaster_id === user_id
            );

            if (!username && !user_id) log("No username or user_id provided");

            returnArray.push({
              username,
              user_id,
              data: broadcasterToChannel(userData),
            });
          }
          return returnArray;
        })
        .catch((err) => {
          log(err);
          return [{ data: undefined }] as ResultAttributes[];
        });
    })
    .catch((err) => {
      log(err);
      return [{ data: undefined }] as ResultAttributes[];
    });
}

function broadcasterToChannel(data: any) {
  return {
    id: data.broadcaster_id,
    login: data.broadcaster_login,
    display_name: data.broadcaster_name,
    type: "",
    broadcaster_type: "",
    description: "",
    profile_image_url: "",
    offline_image_url: "",
    view_count: 0,
    created_at: "",
  };
}
