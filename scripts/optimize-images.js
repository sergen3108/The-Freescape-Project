#!/usr/bin/env node
/* ============================================================
   optimize-images.js
   Verkleinert die Fotos unter assets/img/ fuer das Web und legt
   zu jedem Foto ein Vorschaubild unter assets/img/thumbs/ an
   (gleicher Pfad und Dateiname, nur mit "thumbs/" davor).

     - Grosse Fassung: hoechstens 1920 px an der laengeren Seite,
       JPEG-Qualitaet 80. Ersetzt das Original nur, wenn die
       Datei dadurch spuerbar kleiner wird.
     - Vorschaubild: deckt mindestens 800 x 600 px ab (Seiten-
       verhaeltnis bleibt), JPEG-Qualitaet 75. Fuer Karten,
       Galerie-Kacheln und kleine Vorschauen.

   Bereits bearbeitete Bilder stehen mit ihrem Hash in
   scripts/image-manifest.json und werden nicht noch einmal
   angefasst (sonst wuerde jedes erneute Komprimieren Qualitaet
   kosten). Neue oder ausgetauschte Bilder werden erkannt, weil
   ihr Hash nicht mehr passt.

   Laeuft in der GitHub Action (.github/workflows/images.yml)
   bei jeder Aenderung unter assets/img/. Braucht Node 18+ und
   das Paket "sharp".
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

const ROOT          = process.cwd();
const IMG_DIR       = path.join(ROOT, 'assets', 'img');
const THUMB_DIR     = path.join(IMG_DIR, 'thumbs');
const MANIFEST_PATH = path.join(ROOT, 'scripts', 'image-manifest.json');

const FULL_MAX      = 1920;  // laengere Seite der grossen Fassung
const FULL_QUALITY  = 80;
const THUMB_MIN_W   = 800;   // Vorschaubild deckt diese Flaeche ab
const THUMB_MIN_H   = 600;
const THUMB_QUALITY = 75;
const MIN_SAVING    = 0.9;   // Original nur ersetzen, wenn neu < 90 %

const isPhoto = f => /\.(jpe?g)$/i.test(f);

// Pfade im Manifest immer mit "/" (gleich auf Windows und Linux)
const rel = f => path.relative(IMG_DIR, f).split(path.sep).join('/');
const sha1 = buf => crypto.createHash('sha1').update(buf).digest('hex');

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return p === THUMB_DIR ? [] : walk(p);
    return [p];
  });
}

function loadManifest() {
  try { return JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8')); }
  catch (e) { return {}; }
}

async function optimizeFull(file, buf) {
  // rotate() ohne Argument dreht nach EXIF-Orientierung; Metadaten
  // (EXIF, GPS) werden beim Neu-Kodieren entfernt.
  const out = await sharp(buf)
    .rotate()
    .resize({ width: FULL_MAX, height: FULL_MAX, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: FULL_QUALITY, mozjpeg: true })
    .toBuffer();
  if (out.length < buf.length * MIN_SAVING) {
    fs.writeFileSync(file, out);
    return out;
  }
  return buf;
}

async function makeThumb(buf, thumbFile) {
  // fit "outside": so klein wie moeglich, aber nie kleiner als
  // 800 x 600. Hochformat-Fotos in breiten Kacheln bleiben so scharf.
  const out = await sharp(buf)
    .rotate()
    .resize({ width: THUMB_MIN_W, height: THUMB_MIN_H, fit: 'outside', withoutEnlargement: true })
    .jpeg({ quality: THUMB_QUALITY, mozjpeg: true })
    .toBuffer();
  fs.mkdirSync(path.dirname(thumbFile), { recursive: true });
  fs.writeFileSync(thumbFile, out);
  return out;
}

async function main() {
  const manifest = loadManifest();
  const photos = walk(IMG_DIR).filter(isPhoto);
  const seen = new Set();
  let changed = 0, before = 0, after = 0;

  for (const file of photos) {
    const key = rel(file);
    seen.add(key);
    const thumbFile = path.join(THUMB_DIR, key);
    let buf = fs.readFileSync(file);
    const entry = manifest[key];
    const known = entry && entry.hash === sha1(buf);
    if (known && fs.existsSync(thumbFile)) continue;

    // Bekannte Bilder nicht erneut komprimieren, nur das fehlende
    // Vorschaubild nachziehen
    before += buf.length;
    if (!known) buf = await optimizeFull(file, buf);
    const thumb = await makeThumb(buf, thumbFile);
    after += buf.length;
    manifest[key] = { hash: sha1(buf) };
    changed++;
    console.log(`  · ${key}  ${Math.round(buf.length / 1024)} KB, Vorschau ${Math.round(thumb.length / 1024)} KB`);
  }

  // Aufraeumen: Vorschaubilder und Manifest-Eintraege ohne Original
  for (const key of Object.keys(manifest)) {
    if (!seen.has(key)) delete manifest[key];
  }
  if (fs.existsSync(THUMB_DIR)) {
    for (const t of walk(THUMB_DIR)) {
      const key = path.relative(THUMB_DIR, t).split(path.sep).join('/');
      if (!seen.has(key)) {
        fs.unlinkSync(t);
        console.log(`  - verwaistes Vorschaubild entfernt: ${key}`);
      }
    }
  }

  const sorted = Object.fromEntries(Object.keys(manifest).sort().map(k => [k, manifest[k]]));
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n');

  if (changed) {
    console.log(`\nFertig. ${changed} Bilder bearbeitet: ${Math.round(before / 1048576)} MB -> ${Math.round(after / 1048576)} MB.`);
  } else {
    console.log('\nFertig. Keine neuen Bilder.');
  }
}

main().catch(err => {
  console.error('\nFEHLER:', err.message);
  process.exit(1);
});
