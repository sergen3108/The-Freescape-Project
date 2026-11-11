#!/usr/bin/env node
/* ============================================================
   build-articles.js
   Erzeugt fuer jeden Blog-Artikel eine fertige Seite:

     posts/<slug>.md  +  artikel.html (Vorlage)  ->  blog/<slug>.html

   Warum: artikel.html baut den Artikel erst im Browser zusammen.
   WhatsApp, Pinterest und Facebook fuehren kein JavaScript aus und
   zeigten deshalb bei jedem geteilten Artikel nur den Standardtitel
   und das Standardbild. Die erzeugten Seiten haben Titel,
   Beschreibung, Vorschaubild, strukturierte Daten und den ganzen
   Text schon im Quelltext.

   Die Seiten unter blog/ NICHT von Hand bearbeiten, sie werden bei
   jedem Lauf neu geschrieben. Aenderungen gehoeren in
     - posts/<slug>.md      (Inhalt eines Artikels)
     - artikel.html         (Rahmen: Kopf, Navigation, Styles, Skripte)
     - artikel-render.js    (Aufbau des Artikels)

   Laeuft automatisch per GitHub Action. Aufruf im Repo-Root:
     node scripts/build-articles.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT       = process.cwd();
const POSTS_DIR  = path.join(ROOT, 'posts');
const OUT_DIR    = path.join(ROOT, 'blog');
const TEMPLATE   = path.join(ROOT, 'artikel.html');

const AR     = require(path.join(ROOT, 'artikel-render.js'));
const marked = require(path.join(ROOT, 'assets', 'vendor', 'marked.min.js'));

const esc = AR.escapeHtml;

// Einen Abschnitt der Vorlage ersetzen und abbrechen, wenn er fehlt.
// So faellt sofort auf, wenn artikel.html umgebaut wurde und dieses
// Skript nachgezogen werden muss.
function ersetze(html, muster, ersatz, name) {
  if (!muster.test(html)) {
    throw new Error('[build-articles] Stelle in artikel.html nicht gefunden: ' + name);
  }
  return html.replace(muster, ersatz);
}

// content="..." eines <meta ... id="<id>"> setzen
function setzeMeta(html, id, wert) {
  const muster = new RegExp('(<meta [^>]*content=")[^"]*("[^>]*id="' + id + '">)');
  return ersetze(html, muster, (m, a, b) => a + esc(wert) + b, 'meta#' + id);
}

function baueSeite(vorlage, slug, data, body) {
  const m = AR.meta(data, slug);
  const seitenpfad = AR.pagePath(slug);
  const artikelHtml = AR.renderBody(data, body, slug, marked, { anchorPrefix: seitenpfad });

  let html = vorlage;

  // Marker der Seitenbausteine gehoeren nur in die Vorlage
  html = html.replace(/^<!-- \/?partial:[^\n]*-->\n/gm, '');

  // Sprungmarken (#main, #) auf diese Seite beziehen, weil <base href="/">
  // sie sonst zur Startseite schickt
  html = html.replace(/href="#/g, 'href="' + seitenpfad + '#');

  html = ersetze(html, /<!DOCTYPE html>\n/,
    '<!DOCTYPE html>\n<!-- Automatisch erzeugt von scripts/build-articles.js aus artikel.html und posts/' + slug + '.md. Nicht von Hand bearbeiten. -->\n',
    'DOCTYPE');

  // Alle Pfade der Vorlage (style.css, assets/..., blog.html) gelten ab dem Seitenstamm
  html = ersetze(html, /(<meta charset="UTF-8">\n)/, '$1  <base href="/">\n', 'meta charset');

  html = ersetze(html, /<title>[\s\S]*?<\/title>/, '<title>' + esc(m.title) + '</title>', 'title');
  html = ersetze(html, /(<meta name="description" content=")[^"]*(">)/, (x, a, b) => a + esc(m.description) + b, 'meta description');

  html = setzeMeta(html, 'og-url', m.url);
  html = setzeMeta(html, 'og-title', m.title);
  html = setzeMeta(html, 'og-description', m.description);
  html = setzeMeta(html, 'og-image', m.image);
  html = setzeMeta(html, 'tw-title', m.title);
  html = setzeMeta(html, 'tw-description', m.description);
  html = setzeMeta(html, 'tw-image', m.image);

  // Bildgroesse steht in der Vorlage fest fuer das Standardbild und stimmt
  // fuer die Artikelbilder nicht: weglassen, die Dienste lesen sie selbst aus
  html = html.replace(/ *<meta property="og:image:(?:width|height)"[^>]*>\n/g, '');

  html = ersetze(html, /(<link rel="canonical" href=")[^"]*(" id="canonical-url">)/, (x, a, b) => a + m.url + b, 'canonical');

  // Strukturierte Daten. "<" maskieren, damit kein Text den Skript-Block schliessen kann
  const jsonLd = JSON.stringify(m.schema).replace(/</g, '\\u003c');
  html = ersetze(html, /<\/head>/,
    '<script type="application/ld+json" id="schema-org-jsonld">' + jsonLd + '</script>\n</head>',
    '</head>');

  // Artikel direkt in die Seite, Ladehinweis aus
  html = ersetze(html, /<div id="artikel-loading">[\s\S]*?<\/div>\n<div id="artikel-root" style="display:none;"><\/div>/,
    () => '<div id="artikel-loading" style="display:none;"></div>\n<div id="artikel-root">' + artikelHtml + '</div>',
    'artikel-loading/artikel-root');

  // marked und artikel-render.js braucht die fertige Seite nicht mehr.
  // Stattdessen sagt window.ARTIKEL dem Skript, welcher Artikel das ist.
  const info = JSON.stringify({ slug: slug, land: data.land || '', tags: AR.tagsOf(data) }).replace(/</g, '\\u003c');
  html = ersetze(html, /<!-- marked[^\n]*-->\n<script src="assets\/vendor\/marked\.min\.js" defer><\/script>\n<script src="artikel-render\.js" defer><\/script>\n/,
    () => '<script>window.ARTIKEL = ' + info + ';</script>\n',
    'Skript-Tags marked/artikel-render');

  return html;
}

// blog.html und der Ordner blog/ teilen sich den Namen. Wer /blog/ aufruft,
// landet ohne diese Seite auf einer Fehlerseite.
function indexSeite() {
  return '<!DOCTYPE html>\n' +
    '<html lang="de">\n<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="robots" content="noindex, follow">\n' +
    '  <title>Blog | The Freescape Project</title>\n' +
    '  <link rel="canonical" href="' + AR.BASE_URL + '/blog.html">\n' +
    '  <meta http-equiv="refresh" content="0; url=/blog.html">\n' +
    '</head>\n<body>\n' +
    '  <p><a href="/blog.html">Zum Blog</a></p>\n' +
    '</body>\n</html>\n';
}

function main() {
  const vorlage = fs.readFileSync(TEMPLATE, 'utf8').replace(/\r\n/g, '\n');
  const dateien = JSON.parse(fs.readFileSync(path.join(POSTS_DIR, 'index.json'), 'utf8'));
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const erzeugt = ['index.html'];
  fs.writeFileSync(path.join(OUT_DIR, 'index.html'), indexSeite(), 'utf8');

  dateien.forEach(datei => {
    const slug = datei.replace(/\.md$/, '');
    const parsed = AR.parseFrontmatter(fs.readFileSync(path.join(POSTS_DIR, datei), 'utf8'));
    if (!parsed) {
      console.warn('[build-articles] Kein Frontmatter in ' + datei + ', uebersprungen.');
      return;
    }
    fs.writeFileSync(path.join(OUT_DIR, slug + '.html'), baueSeite(vorlage, slug, parsed.data, parsed.body), 'utf8');
    erzeugt.push(slug + '.html');
  });

  // Seiten von Artikeln entfernen, die es nicht mehr gibt
  if (typeof fs.unlinkSync === 'function') {
    fs.readdirSync(OUT_DIR)
      .filter(datei => datei.endsWith('.html') && erzeugt.indexOf(datei) === -1)
      .forEach(datei => {
        fs.unlinkSync(path.join(OUT_DIR, datei));
        console.log('[build-articles] entfernt: blog/' + datei);
      });
  }

  console.log('[build-articles] ' + (erzeugt.length - 1) + ' Artikelseiten unter blog/ erzeugt.');
}

if (require.main === module) main();

module.exports = { baueSeite };
