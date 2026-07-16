#!/usr/bin/env node
/* ============================================================
   generate-feeds.js
   Erzeugt aus posts/index.json + den Frontmatter-Feldern der
   posts/*.md automatisch:
     - den Blog-Artikel-Teil von sitemap.xml (Hauptseiten/Legal
       bleiben unangetastet, nur die <url>-Liste unterhalb des
       "BLOG-ARTIKEL"-Markers wird ersetzt)
     - feed.xml (RSS 2.0) mit allen Artikeln, neueste zuerst

   Zweck: Bisher musste bei jedem neuen Blog-Post von Hand ein
   <url>-Eintrag in sitemap.xml ergänzt werden - das wurde schon
   mal vergessen (siehe Isabela-Post, 3 Tage nicht in der Sitemap).
   Dieses Skript macht daraus einen automatischen Schritt.

   Laeuft in der GitHub Action (.github/workflows/feeds.yml) bei
   jeder Aenderung unter posts/**. Braucht Node 18+.
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT           = process.cwd();
const POSTS_DIR       = path.join(ROOT, 'posts');
const INDEX_JSON      = path.join(POSTS_DIR, 'index.json');
const SITEMAP_PATH    = path.join(ROOT, 'sitemap.xml');
const FEED_PATH       = path.join(ROOT, 'feed.xml');
const BASE_URL        = 'https://thefreescapeproject.com';
const SITEMAP_MARKER  = '✏️ Bei jedem neuen Blog-Post hier eine weitere <url> ergänzen.\n  ═══════════════════════════════════════════════ -->';

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Minimaler Frontmatter-Parser: nur die skalaren Felder, die
// Sitemap/Feed brauchen (titel, datum, land, teaser, typ).
function parseFrontmatter(text) {
  const normalized = text.replace(/\r\n/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return null;
  const data = {};
  match[1].split('\n').forEach(line => {
    const sep = line.indexOf(':');
    if (sep === -1) return;
    const key = line.slice(0, sep).trim();
    const val = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
    if (val !== '') data[key] = val;
  });
  return data;
}

function loadPosts() {
  const files = JSON.parse(fs.readFileSync(INDEX_JSON, 'utf8'));
  const posts = files.map(filename => {
    const slug = filename.replace(/\.md$/, '');
    const raw  = fs.readFileSync(path.join(POSTS_DIR, filename), 'utf8');
    const data = parseFrontmatter(raw);
    if (!data) {
      console.warn(`[generate-feeds] Kein Frontmatter in ${filename}, uebersprungen.`);
      return null;
    }
    return {
      slug,
      titel:  data.titel  || slug,
      datum:  data.datum  || '2026-01-01',
      land:   data.land   || '',
      typ:    data.typ    || 'guide',
      teaser: data.teaser || ''
    };
  }).filter(Boolean);

  posts.sort((a, b) => new Date(b.datum) - new Date(a.datum));
  return posts;
}

function buildSitemapUrls(posts) {
  return posts.map(p => {
    const priority = p.typ === 'reiseroute' ? '0.7' : '0.8';
    return (
      '  <url>\n' +
      `    <loc>${BASE_URL}/artikel.html?post=${p.slug}</loc>\n` +
      '    <changefreq>monthly</changefreq>\n' +
      `    <priority>${priority}</priority>\n` +
      '  </url>'
    );
  }).join('\n');
}

function updateSitemap(posts) {
  const current = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const markerIdx = current.indexOf(SITEMAP_MARKER);
  if (markerIdx === -1) {
    console.error('[generate-feeds] Sitemap-Marker nicht gefunden, sitemap.xml wird NICHT veraendert.');
    return;
  }
  const head = current.slice(0, markerIdx + SITEMAP_MARKER.length);
  const next = head + '\n' + buildSitemapUrls(posts) + '\n\n</urlset>\n';
  fs.writeFileSync(SITEMAP_PATH, next, 'utf8');
  console.log(`[generate-feeds] sitemap.xml aktualisiert (${posts.length} Artikel).`);
}

function buildFeed(posts) {
  const now = new Date().toUTCString();
  const items = posts.map(p => {
    const link = `${BASE_URL}/artikel.html?post=${p.slug}`;
    const pubDate = new Date(p.datum + 'T12:00:00Z').toUTCString();
    return (
      '  <item>\n' +
      `    <title>${escapeXml(p.titel)}</title>\n` +
      `    <link>${link}</link>\n` +
      `    <guid>${link}</guid>\n` +
      `    <pubDate>${pubDate}</pubDate>\n` +
      (p.land ? `    <category>${escapeXml(p.land)}</category>\n` : '') +
      `    <description>${escapeXml(p.teaser)}</description>\n` +
      '  </item>'
    );
  }).join('\n\n');

  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n' +
    '<channel>\n' +
    '  <title>The Freescape Project – Blog</title>\n' +
    `  <link>${BASE_URL}/blog.html</link>\n` +
    `  <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />\n` +
    '  <description>Reiseberichte, Routen-Guides und Kosten-Checks von Julia &amp; Sergen aus Kolumbien, Ecuador und Peru.</description>\n' +
    '  <language>de-DE</language>\n' +
    `  <lastBuildDate>${now}</lastBuildDate>\n\n` +
    items + '\n\n' +
    '</channel>\n' +
    '</rss>\n'
  );
}

function updateFeed(posts) {
  fs.writeFileSync(FEED_PATH, buildFeed(posts), 'utf8');
  console.log(`[generate-feeds] feed.xml aktualisiert (${posts.length} Artikel).`);
}

const posts = loadPosts();
updateSitemap(posts);
updateFeed(posts);
