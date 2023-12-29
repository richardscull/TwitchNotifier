import axios from "axios";
import path from "path";
import log from "../utils/logger";
import UserModel from "../database/models/users";
import { Decrypt, Encrypt } from "../utils/crypterTools";
import { SendNotification } from "../telegram/events/sendNotification";
import Client from "../telegram/client";
import { GetLocalizationFile } from "../utils/localization";
const { TWITCH_CLIENT_ID, TWITCH_CLIENT_TOKEN, PORT, HOST_URI } = process.env;

(async () => {
  const app = require("fastify")();

  app.register(require("@fastify/static"), {
    root: path.join(__dirname, "static"),
    prefix: "/",
  });

  app.get("/auth/twitch", (req: any, res: any) => {
    if (!req.query.state)
      return res.status(400).send({ error: "Bad request: State is not set" });

    return res.redirect(
      "https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=" +
        TWITCH_CLIENT_ID +
        `&redirect_uri=${HOST_URI}/auth/twitch/callback&scope=user:read:follows&state=` +
        req.query.state
    );
  });

  app.get("/auth/twitch/callback", async (req: any, res: any) => {
    if (!req.query.state || !req.query.code)
      return res
        .status(400)
        .send({ error: "Bad request: State or Code is not set" });

    const tokenData = await axios
      .post(
        "https://id.twitch.tv/oauth2/token",
        {
          client_id: TWITCH_CLIENT_ID,
          client_secret: TWITCH_CLIENT_TOKEN,
          grant_type: "authorization_code",
          redirect_uri: `${HOST_URI}/auth/twitch/callback`,
          code: req.query.code,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((res: any) => res.data)
      .catch(() => {});

    if (!tokenData || !tokenData.access_token)
      return res
        .status(400)
        .send({ error: "Bad request: Couldn't get acess_token" });

    const data = await axios
      .get("https://id.twitch.tv/oauth2/validate", {
        headers: {
          Authorization: `OAuth ${tokenData.access_token}`,
        },
      })
      .then((res: any) => res.data)
      .catch(() => {});

    if (data.status === 401)
      return res
        .status(400)
        .send({ error: "Bad request: Error validating token" });

    const profile = await axios.get("https://api.twitch.tv/helix/users", {
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    return UserModel.findOneAndUpdate(
      { "login_request.state": req.query.state },
      {
        $set: {
          token: {
            user_id: profile.data.data[0].id,
            access_token: Encrypt(tokenData.access_token),
            refresh_token: Encrypt(tokenData.refresh_token),
            expires_at: new Date().getTime() + tokenData.expires_in * 1000,
          },
        },
        $unset: {
          login_request: "",
        },
      }
    )
      .lean()
      .exec()
      .then((user) => {
        if (!user) {
          return res.status(400).send({ error: "Bad request: User not found" });
        } else {
          GetLocalizationFile(Number(user.user_id)).then((file) => {
            SendNotification(
              user.user_id,
              /*
               * Note: The "⭐" commands are the way how I show to user that command requires token.
               * Example: /import - ⭐ Import streamers from Twitch
               */ file["commands"]["login"]["logged_in"],
              Client
            );
          });

          return res.redirect("/auth/twitch/redirect");
        }
      });
  });

  app.get("/auth/twitch/redirect", (_: any, res: any) => {
    return res.sendFile("index.html");
  });

  app.get("/", (_: any, res: any) => {
    res.send("🚀 Started successfully"); // todo: rewrite
  });

  app.listen({ port: Number(PORT) | 3000 }, (err: any, adr: any) => {
    if (err) throw err;
    log(`🚀 Server started on port ${adr}`);
  });
})();
