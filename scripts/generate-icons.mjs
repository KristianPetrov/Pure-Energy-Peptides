import { writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const heroLogo = path.join(root, "public/brand/pe-clear.png");

// Exact bounds of the standalone mark in the current hero artwork. Keeping
// this crop here makes every platform icon reproducible from the brand source.
const markBounds = { left: 847, top: 103, width: 578, height: 530 };

async function renderIcon(size) {
  const cornerRadius = Math.round(size * 0.22);
  const markSize = Math.round(size * 0.82);
  const background = Buffer.from(`
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#131c2b"/>
          <stop offset="1" stop-color="#0a101c"/>
        </linearGradient>
        <radialGradient id="aqua" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${size * 0.2} ${size * 0.16}) rotate(45) scale(${size * 0.7})">
          <stop stop-color="#00c7c7" stop-opacity=".26"/>
          <stop offset="1" stop-color="#00c7c7" stop-opacity="0"/>
        </radialGradient>
        <radialGradient id="flame" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(${size * 0.84} ${size * 0.84}) rotate(225) scale(${size * 0.72})">
          <stop stop-color="#ff7a00" stop-opacity=".24"/>
          <stop offset="1" stop-color="#ff7a00" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#bg)"/>
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#aqua)"/>
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="url(#flame)"/>
    </svg>
  `);
  const mark = await sharp(heroLogo)
    .extract(markBounds)
    .resize(markSize, markSize, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return sharp(background)
    .composite([{ input: mark, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

function makeIco(images) {
  const headerSize = 6;
  const entrySize = 16;
  let offset = headerSize + entrySize * images.length;
  const header = Buffer.alloc(offset);

  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);

  images.forEach(({ size, buffer }, index) => {
    const entry = headerSize + index * entrySize;
    header.writeUInt8(size === 256 ? 0 : size, entry);
    header.writeUInt8(size === 256 ? 0 : size, entry + 1);
    header.writeUInt8(0, entry + 2);
    header.writeUInt8(0, entry + 3);
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(buffer.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += buffer.length;
  });

  return Buffer.concat([header, ...images.map(({ buffer }) => buffer)]);
}

const rendered = new Map();
for (const size of [16, 32, 48, 180, 192, 512]) {
  rendered.set(size, await renderIcon(size));
}

await Promise.all([
  writeFile(path.join(root, "app/icon.png"), rendered.get(48)),
  writeFile(path.join(root, "app/apple-icon.png"), rendered.get(180)),
  writeFile(path.join(root, "public/icon-192.png"), rendered.get(192)),
  writeFile(path.join(root, "public/icon-512.png"), rendered.get(512)),
]);

const socialWidth = 1200;
const socialHeight = 630;
const socialBackground = Buffer.from(`
  <svg width="${socialWidth}" height="${socialHeight}" viewBox="0 0 ${socialWidth} ${socialHeight}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="social-bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0a101c"/>
        <stop offset=".52" stop-color="#131c2b"/>
        <stop offset="1" stop-color="#17100b"/>
      </linearGradient>
      <radialGradient id="social-aqua" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(150 70) rotate(35) scale(620 470)">
        <stop stop-color="#00c7c7" stop-opacity=".3"/>
        <stop offset="1" stop-color="#00c7c7" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="social-flame" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1080 600) rotate(210) scale(600 470)">
        <stop stop-color="#ff7a00" stop-opacity=".28"/>
        <stop offset="1" stop-color="#ff7a00" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${socialWidth}" height="${socialHeight}" fill="url(#social-bg)"/>
    <rect width="${socialWidth}" height="${socialHeight}" fill="url(#social-aqua)"/>
    <rect width="${socialWidth}" height="${socialHeight}" fill="url(#social-flame)"/>
    <text x="600" y="512" text-anchor="middle" fill="#e8edf6" font-family="Arial, sans-serif" font-size="32" font-weight="600" letter-spacing="1">Reference-Grade Research Peptides · 99% Purity · HPLC Tested</text>
    <text x="600" y="564" text-anchor="middle" fill="#00c7c7" font-family="Arial, sans-serif" font-size="24" font-weight="600" letter-spacing="5">PUREENERGYPEPTIDES.COM</text>
  </svg>
`);
const socialLogo = await sharp(heroLogo)
  .resize({ width: 620 })
  .png({ compressionLevel: 9 })
  .toBuffer();
const socialImage = await sharp(socialBackground)
  .composite([{ input: socialLogo, top: 42, left: 290 }])
  .png({ compressionLevel: 9 })
  .toBuffer();
await writeFile(path.join(root, "app/opengraph-image.png"), socialImage);

const favicon = makeIco(
  [16, 32, 48].map((size) => ({ size, buffer: rendered.get(size) }))
);
await Promise.all([
  writeFile(path.join(root, "app/favicon.ico"), favicon),
  writeFile(path.join(root, "public/favicon.ico"), favicon),
]);

console.log(
  "Generated favicon, app icons, and social image from public/brand/pe-clear.png"
);
