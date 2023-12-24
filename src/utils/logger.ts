import { USELOGGER } from "../index";

export default function log(message: string) {
  const date = new Date().toLocaleString();
  if (USELOGGER) console.log(`🕒 ${date} | ${message}`);
}
