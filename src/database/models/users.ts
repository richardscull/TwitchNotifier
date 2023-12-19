import { model, Schema } from "mongoose";

interface UserAttributes {
  user_id: string;
  token?: HashedToken;
  is_active: boolean;
  localization: "english" | "russian";
  streamers: string[];
  login_request?: LoginRequest;
}

interface HashedToken {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

interface LoginRequest {
  state: string;
  expires_at: number;
}

const schema = new Schema<UserAttributes>(
  {
    user_id: { type: String, required: true },
    token: {
      type: {
        access_token: String,
        refresh_token: String,
        expires_at: Number,
      },
      required: false,
    },
    is_active: { type: Boolean, default: true },
    localization: { type: String, required: true },
    streamers: { type: [String], required: true },
    login_request: {
      type: {
        state: String,
        expires_at: Number,
      },
      required: false,
    },
  },
  { versionKey: false }
);

const name = require("path").basename(__filename, ".js");
const UserModel = model(name, schema);

export default UserModel;
