import { USELOGGER } from "../index";

export default function log(message: string) {
  if (USELOGGER) console.log(message);
}
