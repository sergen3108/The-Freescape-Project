/* Kosten-Widget fuer die Laenderseiten, index.html und kosten.html.
   Die Zahlen stehen in kosten-data.js (window.KOSTEN).
   Reines Vanilla JS + SVG, kein Chart-CDN, kein externes Tracking.
   Zeigt Gesamtsumme, Zeitraum, Kosten/Tag, Kosten/Monat und die Kategorien
   als Donut samt Legende mit den exakten Betraegen. Optional mit
   Varianten-Umschalter (siehe ecuador.html: "Mit"/"Ohne"/"Nur Galapagos"). */
window.KostenWidget = (function () {
  var CATS = [
    { key: 'activities',     label: 'Aktivitäten',      color: '#2a78d6' },
    { key: 'accommodation',  label: 'Unterkunft',       color: '#eb6834' },
    { key: 'food',           label: 'Essen & Trinken',  color: '#1baf7a' },
    { key: 'transportation', label: 'Transport',        color: '#eda100' },
    { key: 'others',         label: 'Sonstiges',        color: '#8a8a8a' }
  ];

  function fmtEUR(n) {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  }
  function fmtPct(n) {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %';
  }

  /* Generischer Donut-Renderer ueber die klassische
     stroke-dasharray/-dashoffset-Technik. segments: [{ value, color,
     title, href }] - href ist optional und macht das Segment als
     natives SVG-<a> klickbar (kein JS-Klick-Handler noetig). */
  function buildDonut(svg, segments) {
    var svgns = 'http://www.w3.org/2000/svg';
    var R = 80, CX = 100, CY = 100, STROKE = 30, GAP = 3;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 200 200');

    var active = segments.filter(function (s) { return s.value > 0; });
    var sum = active.reduce(function (acc, s) { return acc + s.value; }, 0);
    var circumference = 2 * Math.PI * R;
    var usable = circumference - GAP * active.length;

    var g = document.createElementNS(svgns, 'g');
    g.setAttribute('transform', 'rotate(-90 ' + CX + ' ' + CY + ')');
    svg.appendChild(g);

    var cum = 0;
    active.forEach(function (s) {
      var segLen = (s.value / sum) * usable;
      var circle = document.createElementNS(svgns, 'circle');
      circle.setAttribute('cx', CX);
      circle.setAttribute('cy', CY);
      circle.setAttribute('r', R);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', s.color);
      circle.setAttribute('stroke-width', STROKE);
      circle.setAttribute('stroke-dasharray', segLen.toFixed(2) + ' ' + (circumference - segLen).toFixed(2));
      circle.setAttribute('stroke-dashoffset', (-cum).toFixed(2));
      if (s.title) {
        var title = document.createElementNS(svgns, 'title');
        title.textContent = s.title;
        circle.appendChild(title);
      }
      if (s.href) {
        var a = document.createElementNS(svgns, 'a');
        a.setAttribute('href', s.href);
        a.appendChild(circle);
        g.appendChild(a);
      } else {
        g.appendChild(circle);
      }
      cum += segLen + GAP;
    });
  }

  function renderDonut(svg, kategorien) {
    buildDonut(svg, CATS.filter(function (c) { return (kategorien[c.key] || 0) > 0; }).map(function (c) {
      return { value: kategorien[c.key], color: c.color, title: c.label + ': ' + fmtEUR(kategorien[c.key]) };
    }));
  }

  function render(root, variant) {
    var kategorien = variant.kategorien;
    var sum = CATS.reduce(function (acc, c) { return acc + (kategorien[c.key] || 0); }, 0);
    var gesamt  = variant.gesamt != null ? variant.gesamt : sum;
    var perDay  = gesamt / variant.tage;
    var perMonth = perDay * 30;

    var totalEl    = root.querySelector('[data-k="total"]');
    var zeitraumEl = root.querySelector('[data-k="zeitraum"]');
    var tageEl     = root.querySelector('[data-k="tage"]');
    var perDayEl   = root.querySelector('[data-k="perday"]');
    var perMonthEl = root.querySelector('[data-k="permonth"]');
    var legendEl   = root.querySelector('[data-k="legend"]');
    var svg        = root.querySelector('[data-k="donut"]');

    if (totalEl)    totalEl.textContent = fmtEUR(gesamt);
    if (zeitraumEl) zeitraumEl.textContent = variant.zeitraum;
    if (tageEl)     tageEl.textContent = variant.tage + ' Tage';
    if (perDayEl)   perDayEl.textContent = fmtEUR(perDay);
    if (perMonthEl) perMonthEl.textContent = fmtEUR(perMonth);
    if (svg)        renderDonut(svg, kategorien);

    if (legendEl) {
      legendEl.innerHTML = CATS.map(function (c) {
        var betrag = kategorien[c.key] || 0;
        var pct = sum > 0 ? (betrag / sum) * 100 : 0;
        return '<li class="kosten-legend__item">' +
          '<span class="kosten-legend__swatch" style="background:' + c.color + '"></span>' +
          '<span class="kosten-legend__name">' + c.label + '</span>' +
          '<span class="kosten-legend__amount">' + fmtEUR(betrag) + '</span>' +
          '<span class="kosten-legend__pct">' + fmtPct(pct) + '</span>' +
        '</li>';
      }).join('');
    }
  }

  function fmtZahl(n) {
    return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  /* ── Zugriff auf kosten-data.js (window.KOSTEN) ───────────── */
  function daten() {
    return Array.isArray(window.KOSTEN) ? window.KOSTEN : [];
  }

  // Eintrag eines Landes, passt direkt als config fuer init().
  function land(slug) {
    return daten().filter(function (l) { return l.slug === slug; })[0] || null;
  }

  // Ein Eintrag je abgerechnetem Land in der Standard-Sicht (defaultKey).
  function laender() {
    return daten().map(function (l) {
      var v = l.variants[l.defaultKey];
      return {
        slug: l.slug, name: l.name, color: l.color, hinweis: l.hinweis || '',
        href: l.slug + '.html#kosten-' + l.slug,
        zeitraum: v.zeitraum, tage: v.tage, gesamt: v.gesamt,
        proTag: v.gesamt / v.tage, kategorien: v.kategorien
      };
    });
  }

  // Summe ueber alle abgerechneten Laender.
  function summe() {
    var liste = laender();
    var gesamt = liste.reduce(function (acc, l) { return acc + l.gesamt; }, 0);
    var tage = liste.reduce(function (acc, l) { return acc + l.tage; }, 0);
    return { gesamt: gesamt, tage: tage, proTag: tage ? gesamt / tage : 0, laender: liste.length };
  }

  // "Kolumbien, Ecuador und Peru"
  function aufzaehlung(namen) {
    if (namen.length < 2) return namen.join('');
    return namen.slice(0, -1).join(', ') + ' und ' + namen[namen.length - 1];
  }

  /* Zahlen im Fliesstext: <span data-kosten="gesamt">12.948,93</span>.
     Der Text im HTML bleibt als Fallback stehen, falls das Skript nicht
     laeuft. Schluessel: gesamt | protag | tage | anzahl | laenderliste */
  function fillText(root) {
    var s = summe();
    if (!s.laender) return;
    var werte = {
      gesamt: fmtZahl(s.gesamt),
      protag: fmtZahl(s.proTag),
      tage: String(s.tage),
      anzahl: String(s.laender),
      laenderliste: aufzaehlung(laender().map(function (l) { return l.name; }))
    };
    (root || document).querySelectorAll('[data-kosten]').forEach(function (el) {
      var wert = werte[el.getAttribute('data-kosten')];
      if (wert !== undefined) el.textContent = wert;
    });
  }

  function init(root, config) {
    if (!root || !config) return;
    var variants = config.variants;
    var current = config.defaultKey;

    render(root, variants[current]);

    var toggleBtns = root.querySelectorAll('[data-variant]');
    toggleBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        toggleBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        current = btn.getAttribute('data-variant');
        render(root, variants[current]);
      });
    });
  }

  /* Laenderuebergreifende Uebersicht (index.html): ein Donut aus den
     Gesamtsummen je Land, jedes Segment und jeder Legenden-Zeile
     verlinkt zur Kosten-Sektion der jeweiligen Laenderseite.
     items: [{ name, total, color, href }], ohne Angabe aus kosten-data.js */
  function initOverview(root, items) {
    if (!root) return;
    items = items || laender().map(function (l) {
      return { name: l.name, total: l.gesamt, color: l.color, href: l.href };
    });
    var sum = items.reduce(function (acc, it) { return acc + it.total; }, 0);

    var totalEl  = root.querySelector('[data-k="total"]');
    var svg      = root.querySelector('[data-k="donut"]');
    var legendEl = root.querySelector('[data-k="legend"]');

    if (totalEl) totalEl.textContent = fmtEUR(sum);
    if (svg) {
      buildDonut(svg, items.map(function (it) {
        return { value: it.total, color: it.color, href: it.href, title: it.name + ': ' + fmtEUR(it.total) };
      }));
    }
    if (legendEl) {
      legendEl.innerHTML = items.map(function (it) {
        var pct = sum > 0 ? (it.total / sum) * 100 : 0;
        return '<li class="kosten-legend__item">' +
          '<a href="' + it.href + '" class="kosten-legend__link">' +
            '<span class="kosten-legend__swatch" style="background:' + it.color + '"></span>' +
            '<span class="kosten-legend__name">' + it.name + '</span>' +
            '<span class="kosten-legend__amount">' + fmtEUR(it.total) + '</span>' +
            '<span class="kosten-legend__pct">' + fmtPct(pct) + '</span>' +
          '</a>' +
        '</li>';
      }).join('');
    }
  }

  /* ── Laendervergleich (kosten.html) ───────────────────────────
     Ein gestapelter Balken je Land: Laenge = Ausgaben (pro Tag oder
     gesamt), Segmente = Kategorien. Groesster Wert oben. Der Betrag
     steht am Balkenende, die Kategorien erklaert die Legende, jedes
     Segment zeigt seinen Wert bei Hover und Tastaturfokus. Alle Zahlen
     stehen zusaetzlich in der Tabelle (initTabelle).

     root braucht: [data-k="balken"], [data-k="legende"], optional
     [data-k="fazit"] und Knoepfe mit data-modus="tag" | "gesamt". */
  function el(tag, cls, text) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function initVergleich(root) {
    if (!root || !laender().length) return;
    var balken  = root.querySelector('[data-k="balken"]');
    var legende = root.querySelector('[data-k="legende"]');
    var fazit   = root.querySelector('[data-k="fazit"]');
    var knoepfe = root.querySelectorAll('[data-modus]');
    if (!balken) return;

    if (legende) {
      legende.textContent = '';
      CATS.forEach(function (c) {
        var li = el('li', 'kosten-vgl__legende-item');
        var sw = el('span', 'kosten-legend__swatch');
        sw.style.background = c.color;
        li.appendChild(sw);
        li.appendChild(el('span', '', c.label));
        legende.appendChild(li);
      });
    }

    // Ein Tooltip fuer alle Segmente: Betrag vorn, Kategorie dahinter.
    var tip = el('div', 'kosten-vgl__tip');
    tip.setAttribute('role', 'status');
    tip.hidden = true;
    var tipWert = el('strong', 'kosten-vgl__tip-wert');
    var tipText = el('span', 'kosten-vgl__tip-text');
    tip.appendChild(tipWert);
    tip.appendChild(tipText);
    root.appendChild(tip);

    function zeigeTip(seg) {
      tipWert.textContent = seg.dataset.wert;
      tipText.textContent = seg.dataset.text;
      tip.hidden = false;
      var r = seg.getBoundingClientRect();
      var w = root.getBoundingClientRect();
      var links = r.left - w.left + r.width / 2 - tip.offsetWidth / 2;
      links = Math.max(0, Math.min(links, w.width - tip.offsetWidth));
      tip.style.left = links + 'px';
      tip.style.top = (r.top - w.top - tip.offsetHeight - 8) + 'px';
    }
    function versteckeTip() { tip.hidden = true; }

    function render(modus) {
      var proTag = modus === 'tag';
      var zeilen = laender().map(function (l) {
        var teiler = proTag ? l.tage : 1;
        return {
          land: l,
          wert: l.gesamt / teiler,
          teile: CATS.map(function (c) {
            return { cat: c, wert: (l.kategorien[c.key] || 0) / teiler, anteil: (l.kategorien[c.key] || 0) / l.gesamt * 100 };
          }).filter(function (t) { return t.wert > 0; })
        };
      }).sort(function (a, b) { return b.wert - a.wert; });
      var max = zeilen[0].wert;
      var zusatz = proTag ? ' pro Tag' : '';

      balken.textContent = '';
      zeilen.forEach(function (z) {
        var row = el('div', 'kosten-vgl__row');
        var name = el('a', 'kosten-vgl__name', z.land.name);
        name.href = z.land.href;
        row.appendChild(name);

        var track = el('div', 'kosten-vgl__track');
        var bar = el('div', 'kosten-vgl__bar');
        bar.style.setProperty('--anteil', (z.wert / max).toFixed(4));
        z.teile.forEach(function (t) {
          var seg = el('span', 'kosten-vgl__seg');
          seg.style.flexGrow = t.wert.toFixed(4);
          seg.style.background = t.cat.color;
          seg.tabIndex = 0;
          seg.dataset.wert = fmtEUR(t.wert) + zusatz;
          seg.dataset.text = t.cat.label + ' in ' + z.land.name + ' (' + fmtPct(t.anteil) + ')';
          seg.setAttribute('role', 'img');
          seg.setAttribute('aria-label', z.land.name + ', ' + t.cat.label + ': ' + fmtEUR(t.wert) + zusatz);
          bar.appendChild(seg);
        });
        track.appendChild(bar);
        track.appendChild(el('span', 'kosten-vgl__wert', fmtEUR(z.wert)));
        row.appendChild(track);
        balken.appendChild(row);
      });

      if (fazit && zeilen.length > 1) {
        var erster = zeilen[0], letzter = zeilen[zeilen.length - 1];
        fazit.textContent = proTag
          ? 'Am meisten haben wir pro Tag in ' + erster.land.name + ' ausgegeben (' + fmtEUR(erster.wert) + '), am wenigsten in ' + letzter.land.name + ' (' + fmtEUR(letzter.wert) + ').'
          : 'Insgesamt am meisten haben wir in ' + erster.land.name + ' ausgegeben (' + fmtEUR(erster.wert) + ' in ' + erster.land.tage + ' Tagen), am wenigsten in ' + letzter.land.name + ' (' + fmtEUR(letzter.wert) + ' in ' + letzter.land.tage + ' Tagen).';
      }
    }

    balken.addEventListener('pointerover', function (e) {
      if (e.target.classList.contains('kosten-vgl__seg')) zeigeTip(e.target);
    });
    balken.addEventListener('pointerout', function (e) {
      if (e.target.classList.contains('kosten-vgl__seg')) versteckeTip();
    });
    balken.addEventListener('focusin', function (e) {
      if (e.target.classList.contains('kosten-vgl__seg')) zeigeTip(e.target);
    });
    balken.addEventListener('focusout', versteckeTip);

    knoepfe.forEach(function (btn) {
      btn.addEventListener('click', function () {
        knoepfe.forEach(function (b) {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        versteckeTip();
        render(btn.getAttribute('data-modus'));
      });
    });

    render('tag');
  }

  /* Tabelle mit allen Zahlen (Gegenstueck zum Diagramm). tbody und
     tfoot werden gefuellt, der Tabellenkopf steht im HTML. */
  function initTabelle(table) {
    if (!table || !laender().length) return;
    var tbody = table.querySelector('tbody');
    var tfoot = table.querySelector('tfoot');
    if (!tbody) return;

    function zeile(tag, name, href, tage, gesamt, proTag, kategorien) {
      var tr = document.createElement('tr');
      var th = document.createElement('th');
      th.scope = 'row';
      if (href) {
        var a = el('a', '', name);
        a.href = href;
        th.appendChild(a);
      } else {
        th.textContent = name;
      }
      tr.appendChild(th);
      [String(tage), fmtEUR(gesamt), fmtEUR(proTag)].concat(CATS.map(function (c) {
        return fmtEUR(kategorien[c.key] || 0);
      })).forEach(function (text) { tr.appendChild(el(tag, '', text)); });
      return tr;
    }

    tbody.textContent = '';
    var summen = {};
    laender().forEach(function (l) {
      tbody.appendChild(zeile('td', l.name, l.href, l.tage, l.gesamt, l.proTag, l.kategorien));
      CATS.forEach(function (c) { summen[c.key] = (summen[c.key] || 0) + (l.kategorien[c.key] || 0); });
    });
    if (tfoot) {
      var s = summe();
      tfoot.textContent = '';
      tfoot.appendChild(zeile('td', 'Gesamt', '', s.tage, s.gesamt, s.proTag, summen));
    }
  }

  /* Eine Karte je Land mit den Eckdaten und dem Link zur Aufschluesselung.
     Bereiste oder aktuelle Laender aus laender-config.js, die hier noch
     keine Zahlen haben, bekommen automatisch eine Karte "Abrechnung folgt". */
  function initLaenderKarten(container) {
    if (!container || !laender().length) return;
    container.textContent = '';
    var abgerechnet = {};
    laender().forEach(function (l) {
      abgerechnet[l.slug] = true;
      var card = el('a', 'kosten-land');
      card.href = l.href;
      card.appendChild(el('span', 'kosten-land__name', l.name));
      card.appendChild(el('span', 'kosten-land__zeit', l.zeitraum + (l.hinweis ? ', ' + l.hinweis : '')));
      card.appendChild(el('span', 'kosten-land__summe', fmtEUR(l.gesamt)));
      var fakten = el('span', 'kosten-land__fakten');
      fakten.appendChild(el('span', '', l.tage + ' Tage'));
      fakten.appendChild(el('span', '', fmtEUR(l.proTag) + ' pro Tag'));
      card.appendChild(fakten);
      card.appendChild(el('span', 'kosten-land__link', 'Aufschlüsselung ansehen →'));
      container.appendChild(card);
    });

    (Array.isArray(window.LAENDER) ? window.LAENDER : []).forEach(function (l) {
      if (l.status === 'geplant' || abgerechnet[l.slug]) return;
      var card = el('div', 'kosten-land kosten-land--offen');
      card.appendChild(el('span', 'kosten-land__name', l.name));
      card.appendChild(el('span', 'kosten-land__zeit', l.status === 'aktuell' ? 'Wir sind gerade hier' : l.zeitraum));
      card.appendChild(el('span', 'kosten-land__summe', 'Abrechnung folgt'));
      card.appendChild(el('span', 'kosten-land__fakten', 'Wir rechnen ab, sobald wir das Land abgeschlossen haben.'));
      container.appendChild(card);
    });
  }

  return {
    init: init,
    initOverview: initOverview,
    initVergleich: initVergleich,
    initTabelle: initTabelle,
    initLaenderKarten: initLaenderKarten,
    fillText: fillText,
    land: land,
    laender: laender,
    summe: summe
  };
})();
