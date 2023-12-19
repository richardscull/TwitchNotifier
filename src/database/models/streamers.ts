import { model, Schema } from "mongoose";

interface StreamerAttributes {
  username: string;
  followers: number;

  game?: string;
  title?: string;
  isOnline?: boolean;
  startedAt?: number;
}

const schema = new Schema<StreamerAttributes>(
  {
    username: { type: String, required: true },
    followers: { type: Number, required: true },
    game: { type: String, required: false },
    title: { type: String, required: false },
    isOnline: { type: Boolean, required: false },
    startedAt: { type: Number, required: false },
  },
  { versionKey: false }
);

const name = require("path").basename(__filename, ".js");
const StreamerModel = model(name, schema);

export default StreamerModel;
