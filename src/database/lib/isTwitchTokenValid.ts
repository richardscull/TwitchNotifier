import axios from "axios";
import UserModel from "../models/users";
import { Decrypt, Encrypt } from "../../utils/crypterTools";

export default async function IsTwitchTokenValid(
  user_id: number
): Promise<boolean> {
  const user = await UserModel.findOne({ user_id }).lean().exec();
  if (!user || !user.token) return false;

  // Check if token is expired
  if (user.token && user.token.expires_at > new Date().getTime()) {
    // Validate token
    return await validateToken(user);
  } else {
    // Try to refresh token, if it's not expired
    return await refreshToken(user);
  }
}

export async function IsHasTwitchToken(user_id: number): Promise<boolean> {
  const user = await UserModel.findOne({ user_id }).lean().exec();
  if (!user || !user.token) return false;
  return true;
}

async function validateToken(user: any): Promise<boolean> {
  return await axios
    .get(`https://id.twitch.tv/oauth2/validate`, {
      headers: {
        Authorization: `OAuth ${Decrypt(user.token.access_token)}`,
      },
    })
    .then((res) => {
      if (res.status === 401) {
        return false;
      } else {
        return true;
      }
    });
}

async function refreshToken(user: any): Promise<boolean> {
  return await axios
    .post(
      `https://id.twitch.tv/oauth2/token`,
      {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_TOKEN,
        grant_type: "refresh_token",
        refresh_token: Decrypt(user.token.refresh_token),
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
    .then((res) => {
      if (!res.data.access_token) return false;
      return UserModel.findOneAndUpdate(
        { user_id: user.user_id },
        {
          $set: {
            token: {
              user_id: user.token.user_id,
              access_token: Encrypt(res.data.access_token),
              refresh_token: Encrypt(res.data.refresh_token),
              expires_at: new Date().getTime() + res.data.expires_in * 1000,
            },
          },
        }
      )
        .lean()
        .exec()
        .then(() => {
          return true;
        });
    })
    .catch(() => {
      return false;
    });
}
