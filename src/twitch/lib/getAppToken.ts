import axios from "axios";
import OAuthModel from "../../database/models/oauth";
import { Decrypt, Encrypt } from "../../utils/crypterTools";

export default async function getAppToken() {
  const token = await OAuthModel.findOne({}).lean().exec();
  if (token) {
    if (token.expires_at > new Date().getTime()) {
      return Decrypt(token.access_token);
    }
  }

  return await axios
    .post(
      `https://id.twitch.tv/oauth2/token`,
      {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_TOKEN,
        grant_type: "client_credentials",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      if (!res.data.access_token) throw new Error("Couldn't get access_token");

      OAuthModel.findOneAndUpdate(
        {},
        {
          $set: {
            access_token: Encrypt(res.data.access_token),
            expires_at: new Date().getTime() + res.data.expires_in * 1000,
          },
        },
        { upsert: true }
      )
        .lean()
        .exec();

      return res.data.access_token;
    })
    .catch(() => {
      throw new Error("Couldn't get access_token");
    });
}
