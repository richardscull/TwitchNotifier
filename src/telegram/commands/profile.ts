import UserModel from "../../database/models/users";
import getFollowers from "../../twitch/lib/getFollowers";
import getUser from "../../twitch/lib/getUser";
import CapitalizeString from "../../utils/capitalizeString";
import { Decrypt } from "../../utils/crypterTools";
import log from "../../utils/logger";
import { numberWith } from "../../utils/numberWith";
import Sanitize from "../../utils/sanitizeMarkdown";
import { Attributes } from "../client";

module.exports = {
  regex: /^\/profile$/,
  requireToken: true,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId } = attr;

    const userModel = await UserModel.findOne({ user_id: attr.userId })
      .lean()
      .exec();

    if (!userModel?.token?.access_token)
      return log("Couldn't find acess_token for /profile");

    const user = await getUser([], Decrypt(userModel.token.access_token)).then(
      (res) => res[0].data
    );

    if (!user) return log("couldn't get user in /profile");
    const followers = await getFollowers(user.id);

    ctx.Reply(msg, {
      text: localizationFile["commands"]["profile"]["profile"]
        .replace("%username%", user.display_name)
        .replace(
          "%description%",
          Sanitize(user.description) || `_${localizationFile["undefined"]}_`
        )
        .replace("%id%", user.id)
        .replace("%created%", new Date(user.created_at).toLocaleDateString())
        .replace(
          "%status%",
          CapitalizeString(user.broadcaster_type) ||
            `_${localizationFile["undefined"]}_`
        )
        .replace("%followers%", numberWith(followers, ",")),
      image: user.profile_image_url || undefined,
    });
  },
};
