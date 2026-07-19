/**
 * Cuts product mockups to the bottle silhouette using the blank bottle's
 * alpha mask. Only the exterior is transparent — glass, label, and cap stay.
 *
 * Prefer regenerating via `node scripts/generate-mockups.mjs --force` when
 * labels changed. This script is for re-applying the bottle cutout to existing
 * mockup PNGs (e.g. white-background exports) without eating the glass.
 *
 * Usage: node scripts/clear-mockup-backgrounds.mjs [name ...]
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const DIR = path.join(ROOT, "public/products/mockups");
const BOTTLE = path.join(ROOT, "public/products/labels/mock-bottle.png");

async function loadBottleMask() {
  const { data, info } = await sharp(BOTTLE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, info };
}

async function cutToBottle(file, bottle) {
  const input = path.join(DIR, file);
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.width !== bottle.info.width || info.height !== bottle.info.height) {
    throw new Error(
      `${file}: size ${info.width}x${info.height} does not match bottle ${bottle.info.width}x${bottle.info.height}`
    );
  }

  const out = Buffer.from(data);
  let exteriorCleared = 0;
  let glassRestored = 0;

  for (let i = 0; i < out.length; i += 4) {
    const bottleA = bottle.data[i + 3];

    if (bottleA < 8) {
      // Outside the bottle silhouette — fully transparent.
      if (out[i + 3] !== 0) exteriorCleared++;
      out[i] = 0;
      out[i + 1] = 0;
      out[i + 2] = 0;
      out[i + 3] = 0;
      continue;
    }

    // Inside the bottle: keep RGB, enforce bottle alpha so clear glass is not
    // left as a hole. If a prior bad cutout zeroed RGB, pull pixels from the
    // blank bottle so the glass/cap silhouette is restored.
    const rgbGone = out[i] + out[i + 1] + out[i + 2] === 0 && out[i + 3] < 8;
    if (rgbGone) {
      out[i] = bottle.data[i];
      out[i + 1] = bottle.data[i + 1];
      out[i + 2] = bottle.data[i + 2];
      glassRestored++;
    }
    out[i + 3] = bottleA;
  }

  await sharp(out, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(input);

  console.log(
    `✓ ${file} (exterior cleared ${exteriorCleared.toLocaleString()}, glass restored ${glassRestored.toLocaleString()})`
  );
}

const names = process.argv.slice(2);
const all = (await readdir(DIR)).filter(
  (f) => f.endsWith(".png") && !f.startsWith("_")
);
const targets = names.length
  ? all.filter((f) => names.includes(path.basename(f, ".png")))
  : all;

if (!targets.length) {
  console.error("No mockups matched.");
  process.exit(1);
}

const bottle = await loadBottleMask();
for (const file of targets) {
  await cutToBottle(file, bottle);
}
console.log(`Done: ${targets.length} mockup(s).`);
