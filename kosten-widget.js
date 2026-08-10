/* Kosten-Widget fuer die Laenderseiten (kolumbien/ecuador/peru.html).
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

  function renderDonut(svg, kategorien, sum) {
    var svgns = 'http://www.w3.org/2000/svg';
    var R = 80, CX = 100, CY = 100, STROKE = 30, GAP = 3;
    svg.innerHTML = '';
    svg.setAttribute('viewBox', '0 0 200 200');

    var active = CATS.filter(function (c) { return (kategorien[c.key] || 0) > 0; });
    var circumference = 2 * Math.PI * R;
    var usable = circumference - GAP * active.length;

    var g = document.createElementNS(svgns, 'g');
    g.setAttribute('transform', 'rotate(-90 ' + CX + ' ' + CY + ')');
    svg.appendChild(g);

    var cum = 0;
    active.forEach(function (c) {
      var betrag = kategorien[c.key];
      var segLen = (betrag / sum) * usable;
      var circle = document.createElementNS(svgns, 'circle');
      circle.setAttribute('cx', CX);
      circle.setAttribute('cy', CY);
      circle.setAttribute('r', R);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', c.color);
      circle.setAttribute('stroke-width', STROKE);
      circle.setAttribute('stroke-dasharray', segLen.toFixed(2) + ' ' + (circumference - segLen).toFixed(2));
      circle.setAttribute('stroke-dashoffset', (-cum).toFixed(2));
      var title = document.createElementNS(svgns, 'title');
      title.textContent = c.label + ': ' + fmtEUR(betrag);
      circle.appendChild(title);
      g.appendChild(circle);
      cum += segLen + GAP;
    });
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
    if (svg)        renderDonut(svg, kategorien, sum);

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

  function init(root, config) {
    if (!root) return;
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

  return { init: init };
})();
