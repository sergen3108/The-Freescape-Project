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

   WICHTIG: keine Em-Dashes in Texten (Projekt-Stil).
   ============================================================ */

window.LAENDER = [
  {
    slug: 'kolumbien',
    name: 'Kolumbien',
    emoji: '🇨🇴',
    status: 'bereist',            // bereist | aktuell | geplant
    datei: 'kolumbien.html',      // null bei geplanten Laendern
    reihenfolge: 1,
    zeitraum: 'Feb bis Apr 2026',
    hook: 'Karibikstraende, Kaffeeberge und lebendige Grossstaedte, das Land das uns komplett ueberrascht hat.',
    tags: ['Karibik', 'Staedte', 'Berge', 'Budget', 'Abenteuer'],
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
    reihenfolge: 2,
    zeitraum: 'Apr bis Jun 2026',
    hook: 'Vulkane, Amazonas und Galapagos auf kleinem Raum, eines der abwechslungsreichsten Laender der Reise.',
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
    reihenfolge: 3,
    zeitraum: 'Jun bis Aug 2026',
    hook: 'Pazifikkueste, Wueste, Machu Picchu und der Colca Canyon, eines der intensivsten Laender der Reise.',
    tags: ['Strand', 'Berge', 'Wueste', 'Staedte', 'Abenteuer'],
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
    status: 'aktuell',
    datei: 'bolivien.html',
    reihenfolge: 4,
    zeitraum: 'ab Aug 2026',
    hook: 'Mit dem Bus von Puno über den Titicacasee nach Copacabana, ueber La Paz und Sucre nach Potosi, jetzt in Uyuni, dem Tor zum Salar de Uyuni.',
    tags: ['Wueste', 'Berge', 'Natur', 'Budget'],
    gradient: 'linear-gradient(135deg,#4a7fa0,#c8e8f5)',
    heroImage: 'assets/img/lapaz.jpeg',
    ogImage: 'https://thefreescapeproject.com/assets/img/lapaz.jpeg',
    vlogKeywords: ['bolivien', 'la paz', 'uyuni', 'sucre', 'copacabana', 'potosí', 'potosi', 'salar']
  },
  {
    slug: 'chile',
    name: 'Chile',
    emoji: '🏔️',
    status: 'geplant',
    datei: null,
    reihenfolge: 5,
    zeitraum: 'geplant',
    hook: 'Atacama-Wueste bis Patagonien, riesig und unglaublich vielfaeltig.',
    tags: ['Wueste', 'Berge', 'Natur', 'Abenteuer'],
    gradient: 'linear-gradient(135deg,#1a2d3d,#3d6080)',
    heroImage: null,
    ogImage: null,
    vlogKeywords: ['chile', 'atacama', 'santiago', 'torres del paine', 'valparaíso', 'valparaiso']
  },
  {
    slug: 'argentinien',
    name: 'Argentinien',
    emoji: '🥩',
    status: 'geplant',
    datei: null,
    reihenfolge: 6,
    zeitraum: 'geplant',
    hook: 'Buenos Aires, Patagonien und das beste Steak der Welt.',
    tags: ['Staedte', 'Berge', 'Natur', 'Kultur'],
    gradient: 'linear-gradient(135deg,#1a1a2e,#0f3460)',
    heroImage: null,
    ogImage: null,
    vlogKeywords: ['argentinien', 'buenos aires', 'patagonien', 'mendoza', 'bariloche', 'ushuaia', 'iguazú', 'iguazu']
  },
  {
    slug: 'brasilien',
    name: 'Brasilien',
    emoji: '🇧🇷',
    status: 'geplant',
    datei: null,
    reihenfolge: 7,
    zeitraum: 'geplant',
    hook: 'Regenwald, Straende und Rhythmus, der moegliche Abschluss unserer Reise.',
    tags: ['Strand', 'Dschungel', 'Staedte', 'Kultur'],
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
    reihenfolge: 8,
    zeitraum: 'geplant',
    hook: 'Kleines Land, entspanntes Tempo, Montevideo und die Strände von Punta del Este.',
    tags: ['Strand', 'Staedte', 'Entspannt'],
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
    reihenfolge: 9,
    zeitraum: 'geplant',
    hook: 'Wenig bereist, viel Ueberraschung, Asuncion und das Guarani-Erbe.',
    tags: ['Staedte', 'Kultur', 'Abenteuer'],
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

/* ── Nav-Dropdown + mobile Laenderliste aus der Konfig fuellen ─
   Haelt die Laenderliste auf ALLEN Seiten identisch, ohne dass
   jede Seite von Hand gepflegt werden muss. Das statische Markup
   im HTML bleibt als Fallback (falls JS aus ist) erhalten und
   wird hier nur aktualisiert. */
document.addEventListener('DOMContentLoaded', function () {
  var sortiert = window.laenderSortiert();
  var bereist  = sortiert.filter(function (l) { return l.status !== 'geplant'; });
  var geplant  = sortiert.filter(function (l) { return l.status === 'geplant'; });

  // Desktop-Dropdown
  document.querySelectorAll('.nav__dropdown-menu').forEach(function (menu) {
    var html = '<a href="laender.html" class="nav__dropdown-link" style="font-weight:600;">Alle Laender</a>'
      + '<div style="border-top:1px solid rgba(255,255,255,0.1);margin:4px 0;"></div>';
    bereist.forEach(function (l) {
      html += '<a href="' + l.datei + '" class="nav__dropdown-link">' + l.name + '</a>';
    });
    if (geplant.length) {
      html += '<div style="border-top:1px solid rgba(255,255,255,0.1);margin:4px 0;"></div>';
      geplant.forEach(function (l) {
        html += '<a href="laender.html#geplant" class="nav__dropdown-link" style="opacity:0.55;">' + l.name + '</a>';
      });
    }
    menu.innerHTML = html;
  });

  // Mobiles Menue: Laender-Untermenue (Button + Submenu) befuellen
  document.querySelectorAll('#nav-mobile-laender-submenu').forEach(function (submenu) {
    var html = '<a href="laender.html" class="nav__mobile-link nav__mobile-sublink">Alle Laender</a>';
    bereist.forEach(function (l) {
      html += '<a href="' + l.datei + '" class="nav__mobile-link nav__mobile-sublink">' + l.name + '</a>';
    });
    submenu.innerHTML = html;
  });

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
    if (label) label.textContent = bereist.length + ' von ' + sortiert.length + ' Laendern bereist';
    if (fill)  fill.style.width = pct + '%';
  });
});
