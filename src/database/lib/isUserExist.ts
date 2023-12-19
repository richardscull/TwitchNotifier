import UserModel from "../models/users";

export default function IsUserExist(user_id: number): Promise<boolean> {
  return UserModel.findOne({ user_id })
    .lean()
    .exec()
    .then(
      (user) => {
        if (!user) return false;
        return true;
      },
      (err) => {
        throw new Error("🚨 Error finding user: " + err);
      }
    );
}
