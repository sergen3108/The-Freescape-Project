/* ============================================================
   VLOG-UTILS.JS — Geteilte Vlog-Helfer
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
  function matchesKeyword(text, kw) {
    var esc = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    try {
      return new RegExp('(?:^|[^\\p{L}\\p{N}])' + esc + '(?:[^\\p{L}\\p{N}]|$)', 'iu').test(text);
    } catch (e) {
      // Sehr alte Browser ohne Unicode-Property-Escapes: Fallback
      return text.toLowerCase().indexOf(kw.toLowerCase()) !== -1;
    }
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

  // Ort aus der Beschreibung. Reihenfolge: zuerst eine Zeile mit 📍
  // (z.B. "📍 Máncora, Peru" oder "📍 Orte im Video: Huaraz, ..."),
  // sonst null. Der Ort ist optional, das Land ist Pflicht.
  function detectOrt(description) {
    if (!description) return null;
    var lines = description.replace(/\r\n/g, '\n').split('\n');

    for (var i = 0; i < lines.length; i++) {
      if (lines[i].indexOf('📍') === -1) continue;
      var s = lines[i].split('📍').slice(1).join('📍').trim();
      // Label vorne weg ("Orte im Video:", "Ort:", "Orte:")
      s = s.replace(/^(orte im video|orte|ort)\s*:?\s*/i, '').trim();
      // Ein angehaengtes Land am Ende entfernen ("Máncora, Peru" -> "Máncora")
      if (Array.isArray(window.LAENDER)) {
        window.LAENDER.forEach(function (land) {
          var re = new RegExp('\\s*,?\\s*' + land.name + '\\s*$', 'i');
          s = s.replace(re, '').trim();
        });
      }
      // Fuehrende Aufzaehlungszeichen entfernen
      s = s.replace(/^[•\-\u2013\u2014]\s*/, '').trim();
      return s || null;
    }
    return null;
  }

  // Short oder normales Video? Wie bisher ueber die Dauer.
  function isShort(video) {
    return (video && (video.duration || 999) <= 60);
  }

  window.VlogUtils = {
    detectCountry: detectCountry,
    detectOrt: detectOrt,
    isShort: isShort
  };

  // Bequemer globaler Alias (ersetzt die alten lokalen detectCountry).
  window.detectCountry = detectCountry;
})();
