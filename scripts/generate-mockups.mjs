/**
 * Generates product mockup images by wrapping flat label artwork onto the
 * blank-label mock bottle render (public/products/labels/mock-bottle.png).
 *
 * The label plate on the bottle render is the white rectangle at
 * x 229-793, y 575-1338. Labels are near-full-wrap designs (~97% of the
 * cylinder circumference), so the visible front face shows the central ~52%
 * of the label with cylindrical (asin) compression toward the edges.
 * The warped label is multiply-blended onto the bottle so the render's own
 * shading, edge shadows, and the curved bottom seam stay visible.
 *
 * Usage: node scripts/generate-mockups.mjs [label-name ...]
 *        (no args = all labels in public/products/labels/)
 */
import sharp from "sharp";
import { readdir } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "..");
const LABELS_DIR = path.join(ROOT, "public/products/labels");
const OUT_DIR = path.join(ROOT, "public/products/mockups");
const BOTTLE = path.join(LABELS_DIR, "mock-bottle.png");

// Label plate bounds on the bottle render, measured from pixel scans.
const PLATE = { left: 229, top: 575, width: 565, height: 763 };

// Fraction of extra cosine shading applied by the warp itself (on top of the
// shading already baked into the bottle render). 0 = none.
const EXTRA_SHADE = 0.12;

async function loadBottle() {
  const { data, info } = await sharp(BOTTLE)
    .raw()
    .toBuffer({ resolveWithObject: true });
  return { data, info };
}

/** Cylindrically warp a flat label into a PLATE-sized RGB buffer. */
function warpLabel(label, lw, lh, channels) {
  const { width: W, height: H } = PLATE;
  const out = Buffer.alloc(W * H * 3);
  const R = W / 2;
  const scale = H / lh; // screen px per label px (undistorted at center)
  const uC = lw / 2;

  for (let x = 0; x < W; x++) {
    const nx = (x + 0.5 - R) / R; // -1..1 across the cylinder face
    const theta = Math.asin(Math.max(-1, Math.min(1, nx)));
    const u = uC + (R * theta) / scale; // label-space column (arc length)
    const shade = 1 - EXTRA_SHADE * (1 - Math.cos(theta));

    const u0 = Math.max(0, Math.min(lw - 1, Math.floor(u)));
    const u1 = Math.min(lw - 1, u0 + 1);
    const fu = Math.max(0, Math.min(1, u - u0));

    for (let y = 0; y < H; y++) {
      const v = ((y + 0.5) / H) * lh - 0.5;
      const v0 = Math.max(0, Math.min(lh - 1, Math.floor(v)));
      const v1 = Math.min(lh - 1, v0 + 1);
      const fv = Math.max(0, Math.min(1, v - v0));

      const o = (y * W + x) * 3;
      for (let c = 0; c < 3; c++) {
        const p00 = label[(v0 * lw + u0) * channels + c];
        const p01 = label[(v0 * lw + u1) * channels + c];
        const p10 = label[(v1 * lw + u0) * channels + c];
        const p11 = label[(v1 * lw + u1) * channels + c];
        const top = p00 + (p01 - p00) * fu;
        const bot = p10 + (p11 - p10) * fu;
        out[o + c] = Math.round((top + (bot - top) * fv) * shade);
      }
    }
  }
  return out;
}

async function generate(labelFile, bottle) {
  const name = path.basename(labelFile, ".png");
  // Flatten onto white so transparent rounded corners match the white plate.
  const { data, info } = await sharp(path.join(LABELS_DIR, labelFile))
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const warped = warpLabel(data, info.width, info.height, info.channels);

  await sharp(bottle.data, { raw: bottle.info })
    .composite([
      {
        input: warped,
        raw: { width: PLATE.width, height: PLATE.height, channels: 3 },
        left: PLATE.left,
        top: PLATE.top,
        blend: "multiply",
      },
    ])
    .png()
    .toFile(path.join(OUT_DIR, `${name}.png`));

  console.log(`✓ ${name}.png`);
}

const args = process.argv.slice(2);
const all = (await readdir(LABELS_DIR)).filter(
  (f) => f.endsWith(".png") && f !== "mock-bottle.png"
);
const targets = args.length
  ? all.filter((f) => args.includes(path.basename(f, ".png")))
  : all;

if (!targets.length) {
  console.error("No matching labels found.");
  process.exit(1);
}

const bottle = await loadBottle();
for (const f of targets) await generate(f, bottle);
console.log(`Done: ${targets.length} mockup(s) written to public/products/mockups/`);
