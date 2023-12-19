import * as mongoose from "mongoose";
import log from "../utils/logger";

const { MONGO_URI } = process.env;

// Set up mongoose
mongoose.set("strictQuery", true);
mongoose.connect(MONGO_URI + "telegram", { autoIndex: false });
mongoose.connections[0].on("error", (err) => {
  throw new Error("🚨 Error connecting to mongo: " + err);
});

log("🚀 Connected successfully to mongo server");
