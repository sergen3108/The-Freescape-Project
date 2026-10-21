#!/usr/bin/env node
/* ============================================================
   build-sa-map.js
   Berechnet die Laenderumrisse der Suedamerika-Karte auf der
   Startseite einmalig vor und schreibt sie nach sa-map-shapes.js.
   Die Startseite muss dadurch weder d3 (280 KB) noch die
   Weltkarte countries-110m.json (108 KB) laden.

   Nur noetig, wenn sich die Laenderliste in reise-config.js
   (REISE.suedamerika, Feld "iso") aendert. Status und Links
   der Laender kommen weiterhin live aus reise-config.js.

   Aufruf im Repo-Root: node scripts/build-sa-map.js
   ============================================================ */

'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const d3 = require(path.join(ROOT, 'assets', 'vendor', 'd3.min.js'));
const topojson = require(path.join(ROOT, 'assets', 'vendor', 'topojson-client.min.js'));
const OUT = path.join(ROOT, 'sa-map-shapes.js');

// Gleiche Flaeche wie das <svg viewBox="0 0 300 420"> in index.html
const WIDTH = 300;
const HEIGHT = 420;

// REISE aus reise-config.js lesen (Browser-Objekte werden nur
// angedeutet, damit das Skript ohne Fehler durchlaeuft)
const ctx = vm.createContext({ window: {}, document: { addEventListener() {} } });
const REISE = vm.runInContext(fs.readFileSync(path.join(ROOT, 'reise-config.js'), 'utf8') + '\n;REISE', ctx);
const isoSet = new Set(REISE.suedamerika.map(l => l.iso));

const world = JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'vendor', 'countries-110m.json'), 'utf8'));
const features = topojson.feature(world, world.objects.countries).features.filter(f => isoSet.has(+f.id));

const proj = d3.geoMercator().fitSize([WIDTH, HEIGHT], { type: 'FeatureCollection', features });
const pathGen = d3.geoPath().projection(proj).digits(1);
const round = n => Math.round(n * 10) / 10;

const shapes = features.map(f => {
  const [cx, cy] = pathGen.centroid(f);
  return { iso: +f.id, d: pathGen(f), cx: round(cx), cy: round(cy) };
});

const out =
  '/* Automatisch erzeugt von scripts/build-sa-map.js aus\n' +
  '   assets/vendor/countries-110m.json (Natural Earth, siehe\n' +
  '   assets/vendor/countries-110m.LICENSE.txt). Nicht von Hand bearbeiten. */\n' +
  'window.SA_MAP_SHAPES = ' + JSON.stringify(shapes) + ';\n';

fs.writeFileSync(OUT, out, 'utf8');
console.log(`sa-map-shapes.js geschrieben: ${shapes.length} Laender, ${Math.round(out.length / 1024)} KB.`);
