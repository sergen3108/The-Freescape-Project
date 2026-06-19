/* ============================================================
   BLOG-POSTS.JS — Liest Posts aus /posts/*.md (Decap CMS)
   Wird von index.html (Vorschau, 3 neueste) und
   blog.html (alle Posts) genutzt.
   ============================================================ */

window.BLOG_POSTS = null;

(async function () {

  let files = [];
  try {
    const res = await fetch('/posts/index.json');
    if (res.ok) files = await res.json();
  } catch (e) {
    console.warn('[blog-posts] Kein /posts/index.json — nutze Fallback-Daten.');
  }

  if (files.length === 0) {
    window.BLOG_POSTS = FALLBACK_POSTS;
    document.dispatchEvent(new CustomEvent('blogPostsReady'));
    return;
  }

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
    // YAML-Listenelement: "  - Wert"
    const listMatch = line.match(/^\s{2}-\s(.+)/);
    if (listMatch && listKey) {
      if (!Array.isArray(data[listKey])) data[listKey] = [];
      data[listKey].push(listMatch[1].trim());
      return;
    }

    // Normales Key: Value
    const sep = line.indexOf(':');
    if (sep === -1) { listKey = null; return; }
    const key = line.slice(0, sep).trim();
    const val = line.slice(sep + 1).trim().replace(/^["']|["']$/g, '');
    if (val === '') {
      listKey = key; // nächste Zeilen könnten Listenelemente sein
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

  // Kategorie für Filter: "kolumbien guide" etc.
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

/* ── Fallback-Posts (solange noch kein CMS aktiv) ─────────── */
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
  },
  {
    id: "kolumbien-sicherheit",
    datum: "2026-03-10", datumLabel: "März 2026", lesezeit: "8 min",
    autor: "Sergen & Julia", kategorie: "kolumbien safety", typ: "safety",
    typLabel: "Sicherheit", land: "Kolumbien",
    titel: "Kolumbien sicher bereisen: Was wir wirklich erlebt haben",
    teaser: "Ist Kolumbien gefährlich? Wir geben ehrliche Antworten aus 8 Wochen Reise.",
    tags: ["Kolumbien","Sicherheit","Reisetipps"],
    bild: null,
    bildFallback: { emoji: "🇨🇴", gradient: "linear-gradient(135deg,#1a4a1a,#e8c31a)" },
    link: "artikel.html?post=kolumbien-sicherheit"
  },
  {
    id: "guatape-bus",
    datum: "2026-03-05", datumLabel: "März 2026", lesezeit: "5 min",
    autor: "Sergen & Julia", kategorie: "kolumbien guide", typ: "guide",
    typLabel: "Routen-Guide", land: "Kolumbien",
    titel: "Von Medellín nach Guatapé: Mit dem Bus — günstig & flexibel",
    teaser: "Terminal del Norte, 2,5 Stunden, 15.000–25.000 COP — alles was du brauchst, ohne Tour zu buchen.",
    tags: ["Kolumbien","Medellín","Guatapé","Bus","Tagesausflug"],
    bild: null,
    bildFallback: { emoji: "🗿", gradient: "linear-gradient(135deg,#1a2744,#2e4acc)" },
    link: "artikel.html?post=guatape-bus"
  },
  {
    id: "san-andres",
    datum: "2026-04-01", datumLabel: "April 2026", lesezeit: "4 min",
    autor: "Sergen & Julia", kategorie: "kolumbien kosten", typ: "kosten",
    typLabel: "Kosten-Check", land: "Kolumbien",
    titel: "San Andrés: Das Meer der 7 Farben & alles was du wissen musst",
    teaser: "Früh morgens raus, Scooter mieten, Preise einplanen — unsere ehrlichen Tipps für die Karibikinsel.",
    tags: ["San Andrés","Karibik","Kolumbien","Strand"],
    bild: null,
    bildFallback: { emoji: "🏖️", gradient: "linear-gradient(135deg,#006994,#00a8d4)" },
    link: "artikel.html?post=san-andres"
  },
  {
    id: "ecuador-vulkane",
    datum: "2026-04-15", datumLabel: "April 2026", lesezeit: "6 min",
    autor: "Sergen & Julia", kategorie: "ecuador guide", typ: "guide",
    typLabel: "Routen-Guide", land: "Ecuador",
    titel: "Cotopaxi & Quilotoa: Vulkane und Kraterseen in Ecuador",
    teaser: "Schneebedeckte Vulkane, eine smaragdgrüne Caldera und endlose Andenpanoramen — so erreichst du die Highlights.",
    tags: ["Ecuador","Cotopaxi","Vulkan","Nationalpark","Anden"],
    bild: null,
    bildFallback: { emoji: "🌋", gradient: "linear-gradient(135deg,#3a1a1a,#8c2e2e)" },
    link: "artikel.html?post=ecuador-vulkane"
  },
  {
    id: "minca",
    datum: "2026-03-20", datumLabel: "März 2026", lesezeit: "5 min",
    autor: "Sergen & Julia", kategorie: "kolumbien persoenlich", typ: "persoenlich",
    typLabel: "Erfahrungsbericht", land: "Kolumbien",
    titel: "Minca: Das kleine Bergdorf, das uns überrascht hat",
    teaser: "Wasserfälle, Vogelbeobachtung und eine Ruhe, die man in keiner Großstadt findet — Minca ist ein verstecktes Juwel.",
    tags: ["Kolumbien","Minca","Natur","Bergdorf","Erholung"],
    bild: null,
    bildFallback: { emoji: "🌿", gradient: "linear-gradient(135deg,#1a3c2a,#2d7a2d)" },
    link: "artikel.html?post=minca"
  }
];
