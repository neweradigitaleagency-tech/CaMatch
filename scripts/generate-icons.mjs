import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");

/** Rend le logo (squircle dégradé lime→forest + coche blanche). */
function render(size, { padRatio = 0, background = null } = {}) {
  const rect = padRatio ? `rx="${18}"` : "";
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <defs>
        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#C9E345"/>
          <stop offset="0.48" stop-color="#AECB2A"/>
          <stop offset="1" stop-color="#243318"/>
        </linearGradient>
      </defs>
      ${background ? `<rect width="${size}" height="${size}" ${rect} fill="${background}"/>` : ""}
      <g transform="translate(${(size * padRatio) / 2} ${(size * padRatio) / 2}) scale(${1 - padRatio})">
        <g transform="translate(${size * 0.035} ${size * 0.035}) scale(${(size * 0.93) / 64})">
          <rect width="64" height="64" rx="16" fill="url(#g)"/>
          <path d="M17 34 L27 44 L48 23" stroke="#FFFFFF" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </g>
      </g>
    </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

const jobs = [
  { file: "pwa-192x192.png", size: 192 },
  { file: "pwa-512x512.png", size: 512 },
  { file: "apple-touch-icon-180x180.png", size: 180 },
  { file: "pwa-512x512-maskable.png", size: 512, padRatio: 0.2, background: "#243318" },
];

for (const job of jobs) {
  const buf = await render(job.size, {
    padRatio: job.padRatio ?? 0,
    background: job.background ?? null,
  });
  await sharp(buf).toFile(path.join(publicDir, job.file));
  console.log(`✓ ${job.file} (${job.size}x${job.size})`);
}

// Préserve le SVG source dans public pour référence.
console.log("Icônes PWA générées dans public/");
