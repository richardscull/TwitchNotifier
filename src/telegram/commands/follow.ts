import { Attributes } from "../client";
import UserModel from "../../database/models/users";
import log from "../../utils/logger";
import StreamerModel from "../../database/models/streamers";
import getUser from "../../twitch/lib/getUser";
import isOnline from "../../twitch/lib/getStreamStatus";
import Sanitize from "../../utils/sanitizeMarkdown";

module.exports = {
  regex: /^\/follow (.+)$/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId, match } = attr;

    if (!match || !match[1]) return log("Couldn't find match on /follow");

    const user = await UserModel.findOne({ user_id: userId }).lean().exec();
    if (!user) return log("Couldn't find user on /follow");

    const twitchUser = await getUser({ username: match[1] });
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
          displayName: twitchUser.display_name,
          isOnline: await isOnline([twitchUser.id]).then((res) => {
            const { isOnline } = res[twitchUser.id];
            return isOnline;
          }),
        },
        $inc: { followers: 1 },
      },
      { upsert: true, setDefaultsOnInsert: true, new: true }
    )
      .lean()
      .exec();

    return ctx.Reply(msg, {
      text: localizationFile["commands"]["follow"]["followed"]
        .replace("%streamer%", twitchUser.display_name)
        .replace("%url%", `https://www.twitch.tv/${twitchUser.login}`),
    });
  },
};
