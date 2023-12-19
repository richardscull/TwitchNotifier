import UserModel from "../models/users";
import crypto from "crypto";

export default async function CreateLoginRequest(
  user_id: number
): Promise<string | undefined> {
  const user = await UserModel.findOne({ user_id }).lean().exec();

  if (!user) return undefined;

  if (
    !user.login_request ||
    user.login_request.expires_at < new Date().getTime()
  ) {
    const state = crypto
      .createHash("sha256")
      .update(`${user_id.toString()}.${new Date().getTime().toString()}`)
      .digest("hex");

    return Promise.all([
      UserModel.findOneAndUpdate(
        { user_id },
        {
          $set: {
            login_request: {
              state: state,
              expires_at: new Date().getTime() + 60000,
            },
          },
        }
      )
        .lean()
        .exec(),
    ]).then(() => {
      return state;
    });
  } else {
    return user.login_request.state;
  }
}
