/* ============================================================
   LAENDER-CONFIG.JS: Einzige Wahrheit fuer alle Laender
   ------------------------------------------------------------
   Wird gelesen von:
     - dem Nav-Dropdown "Laender" (auf allen Seiten)
     - der Uebersicht laender.html (Karten, Filter, Zaehler)
     - den einzelnen Laenderseiten (kolumbien.html, ...)
     - vlog-utils.js (Laender-Erkennung ueber vlogKeywords)

   Neues Land ergaenzen: hier einen Eintrag hinzufuegen. Fuer ein
   bereistes/aktuelles Land zusaetzlich eine eigene <slug>.html
   anlegen (Kopie einer bestehenden Laenderseite) und in die
   sitemap.xml eintragen. Geplante Laender brauchen keine Seite.

   tage: Aufenthalte als [Start, Ende] (ISO-Datum). Ende null = laeuft
   noch, dann zaehlt main.js bis einschliesslich heute weiter (Anzeige
   "Tage im Land").
   Beim Weiterreisen: beim alten Land das Ende eintragen, beim neuen
   Land [['<Ankunft>', null]] setzen. Rueckkehr in ein Land = weiterer
   Eintrag in der Liste. Anzahl = Ende minus Start, summiert ueber alle
   Laender ergibt das die "Tage unterwegs" (Start 25.02.2026).

   WICHTIG: keine Em-Dashes in Texten (Projekt-Stil).
   ============================================================ */

