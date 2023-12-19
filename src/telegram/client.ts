import TelegramBot, { Message } from "node-telegram-bot-api";
import path from "path";
import * as fs from "fs";
import log from "../utils/logger";
import IsTwitchTokenValid from "../database/lib/isTwitchTokenValid";
import IsUserExist from "../database/lib/isUserExist";
import createUserQuery from "../database/lib/createUserQuery";
import { GetLocalizationFile } from "../utils/localization";

export interface Attributes {
  message: Message ,
  match: RegExpExecArray | null
}

export class TelegramClient extends TelegramBot {
  constructor(token: string) {
    super(token, { polling: true });

    // Load all commands from the commands directory
    const commandsDir = path.join(__dirname, "commands");
    fs.readdirSync(commandsDir).forEach((file) => {
      const command = require(path.join(commandsDir, file));

      this.onText(command.regex, async (msg: Message, match: RegExpExecArray | null) => {
        // Check if user exists in the database
        await IsUserExist(msg.from?.id!).then(async (isExist: boolean) => {
          if (!isExist) return await createUserQuery(msg.from?.id!);
        });

        // Get localization file
        const localizationFile = (await GetLocalizationFile(
          msg.from?.id!
        )) as any;

        // Check if command requires a twitch token
        if ((command.requireToken || false) === true) {
          return IsTwitchTokenValid(msg.from?.id!).then((isValid: boolean) => {
            if (!isValid)
              return this.Reply(
                msg,
                localizationFile["errors"]["invalid_token"]
              );

            return command.execute({message: msg, match}, localizationFile, this);
          });
        }

        // Execute the command
        command.execute({message: msg, match},localizationFile, this);
      });

      log(`📑 Loaded command: ${command.regex}`);
    });
  }

  public Reply(msg: Message, text: string, options?: any) {
    this.sendMessage(msg.chat.id, text, {
      reply_to_message_id: msg.message_id,
      ...options,
    }).catch((err) => {
      if (err.response.body.error_code === 400 && options.includelocalhost) {
        const url = options.reply_markup.inline_keyboard[0][0].url;
        return this.sendMessage(msg.chat.id, `${text} ${url}`, {
          reply_to_message_id: msg.message_id,
        });
      } else {
        log(err);
      }
    });
  }
}

const Client = new TelegramClient(process.env.TELEGRAM_BOT_TOKEN!);

export default Client;
