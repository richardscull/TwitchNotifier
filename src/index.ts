require("dotenv").config();
import "./utils/checkEnv";

// Used for debugging purposes,
// if you are not a developer it's better to leave it as false
export const USELOGGER = true;

import "./database/main";
import "./telegram/client";
import "./server/twitch";

console.log("🚀 Started successfully");
