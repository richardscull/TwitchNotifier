import { Attributes } from "../client";
import UserModel from "../../database/models/users";
import log from "../../utils/logger";
import StreamerModel from "../../database/models/streamers";
import getUser, { ResultAttributes } from "../../twitch/lib/getUser";

module.exports = {
  regex: /^\/unfollow (.+)$/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId, match } = attr;
    if (!match || !match[1]) return log("Couldn't find match on /unfollow");

    const user = await UserModel.findOne({ user_id: userId }).lean().exec();
    if (!user) return log("Couldn't find user on /unfollow");

    const isAll = match[1] === "*";
    let streamers = isAll
      ? user.streamers
      : match[1].split(" ").map((s) => s.toLowerCase());

    // Reduce streamers to packs of 100, because twitch api only allows 100 users per request
    const PacksOf100 = streamers.reduce((acc, streamer, i) => {
      const index = Math.floor(i / 100);
      acc[index] = [...(acc[index] || []), streamer];
      return acc;
    }, [] as any[][]);

    // Get streamers from twitch
    const twitchUsers = [] as ResultAttributes[];
    for (const pack of PacksOf100) {
      const result = await getUser(
        pack.map((s) => (!isNaN(Number(s)) ? { user_id: s } : { username: s }))
      );
      for (const user of result) {
        twitchUsers.push(user as any);
      }
    }

    // Check if streamers exists, if not, return
    const twitchStreamers = [];
    for (const result of twitchUsers) {
      const { data } = result;
      if (!data)
        return ctx.Reply(msg, {
          text: localizationFile["commands"]["follow"]["user_not_found"],
        });

      twitchStreamers.push(data);
    }

    // Check if user is following all streamers in the list, if not, return
    const notFollowing = twitchStreamers.filter(
      (s) => !user.streamers.includes(s.id)
    );
    if (notFollowing.length > 0)
      return ctx.Reply(msg, {
        text: localizationFile["commands"]["follow"]["dont_follow"].replace(
          "%streamers%",
          notFollowing
            .map((streamer) => `*${streamer.display_name}*`)
            .join(", ")
        ),
      });

    // Send waiting message
    const message = await ctx.Reply(msg, {
      text: localizationFile["commands"]["follow"]["unfollowing"],
    });
    if (!message) return log("Couldn't find message on /unfollow");

    // Remove streamers from user
    UserModel.findOneAndUpdate(
      { user_id: userId },
      {
        $pull: { streamers: { $in: twitchStreamers.map((s) => s.id) } },
      }
    )
      .lean()
      .exec();

    // Update streamers models
    for (const twitchUser of twitchStreamers) {
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
    }

    // Inform user that streamers were unfollowed
    return ctx.EditMessage(message, {
      text: localizationFile["commands"]["follow"]["unfollowed"].replace(
        "%streamers%",
        twitchStreamers
          .map((streamer) => `*${streamer.display_name}*`)
          .join(", ")
      ),
    });
  },
};
