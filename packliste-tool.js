/* ============================================================
   PACKLISTE-TOOL.JS: Packlisten-Generator auf packliste.html
   Inhalte (Fragen, Teile, Tipps, Vorlagen) in packliste-data.js.

   Zustand: { a: Antworten je Frage, aus: abgewaehlte Teile,
              hak: gepackte Teile, eigen: eigene Teile }
   - wird im Browser gespeichert (localStorage, falls erlaubt)
   - steckt beim Teilen im Link (#liste=...), nichts geht an
     einen Server
   - Drucken bzw. "als PDF speichern" ueber window.print() und
     die Druckregeln in style.css
   ============================================================ */
(function () {
  'use strict';

  var D = window.PACKLISTE;
  var root = document.getElementById('pl-generator');
  if (!D || !root) return;

  var SPEICHER_KEY = 'tfp-packliste-v1';
  var MAX_EIGEN = 60;
  var MAX_TEXT = 120;

  var teilById = {};
  D.TEILE.forEach(function (t) { teilById[t.id] = t; });

  /* ── Zustand ─────────────────────────────────────────────── */

  function leer() {
    var a = {};
    D.FRAGEN.forEach(function (f) { a[f.key] = []; });
    return { a: a, aus: [], hak: [], eigen: [] };
  }

  function vorlage(key) {
    return D.VORLAGEN.filter(function (x) { return x.key === key; })[0] || null;
  }

  function ausVorlage(key) {
    var s = leer();
    var v = vorlage(key);
    if (v) Object.keys(v.antworten).forEach(function (k) { s.a[k] = v.antworten[k].slice(); });
    return s;
  }

  // Alles, was aus Speicher oder Link kommt, nur mit bekannten Werten uebernehmen
  function bereinigen(roh) {
    var s = leer();
    if (!roh || typeof roh !== 'object') return s;
    var a = roh.a || {};
    D.FRAGEN.forEach(function (f) {
      var erlaubt = f.optionen.map(function (o) { return o.wert; });
      var werte = Array.isArray(a[f.key]) ? a[f.key].filter(function (w) { return erlaubt.indexOf(w) !== -1; }) : [];
      s.a[f.key] = f.mehrfach ? werte : werte.slice(0, 1);
    });
    var katKeys = D.KATEGORIEN.map(function (k) { return k.key; });
    if (Array.isArray(roh.eigen)) {
      roh.eigen.slice(0, MAX_EIGEN).forEach(function (e, i) {
        if (!e || typeof e.text !== 'string' || katKeys.indexOf(e.kat) === -1) return;
        var text = e.text.trim().slice(0, MAX_TEXT);
        if (text) s.eigen.push({ id: 'e' + i, kat: e.kat, text: text, hak: !!e.hak });
      });
    }
    var bekannt = function (id) { return typeof id === 'string' && !!teilById[id]; };
    if (Array.isArray(roh.aus)) s.aus = roh.aus.filter(bekannt);
    if (Array.isArray(roh.hak)) s.hak = roh.hak.filter(bekannt);
    return s;
  }

  // Kompakte Form fuer Speicher und Link (eigene Teile ohne interne id)
  function kompakt(s) {
    return {
      a: s.a, aus: s.aus, hak: s.hak,
      eigen: s.eigen.map(function (e) { return { kat: e.kat, text: e.text, hak: e.hak }; })
    };
  }

  function speicherLesen() {
    try {
      var roh = window.localStorage.getItem(SPEICHER_KEY);
      return roh ? bereinigen(JSON.parse(roh)) : null;
    } catch (e) { return null; }
  }
  function speicherSchreiben(s) {
    try { window.localStorage.setItem(SPEICHER_KEY, JSON.stringify(kompakt(s))); } catch (e) { /* ohne Speicher geht es auch */ }
  }
  function speicherLoeschen() {
    try { window.localStorage.removeItem(SPEICHER_KEY); } catch (e) { /* egal */ }
  }

  // Base64url mit UTF-8, damit Umlaute in eigenen Teilen den Link ueberstehen
  function kodieren(obj) {
    var bytes = new TextEncoder().encode(JSON.stringify(obj));
    var bin = '';
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function dekodieren(text) {
    try {
      var b64 = text.replace(/-/g, '+').replace(/_/g, '/');
      while (b64.length % 4) b64 += '=';
      var bin = atob(b64);
      var bytes = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bereinigen(JSON.parse(new TextDecoder().decode(bytes)));
    } catch (e) { return null; }
  }
  function linkFuer(s) {
    return location.href.split('#')[0] + '#liste=' + kodieren(kompakt(s));
  }
  function hashEntfernen() {
    try { history.replaceState(null, '', location.pathname + location.search); } catch (e) { /* egal */ }
  }

  /* ── Welche Teile gehoeren dazu? ─────────────────────────── */

  function passt(bedingung, a, alle) {
    var keys = Object.keys(bedingung);
    var treffer = function (k) {
      return (a[k] || []).some(function (w) { return bedingung[k].indexOf(w) !== -1; });
    };
    return alle ? keys.every(treffer) : keys.some(treffer);
  }

  function gehoertDazu(t, a) {
    if (t.ohne && t.ohne.some(function (k) { return (a[k] || []).length > 0; })) return false;
    if (t.wenn && !passt(t.wenn, a, false)) return false;
    if (t.nur && !passt(t.nur, a, true)) return false;
    return true;
  }

  function textVon(t, a) {
    if (!t.menge) return t.text;
    var dauer = (a.dauer || [])[0];
    var menge = (dauer && t.menge[dauer]) || t.menge.standard || '';
    return t.text.replace('{menge}', menge);
  }

  // Entsprechen die Antworten genau einer Vorlage? (fuer die Markierung)
  function gleicheVorlage(v) {
    return D.FRAGEN.every(function (f) {
      var a = (state.a[f.key] || []).slice().sort().join(',');
      var b = (v.antworten[f.key] || []).slice().sort().join(',');
      return a === b;
    });
  }

  // Kurze Zusammenfassung der Antworten (Panel auf dem Handy, Ausdruck)
  function zusammenfassung() {
    var teile = [];
    D.FRAGEN.forEach(function (f) {
      if (f.key === 'fern') return;
      var labels = f.optionen.filter(function (o) { return state.a[f.key].indexOf(o.wert) !== -1; })
        .map(function (o) { return o.label; });
      if (labels.length) teile.push(labels.join(', '));
    });
    return teile.join(' · ');
  }

  /* ── Elemente ────────────────────────────────────────────── */

  var el = {
    vorlagen:  root.querySelector('[data-pl="vorlagen"]'),
    fragen:    root.querySelector('[data-pl="fragen"]'),
    panel:     root.querySelector('[data-pl="panel"]'),
    panelBtn:  root.querySelector('[data-pl="panel-toggle"]'),
    panelBtnText: root.querySelector('[data-pl="panel-toggle-text"]'),
    panelFertig: root.querySelector('[data-pl="panel-fertig"]'),
    panelInfo: root.querySelector('[data-pl="panel-info"]'),
    fragenWrap: root.querySelector('#pl-reise-fragen'),
    liste:     root.querySelector('[data-pl="liste"]'),
    aus:       root.querySelector('[data-pl="ausgeblendet"]'),
    status:    root.querySelector('[data-pl="status"]'),
    zaehler:   root.querySelector('[data-pl="zaehler"]'),
    balken:    root.querySelector('[data-pl="balken"]'),
    druckInfo: root.querySelector('[data-pl="druck-info"]'),
    hinweis:   root.querySelector('[data-pl="hinweis"]'),
    meldung:   root.querySelector('[data-pl="meldung"]')
  };

  function erzeuge(tag, klasse, text) {
    var n = document.createElement(tag);
    if (klasse) n.className = klasse;
    if (text != null) n.textContent = text;
    return n;
  }

  var SVG = {
    chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>',
    tipp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V17h6v-.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z"/></svg>',
    weg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
  };

  /* ── Zustand laden ───────────────────────────────────────── */

  var state;
  var geteilt = false;   // true: Liste kommt aus einem geteilten Link und ist noch nicht gespeichert

  var hashMatch = location.hash.match(/^#liste=([A-Za-z0-9_-]+)$/);
  var ausLink = hashMatch ? dekodieren(hashMatch[1]) : null;
  if (ausLink) {
    state = ausLink;
    geteilt = true;
  } else {
    state = speicherLesen() || leer();   // Start ohne Auswahl, jeder waehlt selbst
  }

  function geaendert() {
    if (geteilt) { geteilt = false; hashEntfernen(); }
    speicherSchreiben(state);
    render();
  }

  // Abhaken: nur speichern und zaehlen, ohne alles neu zu zeichnen (Fokus bleibt)
  function nurSpeichern() {
    if (geteilt) { geteilt = false; hashEntfernen(); renderHinweis(); }
    speicherSchreiben(state);
    zaehlen();
  }

  /* ── "Deine Reise": Fragen auf- und zuklappen ────────────── */

  // Startet zugeklappt, damit die Seite ruhig bleibt; ohne Auswahl zeigt
  // die Liste die Grundausstattung, die Zeile darueber sagt, was zu tun ist
  var panelOffen = false;
  function renderPanel() {
    el.fragenWrap.hidden = !panelOffen;
    el.panel.classList.toggle('is-offen', panelOffen);
    el.panelBtn.setAttribute('aria-expanded', String(panelOffen));
    el.panelBtnText.textContent = panelOffen ? 'Zuklappen' : 'Reise anpassen';
    el.panelInfo.textContent = zusammenfassung() || 'Noch nichts ausgewählt. Wähle eine Vorlage oder pass die Reise an, dann kommen passende Teile dazu.';
  }
  el.panelBtn.addEventListener('click', function () { panelOffen = !panelOffen; renderPanel(); });
  el.panelFertig.addEventListener('click', function () {
    panelOffen = false;
    renderPanel();
    el.panelBtn.focus();
  });

  /* ── Vorlagen und Fragen ─────────────────────────────────── */

  function renderVorlagen() {
    el.vorlagen.innerHTML = '';
    D.VORLAGEN.forEach(function (v) {
      var aktiv = gleicheVorlage(v);
      var b = erzeuge('button', 'pl-vorlage' + (aktiv ? ' is-aktiv' : ''));
      b.type = 'button';
      b.setAttribute('aria-pressed', String(aktiv));
      if (v.text) b.title = v.text;
      if (v.icon) b.appendChild(erzeuge('span', 'pl-vorlage__icon', v.icon));
      b.appendChild(document.createTextNode(v.label));
      b.addEventListener('click', function () {
        var neu = ausVorlage(v.key);
        neu.eigen = state.eigen;   // eigene Teile bleiben erhalten
        state = neu;
        geaendert();
      });
      el.vorlagen.appendChild(b);
    });
  }

  function renderFragen() {
    el.fragen.innerHTML = '';
    D.FRAGEN.forEach(function (f) {
      var gruppe = erzeuge('fieldset', 'pl-frage');
      var legend = erzeuge('legend', 'pl-frage__titel', f.titel);
      if (f.mehrfach) legend.appendChild(erzeuge('span', 'pl-frage__hint', 'mehrere möglich'));
      gruppe.appendChild(legend);
      var chips = erzeuge('div', 'pl-chips');
      f.optionen.forEach(function (o) {
        var aktiv = state.a[f.key].indexOf(o.wert) !== -1;
        var b = erzeuge('button', 'pl-chip' + (aktiv ? ' is-aktiv' : ''));
        b.type = 'button';
        b.setAttribute('aria-pressed', String(aktiv));
        if (o.icon) b.appendChild(erzeuge('span', 'pl-chip__icon', o.icon));
        b.appendChild(document.createTextNode(o.label));
        b.addEventListener('click', function () {
          var werte = state.a[f.key];
          var i = werte.indexOf(o.wert);
          if (f.mehrfach) {
            if (i === -1) werte.push(o.wert); else werte.splice(i, 1);
          } else {
            state.a[f.key] = i === -1 ? [o.wert] : [];
          }
          geaendert();
        });
        chips.appendChild(b);
      });
      gruppe.appendChild(chips);
      el.fragen.appendChild(gruppe);
    });
  }

  /* ── Liste ───────────────────────────────────────────────── */

  var offeneTipps = {};
  var zuKats = {};

  function renderListe() {
    el.liste.innerHTML = '';
    var ausgeblendet = [];

    D.KATEGORIEN.forEach(function (kat) {
      var teile = D.TEILE.filter(function (t) { return t.kat === kat.key && gehoertDazu(t, state.a); });
      var sichtbar = teile.filter(function (t) { return state.aus.indexOf(t.id) === -1; });
      teile.forEach(function (t) { if (state.aus.indexOf(t.id) !== -1) ausgeblendet.push(t); });
      var eigene = state.eigen.filter(function (e) { return e.kat === kat.key; });

      var block = erzeuge('section', 'pl-kat' + (zuKats[kat.key] ? ' is-zu' : ''));
      block.dataset.kat = kat.key;
      var inhaltId = 'pl-kat-' + kat.key;

      var h = erzeuge('h3', 'pl-kat__h');
      var kopf = erzeuge('button', 'pl-kat__kopf');
      kopf.type = 'button';
      kopf.setAttribute('aria-expanded', String(!zuKats[kat.key]));
      kopf.setAttribute('aria-controls', inhaltId);
      kopf.appendChild(erzeuge('span', 'pl-kat__icon', kat.icon || ''));
      var tw = erzeuge('span', 'pl-kat__titelwrap');
      tw.appendChild(erzeuge('span', 'pl-kat__titel', kat.titel));
      tw.appendChild(erzeuge('span', 'pl-kat__intro', kat.intro));
      kopf.appendChild(tw);
      kopf.appendChild(erzeuge('span', 'pl-kat__stand'));
      var chev = erzeuge('span', 'pl-kat__chevron');
      chev.innerHTML = SVG.chevron;
      kopf.appendChild(chev);
      kopf.addEventListener('click', function () {
        zuKats[kat.key] = !zuKats[kat.key];
        block.classList.toggle('is-zu', !!zuKats[kat.key]);
        kopf.setAttribute('aria-expanded', String(!zuKats[kat.key]));
      });
      h.appendChild(kopf);
      block.appendChild(h);

      var inhalt = erzeuge('div', 'pl-kat__inhalt');
      inhalt.id = inhaltId;
      var ul = erzeuge('ul', 'pl-teile');

      sichtbar.forEach(function (t) {
        ul.appendChild(zeile({
          id: t.id, text: textVon(t, state.a), tipp: t.tipp, hak: state.hak.indexOf(t.id) !== -1,
          onHak: function (an) {
            var i = state.hak.indexOf(t.id);
            if (an && i === -1) state.hak.push(t.id);
            if (!an && i !== -1) state.hak.splice(i, 1);
            nurSpeichern();
          },
          wegLabel: 'Brauche ich nicht',
          onWeg: function () { state.aus.push(t.id); geaendert(); }
        }));
      });

      eigene.forEach(function (e) {
        ul.appendChild(zeile({
          id: e.id, text: e.text, eigen: true, hak: e.hak,
          onHak: function (an) { e.hak = an; nurSpeichern(); },
          wegLabel: 'Eigenes Teil löschen',
          onWeg: function () { state.eigen.splice(state.eigen.indexOf(e), 1); geaendert(); }
        }));
      });

      if (!sichtbar.length && !eigene.length) {
        ul.appendChild(erzeuge('li', 'pl-teile__leer', 'Für deine Auswahl nichts Besonderes. Eigene Teile kannst du hier ergänzen.'));
      }
      inhalt.appendChild(ul);
      inhalt.appendChild(eigenesFormular(kat.key));
      block.appendChild(inhalt);
      el.liste.appendChild(block);
    });

    renderAusgeblendet(ausgeblendet);
    zaehlen();
    el.druckInfo.textContent = zusammenfassung();
  }

  function zeile(o) {
    var li = erzeuge('li', 'pl-teil' + (o.hak ? ' is-gepackt' : '') + (o.eigen ? ' pl-teil--eigen' : ''));
    var label = erzeuge('label', 'pl-teil__label');
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.className = 'pl-cb';
    cb.checked = o.hak;
    cb.addEventListener('change', function () {
      li.classList.toggle('is-gepackt', cb.checked);
      o.onHak(cb.checked);
    });
    label.appendChild(cb);
    label.appendChild(erzeuge('span', 'pl-cb__box'));
    label.appendChild(erzeuge('span', 'pl-teil__text', o.text));
    if (o.eigen) label.appendChild(erzeuge('span', 'pl-teil__marke', 'eigenes'));
    li.appendChild(label);

    var aktionen = erzeuge('span', 'pl-teil__aktionen');
    var tippBox = null;
    if (o.tipp) {
      var tb = erzeuge('button', 'pl-teil__btn pl-teil__btn--tipp');
      tb.type = 'button';
      tb.innerHTML = SVG.tipp;
      tb.title = 'Unser Tipp';
      tb.setAttribute('aria-label', 'Tipp zu: ' + o.text);
      tb.setAttribute('aria-expanded', String(!!offeneTipps[o.id]));
      tb.addEventListener('click', function () {
        offeneTipps[o.id] = !offeneTipps[o.id];
        tb.setAttribute('aria-expanded', String(offeneTipps[o.id]));
        tippBox.hidden = !offeneTipps[o.id];
      });
      aktionen.appendChild(tb);
      tippBox = erzeuge('p', 'pl-teil__tipp', o.tipp);
      tippBox.hidden = !offeneTipps[o.id];
    }
    var wb = erzeuge('button', 'pl-teil__btn pl-teil__btn--weg');
    wb.type = 'button';
    wb.innerHTML = SVG.weg;
    wb.title = o.wegLabel;
    wb.setAttribute('aria-label', o.wegLabel + ': ' + o.text);
    wb.addEventListener('click', o.onWeg);
    aktionen.appendChild(wb);
    li.appendChild(aktionen);
    if (tippBox) li.appendChild(tippBox);
    return li;
  }

  // "+ Teil hinzufuegen": erst nur ein Link, ein Klick oeffnet Feld und Knopf.
  // Nach dem Hinzufuegen bleibt das Feld offen (eigenOffen merkt sich die
  // Kategorie ueber das Neuzeichnen hinweg), Esc oder leeres Verlassen schliesst es.
  var eigenOffen = null;

  function eigenesFormular(katKey) {
    var wrap = erzeuge('div', 'pl-eigen-wrap');
    var link = erzeuge('button', 'pl-eigen-link');
    link.type = 'button';
    link.innerHTML = SVG.plus;
    link.appendChild(document.createTextNode('Teil hinzufügen'));

    var form = erzeuge('form', 'pl-eigen');
    var input = document.createElement('input');
    input.type = 'text';
    input.maxLength = MAX_TEXT;
    input.placeholder = 'Was fehlt noch?';
    input.setAttribute('aria-label', 'Eigenes Teil ergänzen');
    var b = erzeuge('button', 'pl-eigen__btn', 'Hinzufügen');
    b.type = 'submit';
    form.appendChild(input);
    form.appendChild(b);

    function zeigen(offen, fokus) {
      eigenOffen = offen ? katKey : (eigenOffen === katKey ? null : eigenOffen);
      link.hidden = offen;
      form.hidden = !offen;
      if (offen && fokus) input.focus();
    }
    zeigen(eigenOffen === katKey, false);

    link.addEventListener('click', function () { zeigen(true, true); });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { input.value = ''; zeigen(false); link.focus(); }
    });
    form.addEventListener('focusout', function () {
      // Kurz warten: der Fokus kann gerade vom Feld auf den Knopf wandern
      setTimeout(function () {
        if (!form.contains(document.activeElement) && !input.value.trim() && !form.hidden) zeigen(false);
      }, 150);
    });
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var text = input.value.trim().slice(0, MAX_TEXT);
      if (!text) { input.focus(); return; }
      if (state.eigen.length >= MAX_EIGEN) { melde('Mehr als ' + MAX_EIGEN + ' eigene Teile gehen leider nicht.'); return; }
      state.eigen.push({ id: 'e' + Date.now(), kat: katKey, text: text, hak: false });
      eigenOffen = katKey;
      geaendert();
      // Fokus zurueck ins (neu gezeichnete) Feld, damit man direkt weitertippen kann
      var feld = el.liste.querySelector('.pl-kat[data-kat="' + katKey + '"] .pl-eigen input');
      if (feld) feld.focus();
    });

    wrap.appendChild(link);
    wrap.appendChild(form);
    return wrap;
  }

  function renderAusgeblendet(liste) {
    el.aus.innerHTML = '';
    el.aus.hidden = !liste.length;
    if (!liste.length) return;
    var details = erzeuge('details', 'pl-aus');
    details.appendChild(erzeuge('summary', 'pl-aus__titel', 'Abgewählt (' + liste.length + ')'));
    var ul = erzeuge('ul', 'pl-aus__liste');
    liste.forEach(function (t) {
      var li = erzeuge('li', 'pl-aus__teil');
      li.appendChild(erzeuge('span', null, textVon(t, state.a)));
      var b = erzeuge('button', 'pl-aus__btn', 'Wieder aufnehmen');
      b.type = 'button';
      b.addEventListener('click', function () {
        state.aus.splice(state.aus.indexOf(t.id), 1);
        geaendert();
      });
      li.appendChild(b);
      ul.appendChild(li);
    });
    details.appendChild(ul);
    el.aus.appendChild(details);
  }

  // Zaehler oben und je Kategorie, Fortschrittsbalken, "fertig"-Zustand
  function zaehlen() {
    var gesamt = 0, gepackt = 0;
    el.liste.querySelectorAll('.pl-kat').forEach(function (block) {
      var n = block.querySelectorAll('.pl-teil').length;
      var g = block.querySelectorAll('.pl-teil.is-gepackt').length;
      gesamt += n; gepackt += g;
      block.querySelector('.pl-kat__stand').textContent = n ? g + '/' + n : '';
      block.classList.toggle('is-fertig', n > 0 && g === n);
    });
    var pct = gesamt ? Math.round(gepackt / gesamt * 100) : 0;
    var fertig = gesamt > 0 && gepackt === gesamt;
    el.zaehler.textContent = fertig ? 'Alles gepackt, gute Reise!' : gepackt + ' von ' + gesamt + ' gepackt · ' + pct + ' %';
    el.balken.style.width = pct + '%';
    el.status.classList.toggle('is-fertig', fertig);
  }

  /* ── Hinweis bei geteilten Links ─────────────────────────── */

  function renderHinweis() {
    el.hinweis.innerHTML = '';
    el.hinweis.hidden = !geteilt;
    if (!geteilt) return;
    el.hinweis.appendChild(erzeuge('span', null, 'Du siehst eine geteilte Packliste. Sobald du etwas änderst, wird sie als deine Liste gespeichert.'));
    if (speicherLesen()) {
      var b = erzeuge('button', 'pl-hinweis__btn', 'Meine gespeicherte Liste öffnen');
      b.type = 'button';
      b.addEventListener('click', function () {
        state = speicherLesen() || leer();
        geteilt = false;
        hashEntfernen();
        render();
      });
      el.hinweis.appendChild(b);
    }
  }

  /* ── Werkzeuge ───────────────────────────────────────────── */

  var meldungTimer;
  function melde(text) {
    el.meldung.textContent = text;
    clearTimeout(meldungTimer);
    meldungTimer = setTimeout(function () { el.meldung.textContent = ''; }, 4000);
  }

  root.querySelector('[data-pl="drucken"]').addEventListener('click', function () { window.print(); });

  root.querySelector('[data-pl="teilen"]').addEventListener('click', function () {
    var link = linkFuer(state);
    var fallback = function () { window.prompt('Diesen Link kopieren und teilen:', link); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(function () {
        melde('Link kopiert. Wer ihn öffnet, sieht genau diese Liste.');
      }, fallback);
    } else {
      fallback();
    }
  });

  root.querySelector('[data-pl="zuruecksetzen"]').addEventListener('click', function () {
    if (!window.confirm('Liste zurücksetzen? Deine Häkchen und eigenen Teile gehen dabei verloren.')) return;
    speicherLoeschen();
    state = leer();
    geteilt = false;
    offeneTipps = {};
    zuKats = {};
    eigenOffen = null;
    hashEntfernen();
    render();
    melde('Liste zurückgesetzt.');
  });

  /* ── Start ───────────────────────────────────────────────── */

  function render() {
    renderVorlagen();
    renderFragen();
    renderPanel();
    renderListe();
    renderHinweis();
  }

  render();
})();
