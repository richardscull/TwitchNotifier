import UserModel from "../database/models/users";

export async function GetLocalizationByUserId(
  user_id: number 
): Promise<string> {
  return await UserModel.findOne({ user_id })
    .lean()
    .exec()
    .then(
      (user) => {
        if (!user) throw new Error("🚨 User not found");
        return user.localization || "english";
      },
      (err) => {
        throw new Error("🚨 Error finding user: " + err);
      }
    );
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