window.LAENDER = [
  {
    slug: 'kolumbien',
    name: 'Kolumbien',
    emoji: '🇨🇴',
    status: 'bereist',            // bereist | aktuell | geplant
    datei: 'kolumbien.html',      // null bei geplanten Laendern
    kontinent: 'suedamerika',
    reihenfolge: 1,
    zeitraum: 'Feb bis Apr 2026',
    tage: [['2026-02-25', '2026-04-17']],
    hook: 'Karibikstrände, Kaffeeberge und lebendige Großstädte, das Land, das uns komplett überrascht hat.',
    tags: ['Karibik', 'Städte', 'Berge', 'Budget', 'Abenteuer'],
    gradient: 'linear-gradient(135deg,#c4622d,#1a2744)',
    heroImage: 'assets/img/blog/sanandres8.jpg',
    ogImage: 'https://thefreescapeproject.com/assets/img/blog/sanandres8.jpg',
    // Stichwoerter fuer die Vlog-Zuordnung (nur aus dem Titel!).
    vlogKeywords: [
      'kolumbien', 'bogotá', 'bogota', 'medellín', 'medellin', 'cartagena',
      'salento', 'cocora', 'guatapé', 'guatape', 'santa marta', 'minca',
      'tayrona', 'palomino', 'san andrés', 'san andres', 'costeño', 'costeno'
    ]
  },
  {
    slug: 'ecuador',
    name: 'Ecuador',
    emoji: '🇪🇨',
    status: 'bereist',
    datei: 'ecuador.html',
    kontinent: 'suedamerika',
    reihenfolge: 2,
    zeitraum: 'Apr bis Jun 2026',
    tage: [['2026-04-17', '2026-06-01']],
    hook: 'Vulkane, Amazonas und Galápagos auf kleinem Raum, eines der abwechslungsreichsten Länder der Reise.',
    tags: ['Berge', 'Dschungel', 'Natur', 'Inseln', 'Budget'],
    gradient: 'linear-gradient(135deg,#1a3c2a,#2d7a2d)',
    heroImage: 'assets/img/kilotoas.JPEG',
    ogImage: 'https://thefreescapeproject.com/assets/img/kilotoas.JPEG',
    vlogKeywords: [
      'ecuador', 'quito', 'cotopaxi', 'quilotoa', 'baños', 'banos',
      'mindo', 'amazonas', 'galápagos', 'galapagos', 'cuenca'
    ]
  },
  {
    slug: 'peru',
    name: 'Peru',
    emoji: '🇵🇪',
    status: 'bereist',
    datei: 'peru.html',
    kontinent: 'suedamerika',
    reihenfolge: 3,
    zeitraum: 'Jun bis Aug 2026',
    tage: [['2026-06-01', '2026-08-07']],
    hook: 'Pazifikküste, Wüste, Machu Picchu und der Colca Canyon, eines der intensivsten Länder der Reise.',
    tags: ['Strand', 'Berge', 'Wüste', 'Städte', 'Abenteuer'],
    gradient: 'linear-gradient(135deg,#8b3a15,#c4622d)',
    heroImage: 'assets/img/IMG_2934.JPEG',
    ogImage: 'https://thefreescapeproject.com/assets/img/IMG_2934.JPEG',
    // Achtung: 'titicaca' bewusst NICHT in der Liste (liegt zwischen
    // Peru und Bolivien, wuerde sonst falsch zuordnen).
    vlogKeywords: [
      'peru', 'perú', 'máncora', 'mancora', 'huanchaco', 'chan chan',
      'trujillo', 'huaraz', 'laguna 69', 'lima', 'miraflores', 'barranco',
      'cusco', 'machu picchu', 'machu', 'arequipa', 'paracas', 'huacachina',
      'nazca', 'puno', 'ollantaytambo', 'aguas calientes', 'rainbow mountain',
      'vinicunca', 'colca', 'canon del colca', 'cañon del colca'
    ]
  },
  {
    slug: 'bolivien',
    name: 'Bolivien',
    emoji: '🧂',
    status: 'bereist',
    datei: 'bolivien.html',
    kontinent: 'suedamerika',
    reihenfolge: 4,
    zeitraum: 'Aug bis Sep 2026',
    tage: [['2026-08-07', '2026-09-04']],
    hook: 'Vom Titicacasee über La Paz, Sucre und Potosí bis zur dreitägigen Tour durch den Salar de Uyuni.',
    tags: ['Wüste', 'Berge', 'Natur', 'Budget'],
    gradient: 'linear-gradient(135deg,#4a7fa0,#c8e8f5)',
    heroImage: 'assets/img/lapaz.jpeg',
    ogImage: 'https://thefreescapeproject.com/assets/img/lapaz.jpeg',
    vlogKeywords: ['bolivien', 'la paz', 'uyuni', 'sucre', 'copacabana', 'potosí', 'potosi', 'salar']
  },
  {
    slug: 'chile',
    name: 'Chile',
    emoji: '🏔️',
    status: 'bereist',
    datei: 'chile.html',
    kontinent: 'suedamerika',
    reihenfolge: 5,
    zeitraum: '04. bis 08. Sep und 03. Okt bis 09. Nov 2026',
    tage: [['2026-09-04', '2026-09-08'], ['2026-10-03', '2026-11-09']],
    hook: 'Von der Atacama-Wüste über Santiago, die Seenregion und Chiloé bis nach Patagonien, fast die ganze Länge des Landes.',
    tags: ['Wüste', 'Berge', 'Natur', 'Abenteuer'],
    gradient: 'linear-gradient(135deg,#1a2d3d,#3d6080)',
    heroImage: 'assets/img/ChileSterne.jpeg',
    ogImage: 'https://thefreescapeproject.com/assets/img/ChileSterne.jpeg',
    vlogKeywords: ['chile', 'atacama', 'san pedro de atacama', 'santiago', 'torres del paine', 'valparaíso', 'valparaiso', 'pucón', 'pucon', 'osterinsel', 'rapa nui', 'puerto varas', 'castro', 'chiloé', 'chiloe', 'ancud', 'puerto montt', 'puerto natales', 'patagonien', 'patagonia']
  },
  {
    slug: 'argentinien',
    name: 'Argentinien',
    emoji: '🥩',
    status: 'aktuell',
    datei: 'argentinien.html',
    kontinent: 'suedamerika',
    reihenfolge: 6,
    zeitraum: '08. Sep bis 03. Okt und ab 09. Nov 2026',
    tage: [['2026-09-08', '2026-10-03'], ['2026-11-09', null]],
    hook: 'Roadtrips durch den Norden, die Städte Córdoba, Rosario und Mendoza und Patagonien rund um El Calafate.',
    tags: ['Städte', 'Berge', 'Natur', 'Kultur'],
    gradient: 'linear-gradient(135deg,#1a1a2e,#0f3460)',
    heroImage: 'assets/img/SalinasGrandes.jpg',
    ogImage: 'https://thefreescapeproject.com/assets/img/SalinasGrandes.jpg',
    vlogKeywords: ['argentinien', 'salta', 'córdoba', 'cordoba', 'rosario', 'buenos aires', 'patagonien', 'mendoza', 'bariloche', 'ushuaia', 'iguazú', 'iguazu', 'el calafate', 'calafate', 'perito moreno']
  },
  {
    slug: 'brasilien',
    name: 'Brasilien',
    emoji: '🇧🇷',
    status: 'geplant',
    datei: null,
    kontinent: 'suedamerika',
    reihenfolge: 7,
    zeitraum: 'geplant',
    hook: 'Regenwald, Strände und Rhythmus, der mögliche Abschluss unserer Reise.',
    tags: ['Strand', 'Dschungel', 'Städte', 'Kultur'],
    gradient: 'linear-gradient(135deg,#0d2418,#2d5a3d)',
    heroImage: null,
    ogImage: null,
    // 'rio' allein bewusst NICHT (matcht "Rio Hostel" in Kolumbien),
    // 'copacabana' gehoert laut Zuordnung zu Bolivien.
    vlogKeywords: ['brasilien', 'brazil', 'rio de janeiro', 'são paulo', 'sao paulo', 'iguaçu', 'iguacu', 'salvador']
  },
  {
    slug: 'uruguay',
    name: 'Uruguay',
    emoji: '⚽',
    status: 'geplant',
    datei: null,
    kontinent: 'suedamerika',
    reihenfolge: 8,
    zeitraum: 'geplant',
    hook: 'Kleines Land, entspanntes Tempo, Montevideo und die Strände von Punta del Este.',
    tags: ['Strand', 'Städte', 'Entspannt'],
    gradient: 'linear-gradient(135deg,#2d5a7d,#7db9d4)',
    heroImage: null,
    ogImage: null,
    vlogKeywords: ['uruguay', 'montevideo', 'punta del este', 'colonia del sacramento']
  },
  {
    slug: 'paraguay',
    name: 'Paraguay',
    emoji: '🌾',
    status: 'geplant',
    datei: null,
    kontinent: 'suedamerika',
    reihenfolge: 9,
    zeitraum: 'geplant',
    hook: 'Wenig bereist, viel Überraschung, Asunción und das Guaraní-Erbe.',
    tags: ['Städte', 'Kultur', 'Abenteuer'],
    gradient: 'linear-gradient(135deg,#3d6b3d,#7db97d)',
    heroImage: null,
    ogImage: null,
    vlogKeywords: ['paraguay', 'asuncion', 'asunción', 'ciudad del este', 'encarnacion', 'encarnación']
  }
];

