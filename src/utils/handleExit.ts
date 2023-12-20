import UserModel from "../database/models/users";

async function handleExit() {
  console.log("Shutting down...");

  try {
    await UserModel.updateMany(
      { $where: "this.login_request != null" },
      { $unset: { login_request: "" } }
    );
  } catch (_) {}

  process.exit(0);
}

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
//process.on("uncaughtException", handleExit);
//process.on("unhandledRejection", handleExit);
