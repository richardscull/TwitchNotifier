import { Attributes } from "../client";
import UserModel from "../../database/models/users";
import log from "../../utils/logger";
import StreamerModel from "../../database/models/streamers";
import getUser from "../../twitch/lib/getUser";

module.exports = {
  regex: /^\/unfollow (.+)$/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId, match } = attr;

    if (!match || !match[1]) return log("Couldn't find match on /unfollow");

    const user = await UserModel.findOne({ user_id: userId }).lean().exec();
    if (!user) return log("Couldn't find user on /unfollow");

    const twitchUser = await getUser({ username: match[1] });
    if (!twitchUser)
      return ctx.Reply(msg, {
        text: localizationFile["commands"]["follow"]["user_not_found"],
      });

    if (!user.streamers.includes(twitchUser.id))
      return ctx.Reply(msg, {
        text: localizationFile["commands"]["follow"]["dont_follow"],
      });

    UserModel.findOneAndUpdate(
      { user_id: userId },
      {
        $pull: { streamers: twitchUser.id },
      }
    )
      .lean()
      .exec();

    StreamerModel.findOneAndUpdate(
      { id: twitchUser.id },
      {
        $inc: { followers: -1 },
      },
      { upsert: true, new: true }
    )
      .lean()
      .exec()
      .then((streamer) => {
        if (!streamer) return;
        if (streamer.followers <= 0) {
          return StreamerModel.findOneAndDelete({
            _id: streamer._id,
          }).exec();
        }
      });

    return ctx.Reply(msg, {
      text: localizationFile["commands"]["follow"]["unfollowed"],
    });
  },
};
