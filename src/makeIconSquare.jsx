import sharp from "sharp";
const input = "./assets/icon.png";
const output = "./assets/icon-square.png";
sharp(input)
  .resize({ width: 1024, height: 1024, fit: "cover", position: "centre" })
  .toFile(output)
  .then(() => console.log("Created square icon:", output))
  .catch(console.error);
