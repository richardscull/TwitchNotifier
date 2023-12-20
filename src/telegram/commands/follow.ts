import { Attributes } from "../client";
import UserModel from "../../database/models/users";
import log from "../../utils/logger";
import StreamerModel from "../../database/models/streamers";

module.exports = {
  regex: /^\/follow (.+)/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId, match } = attr;

    if (!match || !match[1])
      return ctx.Reply(
        msg,
        localizationFile["errors"]["error"] //todo: change for specific
      );

    //todo: write check if user on twitch exist

    const user = await UserModel.findOne({ user_id: userId }).lean().exec();
    if (!user) return log("Couldn't find user on /follow");

    if (user.streamers.includes(match[1]))
      return ctx.Reply(
        msg,
        localizationFile["commands"]["follow"]["already_follows"]
      );

    UserModel.findOneAndUpdate(
      { user_id: userId },
      {
        $addToSet: { streamers: match[1] },
      }
    )
      .lean()
      .exec();

    StreamerModel.findOneAndUpdate(
      { username: match[1] },
      {
        $inc: { followers: 1 },
      },
      { upsert: true }
    )
      .lean()
      .exec();

    return ctx.Reply(msg, localizationFile["commands"]["follow"]["followed"]);
  },
};
