import { Message } from "node-telegram-bot-api";
import { Attributes, TelegramClient } from "../client";
import UserModel from "../../database/models/users";
import log from "../../utils/logger";
import StreamerModel from "../../database/models/streamers";

module.exports = {
  regex: /^\/unfollow (.+)/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any, ctx: TelegramClient) {
    if (!attr.match || !attr.match[1])
      return ctx.Reply(
        attr.message,
        localizationFile["errors"]["error"] //todo: change for specific
      );

    const user = await UserModel.findOne({ user_id: attr.message.from?.id! })
      .lean()
      .exec();
    if (!user) return log("Couldn't find user on /unfollow");

    if (!user.streamers.includes(attr.match[1]))
      return ctx.Reply(
        attr.message,
        localizationFile["commands"]["follow"]["dont_follow"]
      );

    UserModel.findOneAndUpdate(
      { user_id: attr.message.from?.id! },
      {
        $pull: { streamers: attr.match[1] },
      }
    )
      .lean()
      .exec();

    StreamerModel.findOneAndUpdate(
      { username: attr.match[1] },
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

    return ctx.Reply(
      attr.message,
      localizationFile["commands"]["follow"]["unfollowed"]
    );
  },
};
