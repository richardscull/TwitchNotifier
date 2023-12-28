export default function Sanitize(text: string) {
  const chars = ["_", "*", "`", "["];
  for (const char of chars) {
    text = text.replace(new RegExp(`\\${char}`, "g"), `\\${char}`);
  }
  return text;
}
