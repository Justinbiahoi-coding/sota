// Renders the intro's stand-in artworks (src/components/home/intro/textures.ts) to WebP in
// public/intro-art/. Bitmaps, not SVG: the browser re-rasterises an SVG at every zoom level, which
// froze the page at scale ×7; a bitmap just scales on the GPU, as the real photos will.
// Run: node scripts/intro-art.ts   (re-run after editing textures.ts)
import sharp from "sharp"
import { TEXTURES } from "../src/components/home/intro/textures.ts"

for (const [name, draw] of Object.entries(TEXTURES)) {
  const out = `public/intro-art/${name}.webp`
  // density 144 = twice the SVG's own size (2800 × 1750), sharp enough on a Retina screen
  const info = await sharp(Buffer.from(draw()), { density: 144 }).webp({ quality: 80 }).toFile(out)
  console.log(out, `${info.width}×${info.height}`, `${Math.round(info.size / 1024)} KB`)
}
