#!/usr/bin/env node
/* ============================================================
   sync-partials.js
   Haelt Navigation, Footer und Cookie-Banner auf allen Seiten
   identisch. Die Vorlagen liegen in partials/:

     partials/nav.html            Navigation (Desktop + mobil)
     partials/footer.html         Footer
     partials/cookie-banner.html  Cookie-Banner

   In jeder Seite steht der Baustein zwischen zwei Markern:

     <!-- partial:footer (wird aus partials/footer.html erzeugt, nicht hier bearbeiten) -->
     ...
     <!-- /partial:footer -->

   Dieses Skript ersetzt alles zwischen den Markern durch die
   Vorlage. Die Seiten bleiben vollstaendige HTML-Dateien, lokale
   Vorschau und Handpflege aendern sich nicht. Wer Navigation oder
   Footer aendern will, aendert NUR die Datei in partials/.

   Angaben im Start-Marker der Navigation (beide optional):
     aktiv="blog.html"     Menuepunkt mit diesem data-page wird
                           als aktiv markiert
     klasse="nav--solid"   Klasse am <nav> (Standard:
                           nav--transparent)

   Laeuft automatisch per GitHub Action bei Aenderungen an den
   Vorlagen oder Seiten. Aufruf im Repo-Root:
     node scripts/sync-partials.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const PARTIALS_DIR = path.join(ROOT, 'partials');
const MARKER = /(<!-- partial:([\w-]+)([^>]*?)-->)[\s\S]*?(<!-- \/partial:\2 -->)/g;

// key="value"-Angaben aus dem Start-Marker lesen
function leseAngaben(text) {
  const angaben = {};
  text.replace(/([\w-]+)="([^"]*)"/g, (m, key, value) => { angaben[key] = value; return m; });
  return angaben;
}

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Navigation: Klasse am <nav> setzen und den aktiven Menuepunkt markieren
function renderNav(vorlage, angaben) {
  let html = vorlage.replace('{{klasse}}', angaben.klasse || 'nav--transparent');
  if (angaben.aktiv) {
    const re = new RegExp('class="([^"]*)"((?:\\s+[\\w-]+="[^"]*")*?\\s+data-page="' + escapeRegExp(angaben.aktiv) + '")');
    html = html.replace(re, 'class="$1 active"$2');
  }
  return html;
}

// Alle Bausteine einer Seite ersetzen. Zeilenenden der Seite bleiben erhalten.
function syncPage(html, partials) {
  const eol = html.indexOf('\r\n') !== -1 ? '\r\n' : '\n';
  return html.replace(MARKER, (match, start, name, rest, ende) => {
    if (!(name in partials)) return match;
    let body = partials[name];
    if (name === 'nav') body = renderNav(body, leseAngaben(rest));
    body = body.replace(/\r\n/g, '\n').replace(/\n+$/, '').replace(/\n/g, eol);
    return start + eol + body + eol + ende;
  });
}

function ladePartials() {
  const partials = {};
  fs.readdirSync(PARTIALS_DIR)
    .filter(datei => datei.endsWith('.html'))
    .forEach(datei => {
      partials[datei.replace(/\.html$/, '')] = fs.readFileSync(path.join(PARTIALS_DIR, datei), 'utf8');
    });
  return partials;
}

function main() {
  const partials = ladePartials();
  const seiten = fs.readdirSync(ROOT).filter(datei => datei.endsWith('.html'));
  let geaendert = 0;
  let mitMarkern = 0;
  seiten.forEach(datei => {
    const pfad = path.join(ROOT, datei);
    const alt = fs.readFileSync(pfad, 'utf8');
    if (alt.indexOf('<!-- partial:') === -1) return;
    mitMarkern++;
    const neu = syncPage(alt, partials);
    if (neu !== alt) {
      fs.writeFileSync(pfad, neu, 'utf8');
      geaendert++;
      console.log('[sync-partials] aktualisiert: ' + datei);
    }
  });
  console.log('[sync-partials] ' + mitMarkern + ' Seiten mit Bausteinen, ' + geaendert + ' aktualisiert.');
}

if (require.main === module) main();

module.exports = { syncPage, renderNav, leseAngaben };
