import { model, Schema } from "mongoose";

interface OAuthAttributes {
  access_token: string;
  expires_at: number;
}

const schema = new Schema<OAuthAttributes>(
  {
    access_token: { type: String, required: true },
    expires_at: { type: Number, required: true },
  },
  { versionKey: false }
);

const name = require("path").basename(__filename, ".js");
const OAuthModel = model(name, schema);

export default OAuthModel;
