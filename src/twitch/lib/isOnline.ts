import axios from "axios";

export default function isOnline(username: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const options = {
      url: `https://api.twitch.tv/helix/streams/${username}`,
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${process.env.TWITCH_CLIENT_TOKEN}`,
        Accept: "application/vnd.twitchtv.v5+json",
      },
    };

    axios
      .get(options.url, {
        headers: options.headers,
        params: { user_id: username, type: "live" },
      })
      .then((res) => {
        console.log(res.data);
        if (res.data.stream) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
}
