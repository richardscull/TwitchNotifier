import TelegramBot, { Message } from "node-telegram-bot-api";
import path from "path";
import * as fs from "fs";
import log from "../utils/logger";
import IsTwitchTokenValid from "../database/lib/isTwitchTokenValid";
import IsUserExist from "../database/lib/isUserExist";
import createUserQuery from "../database/lib/createUserQuery";
import { GetLocalizationFile } from "../utils/localization";

export interface Attributes {
  msg: Message;
  userId: number;
  ctx: TelegramClient;
  match?: RegExpExecArray | null;
}

export interface KeyboardButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export class TelegramClient extends TelegramBot {
  constructor(token: string) {
    super(token, { polling: true });

    // Load all commands from the commands directory
    const commandsDir = path.join(__dirname, "commands");
    fs.readdirSync(commandsDir).forEach((file) => {
      const command = require(path.join(commandsDir, file));
      this.onText(
        command.regex,
        (msg: Message, match: RegExpExecArray | null) => {
          handleSlashCommand(
            { msg, userId: msg.from?.id!, ctx: this, match },
            command
          ); //todo: maybe rewrite this?
        }
      );

      log(`📑 Loaded command: ${command.regex}`);
    });

    this.on("callback_query", (query) => {
      this.answerCallbackQuery(query.id).then(async () => {
        if (!query.data) return log("Callback data is not set!");
        const command = query.data.split(":")[0];
        const callback = query.data.split(":")[1];
        const callbackFile = require(path.join(commandsDir, command));

        const attr: Attributes = {
          msg: query.message!,
          userId: query.from.id,
          ctx: this,
        };

        const localizationFile = (await GetLocalizationFile(
          attr.userId
        )) as any;

        // Execute the callback
        callbackFile[callback](attr, localizationFile);
      });
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

  public EditMessage(msg: Message, text: string, options?: any) {
    this.editMessageText(text, {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      ...options,
    });
  }

  public LinkButtons(
    commandName: string,
    options?: KeyboardButton[]
  ) {
    return options?.map((option) => {
      return {
        text: option.text,
        callback_data: option.callback_data
          ? `${commandName}:${option.callback_data}`
          : undefined,
        url: option.url,
      };
    }) as KeyboardButton[];
  }

  // ! Note: Could be deprecated
  public ClearKeyboard() {
    return {
      reply_markup: {
        remove_keyboard: true,
      },
    };
  }
}

/*     CLIENT EXPORT      */

const Client = new TelegramClient(process.env.TELEGRAM_BOT_TOKEN!);
export default Client;

/*     FUNCTIONS      */

async function handleSlashCommand(attr: Attributes, command: any) {
  const { msg, userId, ctx, match } = attr;

  // Check if user exists in the database
  await IsUserExist(userId).then(async (isExist: boolean) => {
    if (!isExist) return await createUserQuery(userId);
  });

  // Get localization file
  const localizationFile = (await GetLocalizationFile(userId)) as any;

  // Check if command requires a twitch token
  if ((command.requireToken || false) === true) {
    return IsTwitchTokenValid(userId).then((isValid: boolean) => {
      if (!isValid)
        return ctx.Reply(msg, localizationFile["errors"]["invalid_token"]);

      return command.execute(attr, localizationFile); //todo: write both execute as one!
    });
  }

  // Execute the command
  command.execute(attr, localizationFile);
}
