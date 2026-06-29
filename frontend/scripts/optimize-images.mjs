/*
 * optimize-images.mjs — One-shot image optimizer for public/images.
 *
 * Walks public/images recursively and, for every PNG/JPEG, writes two WebP
 * siblings next to it: `<name>.webp` (full, long-edge <=1600px, q80) for hero /
 * gallery / lightbox use, and `<name>.thumb.webp` (long-edge <=700px, q72) for
 * card thumbnails. Originals are left untouched. Re-runnable (skips up-to-date
 * outputs). Run via `npm run images:optimize`. Reports total bytes saved.
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import { existsSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = fileURLToPath(new URL('../public/images', import.meta.url));
const RASTER = new Set(['.png', '.jpg', '.jpeg']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

// Skip work if the output exists and is newer than the source.
function fresh(src, out) {
  return existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs;
}

let srcBytes = 0, outBytes = 0, made = 0, skipped = 0;

for await (const file of walk(ROOT)) {
  if (!RASTER.has(extname(file).toLowerCase())) continue;
  const base = file.slice(0, -extname(file).length);
  const full = `${base}.webp`;
  const thumb = `${base}.thumb.webp`;
  srcBytes += (await stat(file)).size;

  for (const [out, width, quality] of [[full, 1600, 80], [thumb, 700, 72]]) {
    if (fresh(file, out)) { skipped++; continue; }
    const buf = await sharp(file)
      .resize({ width, height: width, fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    await writeFile(out, buf);
    outBytes += buf.length;
    made++;
  }
}

const mb = (n) => (n / 1024 / 1024).toFixed(1);
console.log(`\nGenerated ${made} webp files (${skipped} already fresh).`);
console.log(`Source rasters: ${mb(srcBytes)} MB  →  new webp output: ${mb(outBytes)} MB`);
