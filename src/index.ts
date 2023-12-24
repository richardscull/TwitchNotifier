require("dotenv").config();
import "./utils/checkEnv";

// 📃: Used for debugging purposes.
// If you are not a developer, it's better to leave options below as is.
export const USELOGGER = true;
export const BRANCH = "DEV" as "DEV" | "PROD";

import "./database/main"; // Load database
import "./telegram/client"; // Load telegram client
import "./server/main"; // Start local server
import "./twitch/main"; // Start twitch pooler

import "./utils/handleExit";

console.log("🚀 Started successfully");
