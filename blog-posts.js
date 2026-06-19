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
  let multilineKey = null;
  let multilineVal = '';

  lines.forEach((line, i) => {
    // Fortsetzung eines mehrzeiligen Wertes (Zeile beginnt mit Leerzeichen, kein Listenelement)
    if (multilineKey && line.match(/^\s+/) && !line.match(/^\s{2}-\s/)) {
      multilineVal += ' ' + line.trim();
      // Wenn nächste Zeile kein Fortsetzungs-Einzug mehr → abschließen
      const next = lines[i + 1];
      if (!next || !next.match(/^\s+/) || next.match(/^\s{2}-\s/)) {
        data[multilineKey] = multilineVal.trim().replace(/^["']|["']$/g, '');
        multilineKey = null;
        multilineVal = '';
      }
      return;
    }

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
      listKey = key;
    } else {
      listKey = null;
      // Prüfen ob nächste Zeile eine Fortsetzung ist
      const next = lines[i + 1];
      if (next && next.match(/^\s+/) && !next.match(/^\s{2}-\s/)) {
        multilineKey = key;
        multilineVal = val;
      } else {
        data[key] = val;
      }
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
    land,
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
/* ── Fallback-Posts ─────────────────────────────────────── */
const FALLBACK_POSTS = [];
