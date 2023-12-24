import { Attributes } from "../client";
import UserModel from "../../database/models/users";
import log from "../../utils/logger";
import StreamerModel from "../../database/models/streamers";
import getUser from "../../twitch/lib/getUser";

module.exports = {
  regex: /^\/follow (.+)/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId, match } = attr;

    if (!match || !match[1])
      return ctx.Reply(
        msg,
        { text: localizationFile["errors"]["error"] } //todo: change for specific
      );

    const user = await UserModel.findOne({ user_id: userId }).lean().exec();
    if (!user) return log("Couldn't find user on /follow");

    const twitchUser = await getUser(match[1]);
    if (!twitchUser)
      return ctx.Reply(msg, {
        text: localizationFile["commands"]["follow"]["user_not_found"],
      });

    if (user.streamers.includes(twitchUser.id))
      return ctx.Reply(msg, {
        text: localizationFile["commands"]["follow"]["already_follows"],
      });

    UserModel.findOneAndUpdate(
      { user_id: userId },
      {
        $addToSet: { streamers: twitchUser.id },
      }
    )
      .lean()
      .exec();

    StreamerModel.findOneAndUpdate(
      { id: twitchUser.id },
      {
        $setOnInsert: {
          username: twitchUser.login,
          backgroundImage: twitchUser.profile_image_url,
          profileImage: twitchUser.offline_image_url,
        },
        $inc: { followers: 1 },
      },
      { upsert: true, setDefaultsOnInsert: true, new: true }
    )
      .lean()
      .exec();

    // const streamerPicture = await getStreamerPicture({
    //   nickname: twitchUser.login,
    //   profileImage: twitchUser.profile_image_url,
    //   backgroundImage: twitchUser.offline_image_url,
    // });

    return ctx.Reply(msg, {
      text: localizationFile["commands"]["follow"]["followed"]
        .replace("%streamer%", twitchUser.login)
        .replace("%url%", `https://www.twitch.tv/${twitchUser.login}`),
    });
  },
};
