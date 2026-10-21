/* ============================================================
   BLOG-POSTS.JS: Liest Posts automatisch aus /posts/
   ============================================================ */

window.BLOG_POSTS = null;

const GITHUB_REPO   = 'sergen3108/The-Freescape-Project';
const GITHUB_BRANCH = 'main';

(async function () {

  let files = [];
  let meta = {};

  // 1. index.json (Liste der Artikel) und posts-meta.json (fertig
  //    ausgelesene Frontmatter aller Artikel, erzeugt von
  //    scripts/generate-feeds.js) parallel laden
  const getJson = url => fetch(url).then(r => (r.ok ? r.json() : null)).catch(() => null);
  const [index, metaList] = await Promise.all([
    getJson('/posts/index.json'),
    getJson('/posts/posts-meta.json')
  ]);
  if (Array.isArray(index)) files = index;
  if (Array.isArray(metaList)) {
    metaList.forEach(m => { if (m && m.datei && m.data) meta[m.datei] = m.data; });
  }

  // 2. Falls index.json leer → GitHub API
  if (!files || files.length === 0) {
    try {
      const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/posts?ref=${GITHUB_BRANCH}`);
      if (res.ok) {
        const contents = await res.json();
        files = contents
          .filter(f => f.name.endsWith('.md'))
          .map(f => f.name);
      }
    } catch (e) {
      console.warn('[blog-posts] GitHub API nicht erreichbar, nutze Fallback.');
    }
  }

  // 3. Fallback
  if (!files || files.length === 0) {
    window.BLOG_POSTS = FALLBACK_POSTS;
    document.dispatchEvent(new CustomEvent('blogPostsReady'));
    return;
  }

  // Posts laden. Kopfdaten kommen aus posts-meta.json; nur Artikel,
  // die dort (noch) fehlen, werden einzeln geholt. Das betrifft z.B.
  // einen gerade gepushten Artikel, bevor die Action posts-meta.json
  // neu erzeugt hat.
  const posts = [];
  await Promise.all(files.map(async (filename) => {
    if (meta[filename]) {
      posts.push(buildPost(meta[filename], filename));
      return;
    }
    try {
      const res = await fetch(`/posts/${filename}`);
      if (!res.ok) return;
      const text = await res.text();
      const post = parseFrontmatter(text, filename);
      if (post) posts.push(post);
    } catch (e) {
      console.warn(`[blog-posts] Fehler: ${filename}`, e);
    }
  }));

  posts.sort((a, b) => new Date(b.datum) - new Date(a.datum));
  window.BLOG_POSTS = posts;
  document.dispatchEvent(new CustomEvent('blogPostsReady'));

})();

/* ── Frontmatter Parser (roh) ────────────────────────────────
   Liest nur die "key: value" / Listen-Syntax zwischen den beiden
   "---" ein und liefert die rohen Daten + den Body-Text danach.
   Geteilt mit artikel.html, damit die Parse-Logik nur einmal
   existiert (siehe parseFrontmatter() weiter unten fuer die
   Blog-Karten-spezifische Nachbearbeitung). ─────────────────── */
function parseFrontmatterRaw(text) {
  // \r\n (Windows) und \n (Unix) beide unterstützen
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return null;

  const data = {};
  const lines = match[1].split('\n');
  let listKey = null;

  lines.forEach(line => {
    const listMatch = line.match(/^\s{2}-\s(.+)/);
    if (listMatch && listKey) {
      if (!Array.isArray(data[listKey])) data[listKey] = [];
      data[listKey].push(listMatch[1].trim());
      return;
    }

    const sep = line.indexOf(':');
    if (sep === -1) { listKey = null; return; }
    const key = line.slice(0, sep).trim();
    const rawVal = line.slice(sep + 1).trim();
    const val = rawVal.replace(/^["']|["']$/g, '');
    if (rawVal === '') {
      listKey = key;
    } else {
      listKey = null;
      data[key] = val;
    }
  });

  return { data, body: match[2] || '' };
}

/* ── Frontmatter Parser (fuer Blog-Karten) ───────────────────
   Baut auf parseFrontmatterRaw() auf und ergaenzt die Felder, die
   nur die Blog-Uebersicht/Karten brauchen (kategorie, typLabel, link). */
function parseFrontmatter(text, filename) {
  const parsed = parseFrontmatterRaw(text);
  if (!parsed) return null;
  return buildPost(parsed.data, filename);
}

/* Vorschaubild zu einem Foto: assets/img/x.jpg -> assets/img/thumbs/x.jpg
   (erzeugt von scripts/optimize-images.js). Andere Pfade bleiben, wie
   sie sind. Fehlt ein Vorschaubild, faellt main.js aufs Original zurueck. */
function thumbOf(src) {
  const m = /^\/?assets\/img\/(?!thumbs\/)(.+\.jpe?g)$/i.exec(src || '');
  return m ? 'assets/img/thumbs/' + m[1] : src;
}

function buildPost(data, filename) {
  const id       = filename.replace(/\.md$/, '');
  const datum    = data.datum || new Date().toISOString().slice(0, 10);
  const land     = data.land || '';
  const typ      = data.typ  || 'guide';
  const tags     = Array.isArray(data.tags) ? data.tags : [];
  const landId   = land.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue');
  const kategorie = data.kategorie || [landId, typ].filter(Boolean).join(' ');

  const typLabels = {
    guide: 'Routen-Guide', kosten: 'Kosten-Check',
    safety: 'Sicherheit', persoenlich: 'Erfahrungsbericht',
    reiseroute: 'Reiseroute'
  };

  return {
    id,
    datum,
    datumLabel:  formatDatum(datum),
    lesezeit:    data.lesezeit  || '5 min',
    autor:       data.autor     || 'Sergen & Julia',
    kategorie,
    typ,
    typLabel:    typLabels[typ] || 'Artikel',
    land,
    titel:       data.titel    || '(Kein Titel)',
    teaser:      data.teaser   || '',
    tags,
    bild:        data.bild     || null,
    bildKlein:   data.bild ? thumbOf(data.bild) : null,
    bildFallback: {
      emoji:    data.bildEmoji !== undefined ? data.bildEmoji : '✈️',
      gradient: data.bildGradient || 'linear-gradient(135deg,#1a2744,#e8431a)'
    },
    link: `artikel.html?post=${id}`
  };
}

function formatDatum(iso) {
  const m = ['Januar','Februar','März','April','Mai','Juni',
             'Juli','August','September','Oktober','November','Dezember'];
  const d = new Date(iso + 'T12:00:00');
  return `${m[d.getMonth()]} ${d.getFullYear()}`;
}

/* ── Fallback-Posts ──────────────────────────────────────── */
const FALLBACK_POSTS = [];