/* ── Geteilte Helfer ─────────────────────────────────────── */

// Klarnamen (z.B. "Kolumbien") in den slug ("kolumbien") wandeln.
// Gleiche Logik wie in blog-posts.js, damit post.land sauber matcht.
window.slugifyLand = function (name) {
  return (name || '')
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .trim();
};

window.laenderBySlug = function (slug) {
  return window.LAENDER.find(l => l.slug === slug) || null;
};

// Nach reihenfolge sortierte Kopie (fuer Dropdown/Uebersicht).
window.laenderSortiert = function () {
  return [...window.LAENDER].sort((a, b) => a.reihenfolge - b.reihenfolge);
};

/* ── Kontinente ──────────────────────────────────────────────
   Gruppierung im Nav-Menue "Reiseziele". Jedes Land oben hat ein
   Feld kontinent mit dem slug von hier. Neuer Kontinent: hier
   eintragen (seite = Uebersichtsseite des Kontinents), dann
   erscheint er automatisch als eigener Block im Menue. */
window.KONTINENTE = [
  { slug: 'suedamerika', name: 'Südamerika', seite: 'laender.html' }
];

/* ── Nav-Menue "Reiseziele" + mobile Liste aus der Konfig fuellen ─
   Haelt die Laenderliste auf ALLEN Seiten identisch, ohne dass
   jede Seite von Hand gepflegt werden muss. Das statische Markup
   im HTML bleibt als Fallback (falls JS aus ist) erhalten und
   wird hier nur aktualisiert. Nur die Menues mit diesen IDs werden
   angefasst, andere Dropdowns (z.B. "Reiseplanung") bleiben stehen. */
