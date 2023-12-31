import TelegramBot, { Message } from "node-telegram-bot-api";
import path from "path";
import * as fs from "fs";
import log from "../utils/logger";
import IsTwitchTokenValid from "../database/lib/isTwitchTokenValid";
import IsUserExist from "../database/lib/isUserExist";
import createUserQuery from "../database/lib/createUserQuery";
import { GetLocalizationFile } from "../utils/localization";

// Disable deprecation warnings
process.env["NTBA_FIX_350"] = "true";

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

export interface ReplyOptions {
  text?: string;
  image?: string | fs.ReadStream;
  options?: any;
}

export class TelegramClient extends TelegramBot {
  constructor(token: string) {
    super(token, { polling: true, filepath: false });

    // Load all commands from the commands directory
    const commandsDir = path.join(__dirname, "commands");
    fs.readdirSync(commandsDir).forEach((file) => {
      const command = require(path.join(commandsDir, file));
      this.onText(
        command.regex,
        (msg: Message, match: RegExpExecArray | null) =>
          handleSlashCommand(
            { msg, userId: msg.from?.id!, ctx: this, match },
            command
          )
      );

      log(`📑 Loaded command: ${command.regex}`);
    });

    // Handle invalid commands
    this.on("message", async (msg) => {
      if (!msg.text?.startsWith("/")) return;

      handleInvalidCommand({ msg, userId: msg.from?.id!, ctx: this });
    });

    // Handle callback queries
    this.on("callback_query", (query) => {
      try {
        this.answerCallbackQuery(query.id).then(async () => {
          if (!query.data) return log("Callback data is not set!");
          const command = query.data.split(":")[0];
          const callback = query.data.split(":")[1];
          const callbackAttr = JSON.parse(
            query.data.split(":").slice(2).join(":") || "{}"
          );

          if (command === "disabled") return; // * Disabled button callback
          const callbackFile = require(path.join(commandsDir, command));

          const attr: Attributes = {
            msg: query.message!,
            userId: query.from.id,
            ctx: this,
          };

          const localizationFile = (await GetLocalizationFile(
            attr.userId
          )) as any;

          const logText = `📨 -  "${query.from.first_name}" (${query.from.id}) sent callback: ${query.data}`;
          log(logText);

          // Execute the callback
          callbackFile[callback](attr, localizationFile, callbackAttr);
        });
      } catch (err: any) {
        log(err);
      }
    });
  }

  public Reply(msg: Message, replyOptions: ReplyOptions) {
    let { text, image, options } = replyOptions;

    const params = {
      reply_to_message_id: msg.message_id,
      parse_mode: "Markdown",
      ...options,
    };

    if (image) {
      if (typeof image === "string" && !image.startsWith("http")) {
        if (!fs.existsSync(image)) return log("invalid image passed for Reply");
        image = fs.createReadStream(image);
      }

      return this.sendPhoto(msg.chat.id, image, {
        caption: text,
        ...params,
      }).catch((err) => log(err));
    } else if (text) {
      return this.sendMessage(msg.chat.id, text, {
        ...params,
      }).catch((err) => log(err));
    } else {
      log(`🚨 No text or image provided for ${msg.text}`);
    }
  }

  public EditMessage(msg: Message, replyOptions: ReplyOptions) {
    let { text, options } = replyOptions;

    const params = {
      chat_id: msg.chat.id,
      message_id: msg.message_id,
      parse_mode: "Markdown",
      ...options,
    };

    if (text) {
      return this.editMessageText(text, {
        ...params,
      }).catch((err) => log(err));
    } else {
      log(`🚨 No text provided for ${msg.text}`);
    }
  }

  public LinkButtons(commandName: string, options?: KeyboardButton[]) {
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
}

/*     CLIENT EXPORT      */

const Client = new TelegramClient(process.env.TELEGRAM_BOT_TOKEN!);
export default Client;

/*     FUNCTIONS      */

async function handleSlashCommand(attr: Attributes, command: any) {
  const { msg, userId, ctx } = attr;

  // Check if user exists in the database
  const isExist = await IsUserExist(msg.chat.id);
  if (!isExist) await createUserQuery(msg.chat.id);

  // Get localization file
  const localizationFile = (await GetLocalizationFile(userId)) as any;

  // Check if command requires a twitch token
  if ((command.requireToken || false) === true) {
    const isValid = await IsTwitchTokenValid(userId);

    if (!isValid)
      return ctx.Reply(msg, {
        text: localizationFile["errors"]["invalid_token"],
      });
  }

  const logText = `📨 -  "${msg.from?.first_name}" (${msg.from?.id}) sent command: ${command.regex}`;
  log(logText);

  // Execute the command
  command.execute(attr, localizationFile);
}

async function handleInvalidCommand(attr: Attributes) {
  const { msg, ctx } = attr;
  if (!msg.text) return;

  // Check if user exists in the database
  const isExist = await IsUserExist(msg.chat.id);
  if (!isExist) await createUserQuery(msg.chat.id);

  const localizationFile = (await GetLocalizationFile(attr.userId)) as any;

  const commandName = msg.text.slice(1).split(" ")[0];
  const isValidCommand = fs
    .readdirSync(path.join(__dirname, "commands"))
    .join(" ")
    .includes(commandName);

  if (!isValidCommand) {
    return ctx.Reply(msg, {
      text: localizationFile["errors"]["invalid_command"],
    });
  } else {
    const command = require(path.join(__dirname, "commands", commandName));
    if (
      command.regex.toString().includes("(.+)") &&
      msg.text?.split(" ")[1] === undefined // * Note: looks like a hardcode, because regex can have multiple (.+), but I let it be for now
    ) {
      return ctx.Reply(msg, {
        text: localizationFile["errors"]["invalid_query"],
      });
    }
  }
}
