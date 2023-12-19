import crypto from "crypto";
const { CRYPTO_KEY } = process.env;

const derivedKey = crypto.scryptSync(CRYPTO_KEY!, "salt", 32);

export function Encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(derivedKey),
    iv
  );

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`;
}

export function Decrypt(text: string): string {
  const [iv, encrypted] = text.split(":");
  const ivBuff = Buffer.from(iv, "hex");

  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    Buffer.from(derivedKey),
    ivBuff
  );

  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
