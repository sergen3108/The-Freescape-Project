/* ============================================================
   VLOG-UTILS.JS: Geteilte Vlog-Helfer
   ------------------------------------------------------------
   Laender-Erkennung fuer Videos, zentral statt in jeder Seite
   dupliziert. Genutzt von vlogs.html, index.html und den
   Laenderseiten.

   - Das LAND wird NUR aus dem Titel bestimmt (dort eindeutig,
     z.B. "Backpacking Peru", "2 Monate Ecuador"). Die Beschreibung
     wird bewusst nicht nach Laendern durchsucht, weil dort oft
     mehrere vorkommen (Routenhinweise, Hashtags).
   - Der ORT wird aus der Beschreibung gezogen (optional), zuerst
     aus einer Zeile mit dem Pin-Symbol.
   - Stichwortlisten stehen in laender-config.js (vlogKeywords),
     also neue Laender einfach dort ergaenzen.

   Braucht: laender-config.js (window.LAENDER) davor geladen.
   ============================================================ */

(function () {
  'use strict';

  // Wortgrenzen-Match, damit kurze Stichwoerter nicht in anderen
  // Woertern zuenden (z.B. "lima" nicht in "Klima", "rio" nicht in
  // "Rio Hostel" wenn nicht als eigenes Wort gelistet).
  // Fertige Ausdruecke pro Stichwort merken, statt sie bei jedem Video
  // und jedem Land neu zu bauen (null = Browser kann \p{...} nicht).
  var keywordRegex = Object.create(null);
  function matchesKeyword(text, kw) {
    if (!(kw in keywordRegex)) {
      var esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      try {
        keywordRegex[kw] = new RegExp('(?:^|[^\\p{L}\\p{N}])' + esc + '(?:[^\\p{L}\\p{N}]|$)', 'iu');
      } catch (e) {
        keywordRegex[kw] = null;
      }
    }
    var re = keywordRegex[kw];
    // Sehr alte Browser ohne Unicode-Property-Escapes: Fallback
    return re ? re.test(text) : text.toLowerCase().indexOf(kw.toLowerCase()) !== -1;
  }

  // Land (slug) aus dem Video-Titel. Gibt null zurueck, wenn kein
  // Suedamerika-Land passt (alte Japan-/Mongolei-Clips, Intro).
  function detectCountry(title) {
    if (!title || !Array.isArray(window.LAENDER)) return null;
    var laender = window.laenderSortiert ? window.laenderSortiert() : window.LAENDER;
    for (var i = 0; i < laender.length; i++) {
      var land = laender[i];
      var kws = land.vlogKeywords || [];
      for (var k = 0; k < kws.length; k++) {
        if (matchesKeyword(title, kws[k])) return land.slug;
      }
    }
    return null;
  }

  // Einen Ortseintrag saeubern: Aufzaehlungszeichen vorne, Klammerzusatz
  // und angehaengtes Land hinten weg ("• Cusco, Peru" -> "Cusco",
  // "Rainbow Mountain (Vinicunca)" -> "Rainbow Mountain"). Ein reiner
  // Laendername ("• Bolivien") ergibt einen leeren Text.
  function cleanOrt(s) {
    s = s.replace(/^[•\-\u2013\u2014*]\s*/, '').replace(/\s*\([^)]*\)\s*$/, '').trim();
    if (Array.isArray(window.LAENDER)) {
      window.LAENDER.forEach(function (land) {
        var re = new RegExp('\\s*,?\\s*' + land.name + '\\s*$', 'i');
        s = s.replace(re, '').trim();
      });
    }
    return s;
  }

  var ORT_LABEL = /^(orte in diesem video|orte im video|orte|ort)\s*:?\s*/i;

  // Ort aus der Beschreibung: die Zeile mit 📍. Entweder steht der Ort
  // direkt dahinter ("📍 Máncora, Peru", "📍 Ort: Cuenca, Ecuador") oder
  // als Aufzaehlung in den Folgezeilen ("📍 Orte in diesem Video:").
  // Sonst null. Der Ort ist optional, das Land ist Pflicht.
  function detectOrt(description) {
    if (!description) return null;
    var lines = description.replace(/\r\n/g, '\n').split('\n');

    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('📍') === -1) continue;
      var s = lines[i].split('📍').slice(1).join('📍').trim();
      var hatLabel = ORT_LABEL.test(s);
      // Label vorne weg ("Orte in diesem Video:", "Orte im Video:", "Ort:")
      s = s.replace(ORT_LABEL, '').trim();

      if (!s && hatLabel) {
        // Die Orte stehen als Aufzaehlung in den Folgezeilen (bis zur
        // naechsten Leerzeile). Die ersten zwei reichen fuer die Karte.
        var orte = [];
        for (var j = i + 1; j < lines.length && orte.length < 2; j++) {
          if (!lines[j].trim()) break;
          var ort = cleanOrt(lines[j].trim());
          if (ort) orte.push(ort);
        }
        return orte.join(', ') || null;
      }
      // Anderes Label ohne Ort dahinter (z.B. "Bisher bereist:"): kein Ort
      if (/:$/.test(s)) return null;
      return cleanOrt(s) || null;
    }
    return null;
  }

  // Short oder normales Video? Wie bisher ueber die Dauer.
  function isShort(video) {
    return (video && (video.duration || 999) <= 120);
  }

  // Bestes Blogpost-Match zu einem Video: gleiches Land (Pflicht), nach
  // Moeglichkeit zusaetzlich ein Post-Tag (Ortsname) im Videotitel/-text
  // gefunden. Erwartet Post-Objekte wie window.BLOG_POSTS (Feld "land",
  // "tags"). Fuer den "Passendes Video ansehen"-Teaser (Blog -> Vlog).
  function findMatchingPost(video, posts) {
    if (!video || !Array.isArray(posts) || !posts.length) return null;
    var country = detectCountry(video.title);
    if (!country || !window.slugifyLand) return null;
    var candidates = posts.filter(function (p) { return window.slugifyLand(p.land) === country; });
    if (!candidates.length) return null;
    var haystack = (video.title || '') + ' ' + (video.description || '');
    for (var i = 0; i < candidates.length; i++) {
      var tags = candidates[i].tags || [];
      for (var t = 0; t < tags.length; t++) {
        if (tags[t].length > 2 && matchesKeyword(haystack, tags[t])) return candidates[i];
      }
    }
    return candidates[0];
  }

  // Umgekehrte Richtung: bestes Video-Match zu einem Blogpost. Fuer den
  // "Zum Blogartikel"-Link auf Vlog-Karten (Vlog -> Blog).
  function findMatchingVideo(post, videos) {
    if (!post || !Array.isArray(videos) || !videos.length || !window.slugifyLand) return null;
    var country = window.slugifyLand(post.land || '');
    if (!country) return null;
    var candidates = videos.filter(function (v) { return detectCountry(v.title) === country; });
    if (!candidates.length) return null;
    var tags = post.tags || [];
    for (var i = 0; i < candidates.length; i++) {
      var haystack = (candidates[i].title || '') + ' ' + (candidates[i].description || '');
      for (var t = 0; t < tags.length; t++) {
        if (tags[t].length > 2 && matchesKeyword(haystack, tags[t])) return candidates[i];
      }
    }
    return candidates[0];
  }

  // Kann der Browser Flaggen-Emojis darstellen? Windows zeigt statt der
  // Flagge nur die zwei Laenderbuchstaben ("BO", "PE"). Erkennung ueber
  // die Breite: eine echte Flagge ist etwa so breit wie EIN Zeichen, der
  // Buchstaben-Ersatz doppelt so breit. Im Zweifel: Flaggen stehen lassen.
  var flagsOk = null;
  function flagsSupported() {
    if (flagsOk !== null) return flagsOk;
    flagsOk = true;
    try {
      var ctx = document.createElement('canvas').getContext('2d');
      ctx.font = '32px sans-serif';
      var paar = ctx.measureText('🇩🇪').width;   // DE-Flagge
      var einzeln = ctx.measureText('🇩').width;            // nur "D"
      if (paar > 0 && einzeln > 0) flagsOk = paar < einzeln * 1.5;
    } catch (e) { /* Canvas nicht verfuegbar: Flaggen stehen lassen */ }
    return flagsOk;
  }

  // Videotitel fuer die Anzeige: Flaggen-Emojis raus, wenn der Browser sie
  // nicht darstellen kann (sonst steht "Backpacking Bolivien BO #3" da).
  // Die Daten selbst bleiben unveraendert.
  function displayTitle(title) {
    var t = String(title == null ? '' : title);
    if (flagsSupported()) return t;
    return t.replace(/(?:\uD83C[\uDDE6-\uDDFF]){2}/g, '').replace(/ {2,}/g, ' ').trim();
  }

  // Zeigt in einem Karten-Grid nur die ersten `max` Karten (die Daten sind
  // neueste zuerst) und haengt einen Knopf an, der den Rest einblendet.
  // `label` ist der Plural im Knopftext, z.B. "Vlogs" oder "Shorts".
  function limitCards(grid, max, label) {
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.vlog-card'));
    var rest = cards.slice(max);
    if (!rest.length) return;
    rest.forEach(function (el) { el.hidden = true; });
    var wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;margin-top:2rem;';
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-outline';
    btn.textContent = 'Weitere ' + label + ' anzeigen (' + rest.length + ')';
    btn.addEventListener('click', function () {
      rest.forEach(function (el) { el.hidden = false; });
      wrap.remove();
    });
    wrap.appendChild(btn);
    grid.insertAdjacentElement('afterend', wrap);
  }

  window.VlogUtils = {
    limitCards: limitCards,
    displayTitle: displayTitle,
    detectCountry: detectCountry,
    detectOrt: detectOrt,
    isShort: isShort,
    findMatchingPost: findMatchingPost,
    findMatchingVideo: findMatchingVideo
  };

  // Bequemer globaler Alias (ersetzt die alten lokalen detectCountry).
  window.detectCountry = detectCountry;
})();
