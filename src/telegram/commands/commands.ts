import { Attributes } from "../client";

module.exports = {
  regex: /^\/commands$/,
  requireToken: false,
  execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg } = attr;
    ctx.Reply(msg, {
      text: localizationFile["commands"]["commands"]["text"],
    });
  },
};
