// Copies the Forge web app (which lives in the repo ROOT, one level up from this
// app/ folder) into app/www so Capacitor can bundle it into the APK.
// Runs from the app/ folder. sw.js and _worker.js are intentionally skipped
// (the web build disables the service worker when running natively; _worker.js is
// Cloudflare-only). FOOD_DB is inlined in index.html, so food-db.js isn't needed.

import { mkdir, rm, cp } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SRC = '..';      // repo root (the live web app)
const WWW = 'www';     // app/www

const FILES = [
  'index.html',
  'manifest.json',
  'privacypolicy.html',
  'favicon.svg',
  'favicon-32.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-192.png',
  'icon-maskable-512.png',
];
const DIRS = ['brand'];

await rm(WWW, { recursive: true, force: true });
await mkdir(WWW, { recursive: true });

for (const f of FILES) {
  if (existsSync(`${SRC}/${f}`)) await cp(`${SRC}/${f}`, `${WWW}/${f}`);
  else console.warn(`[copy-web] missing (skipped): ${f}`);
}
for (const d of DIRS) {
  if (existsSync(`${SRC}/${d}`)) await cp(`${SRC}/${d}`, `${WWW}/${d}`, { recursive: true });
}
console.log('[copy-web] web assets copied into app/www');
