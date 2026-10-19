import sharp from "sharp";
import { writeFileSync } from "node:fs";

const CREAM = "#F2EFE7";
const INK = "#332A26";

const mark = (scale = 1, stroke = 6.5) => `
  <g stroke="${INK}" stroke-width="${stroke}" fill="none" stroke-linecap="butt" stroke-miterlimit="10">
    <circle cx="110" cy="110" r="86" stroke-dasharray="498 42.4" stroke-dashoffset="-93" />
    <path d="M60 150 L102 54 L144 150" />
    <path d="M78 114 H126" />
    <path d="M62 56 H126 a30 30 0 0 1 0 60 H100" />
    <path d="M118 116 L162 190" />
  </g>`;

const iconSvg = (size, pad) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 220 220">
  <rect width="220" height="220" fill="${CREAM}"/>
  <g transform="translate(110,110) scale(${pad}) translate(-110,-110)">${mark()}</g>
</svg>`;

const maskableSvg = (size) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 220 220">
  <rect width="220" height="220" fill="${CREAM}"/>
  <g transform="translate(110,110) scale(0.66) translate(-110,-110)">${mark()}</g>
</svg>`;

const targets = [
  ["public/icons/icon-192.png", 192, 0.86],
  ["public/icons/icon-512.png", 512, 0.86],
  ["public/icons/apple-touch-icon.png", 180, 0.8],
  ["public/icons/icon-maskable-512.png", 512, 0.66],
  ["public/icons/favicon-32.png", 32, 0.92],
];

for (const [out, size, pad] of targets) {
  const svg = out.includes("maskable") ? maskableSvg(size) : iconSvg(size, pad);
  await sharp(Buffer.from(svg)).png().resize(size, size).toFile(out);
  console.log("wrote", out);
}

// og / splash style image
const splash = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${CREAM}"/>
  <g transform="translate(490,110) scale(1.0)">${mark()}</g>
  <text x="600" y="420" font-family="Helvetica,Arial,sans-serif" font-size="58" letter-spacing="10" fill="${INK}" text-anchor="middle">RO ALCALÁ FIT</text>
  <text x="600" y="480" font-family="Helvetica,Arial,sans-serif" font-size="26" letter-spacing="8" fill="#8A7A70" text-anchor="middle">PERSONAL TRAINER</text>
</svg>`;
await sharp(Buffer.from(splash)).png().toFile("public/icons/og.png");
console.log("wrote og");
