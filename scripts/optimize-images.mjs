// Priprema fotografija za galeriju.
//
// Fotografije s mobitela znaju biti 5-16 MB, što je najveći pojedinačni
// razlog za loš rezultat na Google PageSpeed / Core Web Vitals testu.
// Ova skripta iz svake fotke radi dvije WebP datoteke:
//
//   <mapa>-<n>.webp        max 1600px, q78  — otvara se u galeriji (lightbox)
//   <mapa>-<n>-thumb.webp  800x600,    q72  — prikazuje se u mreži
//
// Usput ujednačava imena (soboslikarstvo je koristio "slika-N", struja je
// počinjala od 2), pa galerija u kodu može sama složiti putanje.
// Originali se ne brišu — sele se u original-images/ u korijenu projekta.
//
// Pokretanje nakon dodavanja novih fotki:  bun run images

import sharp from "sharp";
import { readdir, mkdir, rename, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "public/images");
const ARCHIVE = path.join(ROOT, "original-images");

const FOLDERS = ["struja", "gletanje", "soboslikarstvo", "majstor"];

const manifest = {};

for (const folder of FOLDERS) {
  const dir = path.join(SRC, folder);
  const files = (await readdir(dir))
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  if (files.length === 0) {
    console.log(`${folder}: nema novih JPG/PNG datoteka, preskačem.`);
    continue;
  }

  await mkdir(path.join(ARCHIVE, folder), { recursive: true });
  manifest[folder] = [];

  let index = 0;
  for (const file of files) {
    index += 1;
    const input = path.join(dir, file);
    const base = `${folder}-${index}`;

    const before = (await stat(input)).size;

    const full = await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(path.join(dir, `${base}.webp`));

    const thumb = await sharp(input)
      .rotate()
      .resize({ width: 800, height: 600, fit: "cover", position: "centre" })
      .webp({ quality: 72 })
      .toFile(path.join(dir, `${base}-thumb.webp`));

    manifest[folder].push({ base, width: full.width, height: full.height });

    await rename(input, path.join(ARCHIVE, folder, file));

    const after = full.size + thumb.size;
    console.log(
      `${folder}/${file} -> ${base}.webp  ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e3).toFixed(0)} KB`,
    );
  }
}

console.log("\n--- broj slika po usluzi (upiši u src/lib/site.ts) ---");
for (const [folder, items] of Object.entries(manifest)) {
  console.log(`${folder}: ${items.length}`);
}
