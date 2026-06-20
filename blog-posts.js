/* ============================================================
   BLOG-POSTS.JS — Liest Posts automatisch aus /posts/ via
   GitHub API (kein manuelles index.json nötig)
   ============================================================ */

window.BLOG_POSTS = null;

// ✏️ Dein GitHub-Repository (Nutzer/Repo-Name)
const GITHUB_REPO = 'sergen3108/The-Freescape-Project';
const GITHUB_BRANCH = 'main';

(async function () {

  let files = [];

  // 1. Versuche zuerst index.json (schneller, offline-fähig)
  try {
    const res = await fetch('/posts/index.json');
    if (res.ok) {
      files = await res.json();
    }
  } catch (e) {}

  // 2. Falls index.json leer oder fehlt → GitHub API nutzen
  if (!files || files.length === 0) {
    try {
      const apiUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/posts?ref=${GITHUB_BRANCH}`;
      const res = await fetch(apiUrl);
      if (res.ok) {
        const contents = await res.json();
        files = contents
          .filter(f => f.name.endsWith('.md'))
          .map(f => f.name);
      }
    } catch (e) {
      console.warn('[blog-posts] GitHub API nicht erreichbar — nutze Fallback-Daten.');
    }
  }

  // 3. Falls alles fehlschlägt → Fallback
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
      console.warn(`[blog-posts] Fehler beim Laden: ${filename}`, e);
    }
  }));

  posts.sort((a, b) => new Date(b.datum) - new Date(a.datum));
  window.BLOG_POSTS = posts;
  document.dispatchEvent(new CustomEvent('blogPostsReady'));

})();

/* ── Frontmatter Parser ────────────────────────────────────── */
function parseFrontmatter(text, filename) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
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

  const id      = filename.replace(/\.md$/, '');
  const datum   = data.datum || new Date().toISOString().slice(0, 10);
  const land    = data.land || '';
  const typ     = data.typ  || 'guide';
  const tags    = Array.isArray(data.tags) ? data.tags : [];

  const landId  = land.toLowerCase()
    .replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ü/g,'ue');
  const kategorie = data.kategorie || [landId, typ].filter(Boolean).join(' ');

  const typLabels = {
    guide: 'Routen-Guide', kosten: 'Kosten-Check',
    safety: 'Sicherheit', persoenlich: 'Erfahrungsbericht'
  };

  return {
    id,
    datum,
    datumLabel:   formatDatum(datum),
    lesezeit:     data.lesezeit  || '5 min',
    autor:        data.autor     || 'Sergen & Julia',
    kategorie,
    typ,
    typLabel:     typLabels[typ] || 'Artikel',
    land:         land,
    titel:        data.titel     || '(Kein Titel)',
    teaser:       data.teaser    || '',
    tags,
    bild:         data.bild      || null,
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

/* ── Fallback-Posts ─────────────────────────────────────────── */
const FALLBACK_POSTS = [
  {
    id: "machu-picchu",
    datum: "2026-06-01", datumLabel: "Juni 2026", lesezeit: "7 min",
    autor: "Sergen & Julia", kategorie: "peru guide", typ: "guide",
    typLabel: "Routen-Guide", land: "Peru",
    titel: "Machu Picchu besuchen: Tickets, Timing & die Fehler, die wir gemacht haben",
    teaser: "Tickets sind Wochen im Voraus weg. Wir erklären, welches Ticket wir genommen haben, ob der Huayna-Picchu-Aufstieg lohnt — und was wir anders machen würden.",
    tags: ["Machu Picchu","Peru","Inka","Sehenswürdigkeit"],
    bild: "https://img.youtube.com/vi/xoa1NgiW6pY/maxresdefault.jpg",
    bildFallback: { emoji: "🏛️", gradient: "linear-gradient(135deg,#1a2744,#e8431a)" },
    link: "artikel.html?post=machu-picchu"
  },
  {
    id: "galapagos-kosten",
    datum: "2026-05-01", datumLabel: "Mai 2026", lesezeit: "6 min",
    autor: "Sergen & Julia", kategorie: "galapagos kosten", typ: "kosten",
    typLabel: "Kosten-Check", land: "Galapagos",
    titel: "Galapagos auf Budget: Was kostet ein Besuch wirklich?",
    teaser: "Galapagos gilt als das teuerste Ziel Südamerikas — aber günstig ist es trotzdem möglich.",
    tags: ["Galapagos","Budget","Kosten","Ecuador"],
    bild: "https://img.youtube.com/vi/LuasGvIhZm8/maxresdefault.jpg",
    bildFallback: { emoji: "🐢", gradient: "linear-gradient(135deg,#1a5c1a,#2e8c2e)" },
    link: "artikel.html?post=galapagos-kosten"
  }
];
