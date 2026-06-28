/* ============================================================
   BLOG-POSTS.JS — Liest Posts automatisch aus /posts/
   ============================================================ */

window.BLOG_POSTS = null;

const GITHUB_REPO   = 'sergen3108/The-Freescape-Project';
const GITHUB_BRANCH = 'main';

(async function () {

  let files = [];

  // 1. Versuche zuerst index.json
  try {
    const res = await fetch('/posts/index.json');
    if (res.ok) {
      files = await res.json();
    }
  } catch (e) {}

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
      console.warn('[blog-posts] GitHub API nicht erreichbar — nutze Fallback.');
    }
  }

  // 3. Fallback
  if (!files || files.length === 0) {
    window.BLOG_POSTS = FALLBACK_POSTS;
    document.dispatchEvent(new CustomEvent('blogPostsReady'));
    return;
  }

  // Posts laden
  const posts = [];
  await Promise.all(files.map(async (filename) => {
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

/* ── Frontmatter Parser ──────────────────────────────────── */
function parseFrontmatter(text, filename) {
  // \r\n (Windows) und \n (Unix) beide unterstützen
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const match = normalized.match(/^---\n([\s\S]*?)\n---/);
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
    const val = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
    if (val === '') {
      listKey = key;
    } else {
      listKey = null;
      data[key] = val;
    }
  });

  const id       = filename.replace(/\.md$/, '');
  const datum    = data.datum || new Date().toISOString().slice(0, 10);
  const land     = data.land || '';
  const typ      = data.typ  || 'guide';
  const tags     = Array.isArray(data.tags) ? data.tags : [];
  const landId   = land.toLowerCase().replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue');
  const kategorie = data.kategorie || [landId, typ].filter(Boolean).join(' ');

  const typLabels = {
    guide: 'Routen-Guide', kosten: 'Kosten-Check',
    safety: 'Sicherheit', persoenlich: 'Erfahrungsbericht'
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
    bildFallback: {
      emoji:    data.bildEmoji    || '✈️',
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
