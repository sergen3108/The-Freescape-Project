/* ============================================================
   LAENDER-CONFIG.JS — Einzige Wahrheit fuer alle Laender
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
    heroImage: 'assets/img/penol.jpg',
    ogImage: 'https://thefreescapeproject.com/assets/img/penol.jpg',
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
    status: 'aktuell',
    datei: 'peru.html',
    reihenfolge: 3,
    zeitraum: 'ab Jun 2026',
    hook: 'Pazifikkueste, Wueste und die Anden, wir sind gerade mitten drin.',
    tags: ['Strand', 'Berge', 'Wueste', 'Staedte', 'Abenteuer'],
    gradient: 'linear-gradient(135deg,#8b3a15,#c4622d)',
    heroImage: 'assets/vlog-thumbs/WwfPpYbr3jw.jpg',
    ogImage: 'https://thefreescapeproject.com/assets/vlog-thumbs/WwfPpYbr3jw.jpg',
    // Achtung: 'titicaca' bewusst NICHT in der Liste (liegt zwischen
    // Peru und Bolivien, wuerde sonst falsch zuordnen).
    vlogKeywords: [
      'peru', 'perú', 'máncora', 'mancora', 'huanchaco', 'chan chan',
      'trujillo', 'huaraz', 'laguna 69', 'lima', 'miraflores', 'barranco',
      'cusco', 'machu picchu', 'machu', 'arequipa', 'paracas', 'huacachina',
      'nazca', 'puno'
    ]
  },
  {
    slug: 'bolivien',
    name: 'Bolivien',
    emoji: '🧂',
    status: 'geplant',
    datei: null,
    reihenfolge: 4,
    zeitraum: 'geplant',
    hook: 'Salar de Uyuni und die hoechste Hauptstadt der Welt, das wartet noch auf uns.',
    tags: ['Wueste', 'Berge', 'Natur', 'Budget'],
    gradient: 'linear-gradient(135deg,#4a7fa0,#c8e8f5)',
    heroImage: null,
    ogImage: null,
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

  // Mobiles Menue: den Block zwischen der "Laender"-Ueberschrift
  // und dem YouTube-Link ersetzen.
  document.querySelectorAll('.nav__mobile').forEach(function (mob) {
    var heading = Array.prototype.find.call(
      mob.children,
      function (el) { return el.textContent.trim() === 'Länder' || el.textContent.trim() === 'Laender'; }
    );
    if (!heading) return;
    // Alte Laender-Links direkt nach der Ueberschrift entfernen
    var next = heading.nextElementSibling;
    while (next && next.classList.contains('nav__mobile-link') &&
           next.getAttribute('href') && next.getAttribute('href').indexOf('laender.html') === 0) {
      var toRemove = next;
      next = next.nextElementSibling;
      toRemove.remove();
    }
    // Neue Links (bereiste/aktuelle Laender) einfuegen
    var frag = document.createDocumentFragment();
    var alle = document.createElement('a');
    alle.href = 'laender.html';
    alle.className = 'nav__mobile-link';
    alle.textContent = 'Alle Laender';
    frag.appendChild(alle);
    bereist.forEach(function (l) {
      var a = document.createElement('a');
      a.href = l.datei;
      a.className = 'nav__mobile-link';
      a.textContent = l.name;
      frag.appendChild(a);
    });
    heading.parentNode.insertBefore(frag, heading.nextSibling);
  });
});
