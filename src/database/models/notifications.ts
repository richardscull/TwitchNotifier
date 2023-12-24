import { model, Schema } from "mongoose";

interface NotificationAttributes {
  user_id: string;
  streamer_id: number;
  message_id: number;
}

const schema = new Schema<NotificationAttributes>(
  {
    user_id: { type: String, required: true },
    streamer_id: { type: Number, required: true },
    message_id: { type: Number, required: true },
  },
  { versionKey: false }
);

const name = require("path").basename(__filename, ".js");
const NotificationModel = model(name, schema);

export default NotificationModel;
