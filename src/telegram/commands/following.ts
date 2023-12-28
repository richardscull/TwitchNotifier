import { Attributes } from "../client";
import UserModel from "../../database/models/users";
import log from "../../utils/logger";
import StreamerModel from "../../database/models/streamers";
import Sanitize from "../../utils/sanitizeMarkdown";

function getStreamersPages(streamers: string[]) {
  const pages = streamers.reduce((acc, streamer, i) => {
    const index = Math.floor(i / 10);
    acc[index] = [...(acc[index] || []), streamer];
    return acc;
  }, [] as string[][]);

  return pages;
}

async function getStreamerPage(streamers: string[][], page: number) {
  let text = "";

  if (!streamers[page - 1]) return text;
  for (const [i, streamerId] of streamers[page - 1].entries()) {
    const streamer = await StreamerModel.findOne({ id: streamerId })
      .lean()
      .exec();

    text += `*${i + 1 + (page - 1) * 10}.* ${Sanitize(
      streamer?.username || ""
    )}\n`;
  }
  return text || "No streamers found";
}

function getButtons(page: number, pages: number) {
  const buttons = [];
  if (page > 1) {
    buttons.push({
      text: `« ${page - 1}`,
      callback_data: `following:page:{"page":${page - 1}}`,
    });
  }

  buttons.push({
    text: `·${page}·`,
    callback_data: `disabled`,
  });

  if (page < pages) {
    buttons.push({
      text: `${page + 1} »`,
      callback_data: `following:page:{"page":${page + 1}}`,
    });
  }

  return buttons;
}

module.exports = {
  regex: /following/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId } = attr;

    const user = await UserModel.findOne({ user_id: userId }).lean().exec();
    if (!user) return log("Couldn't find user on /following");

    const streamers = getStreamersPages(user.streamers || []);
    const text = await getStreamerPage(streamers, 1);

    if (user.streamers.length === 0)
      return ctx.Reply(msg, {
        text: localizationFile["commands"]["following"]["no_following"],
      });

    return ctx.Reply(msg, {
      text: localizationFile["commands"]["following"]["followed_list"]
        .replace("%count%", user.streamers.length.toString())
        .replace("%cpage%", "1")
        .replace("%tpages%", streamers.length.toString())
        .replace("%list%", text),
      options: {
        reply_markup: {
          inline_keyboard: [getButtons(1, streamers.length)],
        },
      },
    });
  },
};

module.exports.page = async (
  attr: Attributes,
  localizationFile: any,
  data: any
) => {
  const { ctx, msg, userId } = attr;
  const { page } = data;

  const user = await UserModel.findOne({ user_id: userId }).lean().exec();
  if (!user) return log("Couldn't find user on /following");

  if (user.streamers.length === 0)
    return ctx.Reply(msg, {
      text: localizationFile["commands"]["following"]["no_following"],
    });

  const streamers = getStreamersPages(user.streamers || []);
  const text = await getStreamerPage(streamers, page);

  ctx.EditMessage(
    msg,
    localizationFile["commands"]["following"]["followed_list"]
      .replace("%count%", user.streamers.length.toString())
      .replace("%cpage%", page)
      .replace("%tpages%", streamers.length.toString())
      .replace("%list%", text),
    {
      reply_markup: {
        inline_keyboard: [getButtons(page, streamers.length)],
      },
    }
  );
};
