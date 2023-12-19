import { Message } from "node-telegram-bot-api";
import { Attributes, TelegramClient } from "../client";
import UserModel from "../../database/models/users";
import log from "../../utils/logger";
import { Stream } from "stream";
import StreamerModel from "../../database/models/streamers";

module.exports = {
  regex: /^\/follow (.+)/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any, ctx: TelegramClient) {
    if (!attr.match || !attr.match[1])
      return ctx.Reply(
        attr.message,
        localizationFile["errors"]["error"] //todo: change for specific
      );

    //todo: write check if user on twitch exist

    const user = await UserModel.findOne({ user_id: attr.message.from?.id! })
      .lean()
      .exec();
    if (!user) return log("Couldn't find user on /follow");

    if (user.streamers.includes(attr.match[1]))
      return ctx.Reply(
        attr.message,
        localizationFile["commands"]["follow"]["already_follows"]
      );

    UserModel.findOneAndUpdate(
      { user_id: attr.message.from?.id! },
      {
        $addToSet: { streamers: attr.match[1] },
      }
    )
      .lean()
      .exec();

    StreamerModel.findOneAndUpdate(
      { username: attr.match[1] },
      {
        $inc: { followers: 1 },
      },
      { upsert: true }
    )
      .lean()
      .exec();

    return ctx.Reply(
      attr.message,
      localizationFile["commands"]["follow"]["followed"]
    );
  },
};