document.addEventListener('DOMContentLoaded', function () {
  var sortiert = window.laenderSortiert();
  var bereist  = sortiert.filter(function (l) { return l.status !== 'geplant'; });

  // Laender je Kontinent, Kontinente ohne Laender fallen weg
  var gruppen = window.KONTINENTE.map(function (k) {
    var laender = sortiert.filter(function (l) { return l.kontinent === k.slug; });
    return {
      kontinent: k,
      bereist: laender.filter(function (l) { return l.status !== 'geplant'; }),
      geplant: laender.filter(function (l) { return l.status === 'geplant'; })
    };
  }).filter(function (g) { return g.bereist.length || g.geplant.length; });

  // Desktop-Dropdown
  var menu = document.getElementById('nav-reiseziele-menu');
  if (menu) {
    var html = '<a href="laender.html" class="nav__dropdown-link nav__dropdown-link--alle">Alle Reiseziele</a>';
    gruppen.forEach(function (g) {
      html += '<div class="nav__dropdown-trenner"></div>'
        + '<a href="' + g.kontinent.seite + '" class="nav__dropdown-gruppe">' + g.kontinent.name + '</a>';
      g.bereist.forEach(function (l) {
        html += '<a href="' + l.datei + '" class="nav__dropdown-link">' + l.name + '</a>';
      });
      g.geplant.forEach(function (l) {
        html += '<a href="laender.html#geplant" class="nav__dropdown-link nav__dropdown-link--geplant">' + l.name + '</a>';
      });
    });
    menu.innerHTML = html;
  }

  // Mobiles Menue: Untermenue "Reiseziele" befuellen (nur bereiste Laender)
  var submenu = document.getElementById('nav-mobile-laender-submenu');
  if (submenu) {
    var mhtml = '<a href="laender.html" class="nav__mobile-link nav__mobile-sublink">Alle Reiseziele</a>';
    gruppen.forEach(function (g) {
      if (!g.bereist.length) return;
      mhtml += '<span class="nav__mobile-gruppe">' + g.kontinent.name + '</span>';
      g.bereist.forEach(function (l) {
        mhtml += '<a href="' + l.datei + '" class="nav__mobile-link nav__mobile-sublink">' + l.name + '</a>';
      });
    });
    submenu.innerHTML = mhtml;
  }

  // "Wo sind wir gerade?"-Box auf index.html: Laender-Chips + Fortschrittsbalken.
  // Gleiches Fallback-Prinzip wie oben: statisches Markup bleibt stehen,
  // falls dieser Block aus irgendeinem Grund nicht laeuft.
  var STATUS_CLASS  = { bereist: 'visited', aktuell: 'current', geplant: 'planned' };
  var STATUS_SUFFIX = { bereist: ' ✓', aktuell: ' ←', geplant: '' };
  document.querySelectorAll('.map-preview__countries').forEach(function (container) {
    container.innerHTML = sortiert.map(function (l) {
      return '<span class="country-chip country-chip--' + STATUS_CLASS[l.status] + '">'
        + l.name + STATUS_SUFFIX[l.status] + '</span>';
    }).join('');
  });
  document.querySelectorAll('.map-preview__progress').forEach(function (progress) {
    var pct   = Math.round((bereist.length / sortiert.length) * 100);
    var label = progress.querySelector('.map-preview__progress-label');
    var fill  = progress.querySelector('.progress-bar__fill');
    if (label) label.textContent = bereist.length + ' von ' + sortiert.length + ' Ländern bereist';
    if (fill)  fill.style.width = pct + '%';
  });
});
