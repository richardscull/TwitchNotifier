import log from "../../utils/logger";
import UserModel from "../models/users";

export default async function CreateUserQuery(user_id: number) {
  return await UserModel.create({
    user_id,
    is_active: true,
    localization: "english",
    streamers: [],
  }).then(
    (user) => {
      log("📑 Created user: " + user_id);
      return user;
    },
    (err) => {
      throw new Error("🚨 Error creating user: " + err);
    }
  );
}
