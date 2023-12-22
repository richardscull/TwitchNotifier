const vars = [
  "TWITCH_CLIENT_ID",
  "TWITCH_CLIENT_TOKEN",
  "HOST_URI",
  "MONGO_URI",
  "TELEGRAM_BOT_TOKEN",
  "CRYPTO_KEY",
];

for (const envVar of vars) {
  if (!process.env[envVar]) {
    throw new Error(`📑 ${envVar} is not set!`);
  }
}

if (process.env.HOST_URI?.endsWith("/")) {
  process.env.HOST_URI = process.env.HOST_URI.slice(0, -1);
}
