import log from "../../utils/logger";
import UserModel from "../models/users";

const queue = new Map();

export default async function CreateUserQuery(user_id: number) {
  if (queue.has(user_id)) return; // Skip if already in queue
  queue.set(user_id, true); // Add to queue

  return await UserModel.updateOne(
    { user_id },
    {
      $setOnInsert: {
        user_id,
        is_active: true,
        localization: "english",
        streamers: [],
      },
    },
    { upsert: true, setDefaultsOnInsert: true, new: true }
  ).then(
    (user) => {
      queue.delete(user_id);
      log("📑 Created user: " + user_id);
      return user;
    },
    (err) => {
      throw new Error("🚨 Error creating user: " + err);
    }
  );
}
