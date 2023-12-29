import { Attributes } from "../client";
import UserModel from "../../database/models/users";
import CapitalizeString from "../../utils/capitalizeString";

module.exports = {
  regex: /^\/language$/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId } = attr;

    const buttons = [
      {
        text: `🇷🇺 ${CapitalizeString(
          localizationFile["commands"]["language"]["russian"]
        )}`,
        callback_data: "russian",
      },
      {
        text: `🇺🇸 ${CapitalizeString(
          localizationFile["commands"]["language"]["english"]
        )}`,
        callback_data: "english",
      },
    ];

    ctx.Reply(msg, {
      text: localizationFile["commands"]["language"]["choose_language"],
      options: {
        reply_markup: {
          inline_keyboard: [ctx.LinkButtons("language", buttons)],
        },
      },
    });
  },
};

module.exports.english = (attr: Attributes, _: any) => {
  const { ctx, msg } = attr;

  UserModel.findOneAndUpdate(
    { user_id: attr.userId },
    {
      $set: { localization: "english" },
    }
  )
    .lean()
    .exec();

  const localizationFile = require(`../../../localization/english.json`);

  ctx.EditMessage(msg, {
    text: localizationFile["commands"]["language"]["success_change"].replace(
      "%language%",
      localizationFile["commands"]["language"]["english"]
    ),
  });
};

module.exports.russian = (attr: Attributes, _: any) => {
  const { ctx, msg } = attr;

  UserModel.findOneAndUpdate(
    { user_id: attr.userId },
    {
      $set: { localization: "russian" },
    }
  )
    .lean()
    .exec();

  const localizationFile = require(`../../../localization/russian.json`);

  ctx.EditMessage(msg, {
    text: localizationFile["commands"]["language"]["success_change"].replace(
      "%language%",
      localizationFile["commands"]["language"]["russian"]
    ),
  });
};
