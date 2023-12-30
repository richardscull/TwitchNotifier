import StreamerModel from "../../database/models/streamers";
import UserModel from "../../database/models/users";
import getFollowed from "../../twitch/lib/getFollowed";
import isOnline from "../../twitch/lib/getStreamStatus";
import { Decrypt } from "../../utils/crypterTools";
import log from "../../utils/logger";
import { Attributes } from "../client";

const queue = new Map();

module.exports = {
  regex: /^\/import$/,
  requireToken: true,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId } = attr;

    if (queue.has(userId))
      return ctx.Reply(msg, {
        text: localizationFile["commands"]["import"]["already_importing"],
      });

    const message = await ctx.Reply(msg, {
      text: localizationFile["commands"]["import"]["importing"],
    });

    if (!message)
      return log("Couldn't send message on /import, probably blocked");

    const streamersData = await getNewFollowedStreamers(userId);
    const { streamers: newStreamers, error } = streamersData;

    if (error === "no_followed")
      return ctx.EditMessage(message, {
        text: localizationFile["commands"]["import"]["no_followed"],
      });

    if (!newStreamers || newStreamers.length === 0)
      return ctx.EditMessage(message, {
        text: localizationFile["commands"]["import"]["no_new_followed"],
      });

    const buttons = [
      {
        text: `✅ ${localizationFile["commands"]["import"]["import"]}`,
        callback_data: `confirm`,
      },
      {
        text: `❌ ${localizationFile["changed_mind"]}`,
        callback_data: "cancel",
      },
    ];

    return ctx.EditMessage(message, {
      text: localizationFile["commands"]["import"]["import_confirm"]
        .replace("%count%", newStreamers.length.toString())
        .replace(
          "%list%",
          newStreamers.map((s) => `*${s.broadcaster_name}*`).join(", ")
        ),

      options: {
        reply_markup: {
          inline_keyboard: [ctx.LinkButtons("import", buttons)],
        },
      },
    });
  },
};

module.exports.confirm = async (attr: Attributes, localizationFile: any) => {
  const { ctx, msg, userId } = attr;

  if (queue.has(userId))
    return ctx.EditMessage(msg, {
      text: localizationFile["commands"]["import"]["already_importing"],
    });

  queue.set(userId, true);

  const streamers = await getNewFollowedStreamers(userId).then((res) => {
    return res.streamers;
  });

  if (!streamers || streamers.length === 0)
    return log("Couldn't get streamers on /import");

  ctx.EditMessage(msg, {
    text: localizationFile["commands"]["import"]["importing"],
  });

  await UserModel.findOneAndUpdate(
    { user_id: attr.userId },
    {
      $push: { streamers: { $each: streamers.map((s) => s.broadcaster_id) } },
    }
  )
    .lean()
    .exec();

  for (const streamer of streamers) {
    await StreamerModel.findOneAndUpdate(
      { id: streamer.broadcaster_id },
      {
        $setOnInsert: {
          username: streamer.broadcaster_login,
          displayName: streamer.broadcaster_name,
          isOnline: await isOnline([streamer.broadcaster_id]).then((res) => {
            const { isOnline } = res[streamer.broadcaster_id];
            return isOnline;
          }),
        },
        $inc: { followers: 1 },
      },
      { upsert: true, setDefaultsOnInsert: true, new: true }
    )
      .lean()
      .exec();
  }

  queue.delete(userId);

  ctx.EditMessage(msg, {
    text: localizationFile["commands"]["import"]["imported"],
  });
};

module.exports.cancel = (attr: Attributes, localizationFile: any) => {
  const { ctx, msg } = attr;

  ctx.EditMessage(msg, {
    text: localizationFile["commands"]["import"]["cancelled"],
  });
};

async function getNewFollowedStreamers(userId: number) {
  const userModel = await UserModel.findOne({ user_id: userId }).lean().exec();

  if (!userModel?.token?.access_token || !userModel?.token?.user_id) {
    log("Couldn't find acess_token or user_id for /profile");
    return { streamers: [], error: "no_followed" };
  }

  const followList = await getFollowed(
    userModel.token.user_id,
    Decrypt(userModel.token.access_token)
  );

  if (!followList || followList.length === 0)
    return { streamers: [], error: "no_followed" };

  return {
    streamers: followList.filter((streamer: TwitchFollowedStreamer) => {
      return !userModel.streamers.includes(streamer.broadcaster_id);
    }),
    error: undefined,
  };
}
