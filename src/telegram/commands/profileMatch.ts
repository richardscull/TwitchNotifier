import getFollowers from "../../twitch/lib/getFollowers";
import getUser from "../../twitch/lib/getUser";
import CapitalizeString from "../../utils/capitalizeString";
import log from "../../utils/logger";
import { numberWith } from "../../utils/numberWith";
import Sanitize from "../../utils/sanitizeMarkdown";
import { Attributes } from "../client";

module.exports = {
  regex: /^\/profile (.+)$/,
  requireToken: false,
  async execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg, userId, match } = attr;

    if (!match || !match[1]) return log("Couldn't find match on /profile");

    const user = await getUser({
      username: match[1],
    });

    if (!user)
      return ctx.Reply(msg, {
        text: localizationFile["commands"]["profile"]["user_not_found"],
      });

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
