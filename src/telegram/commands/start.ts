import { Attributes } from "../client";

module.exports = {
  regex: /start/,
  requireToken: false,
  execute(attr: Attributes, localizationFile: any) {
    const { ctx, msg } = attr;
    ctx.Reply(msg, {
      text: `*🎋 Twitch Botifier*\n\n${localizationFile["start"]}`,
      image: "./assets/start.png",
    });
  },
};
