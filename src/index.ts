require("dotenv").config();
import "./utils/checkEnv";

export const USELOGGER = true;

import "./database/main";
import "./telegram/client";
import "./server/twitch";

console.log("🚀 Started successfully");
