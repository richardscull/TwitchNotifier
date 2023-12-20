import { Attributes } from "../client";

module.exports = {
  regex: /start/,
  requireToken: false,
  execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg } = attr;
    ctx.Reply(msg, "Hello, world!");
    // todo: select language on first run.
  },
};
