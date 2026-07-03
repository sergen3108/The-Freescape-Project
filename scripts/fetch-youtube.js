#!/usr/bin/env node
/* ============================================================
   fetch-youtube.js
   Holt Kanal-Statistiken, Videoliste und Videodauer von der
   YouTube Data API v3 und schreibt sie als statische Datei
   vlogs-data.json ins Repo-Root. Zusätzlich werden alle
   Vorschaubilder lokal nach assets/vlog-thumbs/ geladen.

   Zweck: Kein Live-Request vom Browser des Besuchers an Google.
   Alles wird vorab auf GitHub-Servern geholt und statisch
   ausgeliefert. Dadurch keine Übertragung der Besucher-IP an
   Google, kein Consent-Banner für Vorschaubilder nötig.

   Läuft in der GitHub Action (.github/workflows/youtube.yml).
   Benötigt Node 18+ (globales fetch ist dort eingebaut).
   Der API-Key kommt aus der Umgebungsvariable YT_API_KEY
   (in GitHub als Repository-Secret hinterlegt).
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const API_KEY    = process.env.YT_API_KEY;
const CHANNEL_ID = 'UCmCpxt4eKOG_R1csbtp3Z9Q';

// Ausgabepfade (relativ zum Repo-Root)
const OUT_JSON   = path.join(process.cwd(), 'vlogs-data.json');
const THUMB_DIR  = path.join(process.cwd(), 'assets', 'vlog-thumbs');
// Pfad, wie er später im <img src> steht (von der Website aus)
const THUMB_WEB  = 'assets/vlog-thumbs';

if (!API_KEY) {
  console.error('FEHLER: Umgebungsvariable YT_API_KEY ist nicht gesetzt.');
  process.exit(1);
}

// ISO 8601 Dauer (z.B. PT1M30S) in Sekunden umrechnen
function parseDuration(iso) {
  const m = String(iso || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return 0;
  return (parseInt(m[1] || 0) * 3600) + (parseInt(m[2] || 0) * 60) + parseInt(m[3] || 0);
}

async function getJSON(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || 'Unbekannter API-Fehler');
  }
  return data;
}

// Lädt ein Thumbnail herunter. Versucht zuerst maxresdefault,
// fällt bei 404 auf hqdefault zurück. Gibt den lokalen
// Dateinamen zurück (oder null, wenn beides fehlschlägt).
async function downloadThumb(videoId) {
  const candidates = [
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
  ];
  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      // maxresdefault liefert bei fehlendem Bild teils ein
      // graues 120x90-Platzhalterbild (~1-2 KB). Zu kleine
      // Dateien überspringen, damit der hq-Fallback greift.
      if (buf.length < 3000) continue;
      const file = `${videoId}.jpg`;
      fs.writeFileSync(path.join(THUMB_DIR, file), buf);
      return `${THUMB_WEB}/${file}`;
    } catch (err) {
      // nächsten Kandidaten versuchen
    }
  }
  console.warn(`  ! Kein Thumbnail für ${videoId}`);
  return null;
}

async function main() {
  fs.mkdirSync(THUMB_DIR, { recursive: true });

  console.log('1/4  Kanal-Statistiken abrufen …');
  const ch = await getJSON(
    `https://www.googleapis.com/youtube/v3/channels?part=statistics,contentDetails&id=${CHANNEL_ID}&key=${API_KEY}`
  );
  const channel = ch.items && ch.items[0];
  if (!channel) throw new Error('Kanal nicht gefunden.');

  const stats = {
    videoCount:      channel.statistics.videoCount,
    viewCount:       channel.statistics.viewCount,
    subscriberCount: channel.statistics.subscriberCount,
  };
  const uploadsId = channel.contentDetails.relatedPlaylists.uploads;

  console.log('2/4  Videoliste abrufen …');
  const pl = await getJSON(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsId}&key=${API_KEY}`
  );
  const items = pl.items || [];
  const videoIds = items.map(i => i.snippet.resourceId.videoId).join(',');

  console.log('3/4  Videodauer abrufen …');
  const det = await getJSON(
    `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${API_KEY}`
  );
  const durationMap = {};
  (det.items || []).forEach(v => { durationMap[v.id] = parseDuration(v.contentDetails.duration); });

  console.log('4/4  Videos verarbeiten und Thumbnails laden …');
  const videos = [];
  for (const item of items) {
    const id = item.snippet.resourceId.videoId;
    console.log(`  · ${id}  ${item.snippet.title.slice(0, 60)}`);
    const thumb = await downloadThumb(id);
    videos.push({
      id,
      title:       item.snippet.title,
      description: item.snippet.description || '',
      publishedAt: item.snippet.publishedAt,
      duration:    durationMap[id] || 999,
      thumb,   // lokaler Pfad oder null
    });
  }

  // Verwaiste Thumbnails aufräumen: Dateien löschen, die zu
  // keinem aktuellen Video mehr gehören (z.B. gelöschte Videos)
  const keep = new Set(videos.filter(v => v.thumb).map(v => path.basename(v.thumb)));
  for (const file of fs.readdirSync(THUMB_DIR)) {
    if (file.endsWith('.jpg') && !keep.has(file)) {
      fs.unlinkSync(path.join(THUMB_DIR, file));
      console.log(`  - verwaistes Thumbnail entfernt: ${file}`);
    }
  }

  const out = {
    generatedAt: new Date().toISOString(),
    stats,
    videos,
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(out, null, 2));
  console.log(`\nFertig. ${videos.length} Videos, vlogs-data.json geschrieben.`);
}

main().catch(err => {
  console.error('\nFEHLER:', err.message);
  process.exit(1);
});
