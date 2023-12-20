import UserModel from "../models/users";

export default async function IsTwitchTokenValid(
  user_id: number
): Promise<boolean> {
  const user = await UserModel.findOne({ user_id }).lean().exec();
  if (!user || !user.token) return false;

  // Check if token is expired
  if (user.token && user.token.expires_at > new Date().getTime()) {
    return true;
  } else {
    return false;
  }
}

export async function IsHasTwitchToken(user_id: number): Promise<boolean> {
  const user = await UserModel.findOne({ user_id }).lean().exec();
  if (!user || !user.token) return false;
  return true;
}
