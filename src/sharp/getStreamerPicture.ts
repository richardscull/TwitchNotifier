import sharp from "sharp";
import * as Canvas from "@napi-rs/canvas";
import fs, { promises } from "fs";
import { join } from "path";

interface IStreamerPicture {
  nickname: string;
  profileImage: string;
  backgroundImage: string;
}

//TODO: WORK WITH THIS LATER

export default async function getStreamerPicture(attributes: IStreamerPicture) {
  const image =
    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKnfeXV4voZVkZWh_6kWKbdXrl-Cv08O7OHgOZdfrZ0Q&s";
  const { nickname, profileImage, backgroundImage } = attributes;

  console.log(nickname, profileImage, backgroundImage);

  //   if (!nickname || !profileImage || !backgroundImage) {
  //     throw new Error("Missing attributes");
  //   }

  //   if (fs.existsSync(`./src/sharp/images/${nickname}.png`)) {
  //     return fs.createReadStream(`./build/sharp/images/${nickname}.png`);
  //   }

  const canvas = Canvas.createCanvas(1280, 500);
  const ctx = canvas.getContext("2d");

  // Add background
  const background = await Canvas.loadImage(image); // backgroundImage ||
  ctx.filter = "blur(3px)";
  ctx.drawImage(background, 0, -110, 1280, 720);
  ctx.filter = "none";

  // Add profile image
  ctx.beginPath();
  ctx.arc(230, 230, 200, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();
  const profile = await Canvas.loadImage(profileImage || image);
  ctx.drawImage(profile, 30, 30, 400, 400);

  // const data = await canvas.encode("png");
  const data = canvas.toBuffer("image/png");

  //await promises.writeFile(join(__dirname, `./images/${nickname}.png`), data);

  return data;
}
