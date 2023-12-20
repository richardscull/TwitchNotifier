import { Attributes } from "../client";
import UserModel from "../../database/models/users";
import log from "../../utils/logger";
import StreamerModel from "../../database/models/streamers";
import getUser from "../../twitch/lib/getUser";
import { get } from "http";
import getStreamerPicture from "../../sharp/getStreamerPicture";

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

    const user = await UserModel.findOne({ user_id: userId }).lean().exec();
    if (!user) return log("Couldn't find user on /follow");

    if (user.streamers.includes(match[1]))
      return ctx.Reply(
        msg,
        localizationFile["commands"]["follow"]["already_follows"]
      );

    const twitchUser = await getUser(match[1]);
    if (!twitchUser)
      return ctx.Reply(
        msg,
        localizationFile["commands"]["follow"]["user_not_found"]
      );

    UserModel.findOneAndUpdate(
      { user_id: userId },
      {
        $addToSet: { streamers: twitchUser.login },
      }
    )
      .lean()
      .exec();

    StreamerModel.findOneAndUpdate(
      { username: match[1] },
      {
        $setOnInsert: {
          id: twitchUser.id,
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

    return ctx.Reply(
      msg,
      localizationFile["commands"]["follow"]["followed"]
        .replace("%streamer%", twitchUser.login)
        .replace("%url%", `https://www.twitch.tv/${twitchUser.login}`)
    );
  },
};
