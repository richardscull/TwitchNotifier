import { USELOGGER } from "../index";

export default function log(message: string, isForced: boolean = false) {
  const date = new Date().toLocaleString();
  if (USELOGGER || isForced) console.log(`🕒 ${date} | ${message}`);
}
