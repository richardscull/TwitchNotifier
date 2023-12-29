import UserModel from "../database/models/users";
import log from "./logger";

export async function GetLocalizationByUserId(
  user_id: number
): Promise<string> {
  log("🔎 Finding user by user_id: " + user_id);
  return await UserModel.findOne({ user_id })
    .lean()
    .exec()
    .then((user) => {
      return user?.localization || "english";
    });
}

export async function GetLocalizationFile(user_id: number): Promise<any> {
  const localization = (await GetLocalizationByUserId(user_id)) || "english";

  return import(`../../localization/${localization}.json`).then(
    (file) => {
      return file;
    },
    (err) => {
      throw new Error("🚨 Error finding localization file: " + err);
    }
  );
}
