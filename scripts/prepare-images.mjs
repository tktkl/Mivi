// Development-only image encoding. No image service is contacted by this script.
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const [hero, films, series] = process.argv.slice(2);
if (!hero || !films || !series) {
  console.error("Usage: node scripts/prepare-images.mjs HERO.png FILMS.png SERIES.png");
  process.exit(1);
}
const out = path.resolve("site/assets/images");
await mkdir(out, { recursive: true });
for (const [name, source] of [["hero", hero], ["films", films], ["series", series]]) {
  const image = sharp(source);
  const encoded = name === "hero"
    ? image.resize({ width: 1920, withoutEnlargement: true })
    : image.resize(1536, 1728, { fit: "fill" });
  const result = await encoded.webp({ quality: name === "hero" ? 86 : 89, effort: 6 }).toFile(path.join(out, `${name}.webp`));
  console.log(`${name}.webp: ${result.width}×${result.height}, ${(result.size / 1024).toFixed(0)} KB`);
}
