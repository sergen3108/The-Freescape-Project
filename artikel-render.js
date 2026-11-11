/* ============================================================
   ARTIKEL-RENDER.JS: Ein Blog-Artikel als HTML
   ------------------------------------------------------------
   Geteilt zwischen
     - scripts/build-articles.js (GitHub Action): erzeugt aus
       artikel.html und posts/<slug>.md die fertige Seite
       blog/<slug>.html mit Titel, Vorschaubild und Text im
       Quelltext
     - artikel.html im Browser: Rueckfall fuer alte Links
       (artikel.html?post=<slug>) und fuer Artikel, deren fertige
       Seite noch nicht erzeugt ist

   Beide nutzen dieselben Funktionen, damit die erzeugte Seite und
   die Rueckfall-Ansicht gleich aussehen. Aenderungen am Aufbau
   eines Artikels gehoeren hierher.

   Braucht marked (assets/vendor/marked.min.js), wird als Parameter
   uebergeben.
   ============================================================ */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ArtikelRender = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var BASE_URL = 'https://thefreescapeproject.com';
  var FALLBACK_IMG = BASE_URL + '/assets/img/FujiFun.jpeg';
  var TYP_LABELS = { guide: 'Routen-Guide', kosten: 'Kosten-Check', safety: 'Sicherheit', persoenlich: 'Erfahrungsbericht', reiseroute: 'Reiseroute' };
  var MONATE = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];

  // HTML-Escaping fuer Frontmatter-Texte (Titel, Teaser, Autor ...).
  // Der Artikeltext selbst wird bewusst als Markdown -> HTML gerendert.
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* Frontmatter lesen: "key: value" und Listen zwischen den beiden
     "---". 1:1 wie parseFrontmatterRaw() in blog-posts.js und
     parseFrontmatterFull() in scripts/generate-feeds.js, bei
     Aenderungen dort mitziehen. Liefert { data, body } oder null. */
  function parseFrontmatter(text) {
    var normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    var match = normalized.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) return null;

    var data = {};
    var listKey = null;
    match[1].split('\n').forEach(function (line) {
      var listMatch = line.match(/^\s{2}-\s(.+)/);
      if (listMatch && listKey) {
        if (!Array.isArray(data[listKey])) data[listKey] = [];
        data[listKey].push(listMatch[1].trim());
        return;
      }
      var sep = line.indexOf(':');
      if (sep === -1) { listKey = null; return; }
      var key = line.slice(0, sep).trim();
      var rawVal = line.slice(sep + 1).trim();
      var val = rawVal.replace(/^["']|["']$/g, '');
      if (rawVal === '') {
        listKey = key;
      } else {
        listKey = null;
        data[key] = val;
      }
    });
    return { data: data, body: match[2] || '' };
  }

  // Adresse der fertigen Artikelseite, relativ zum Seitenstamm
  function pagePath(slug) { return 'blog/' + slug + '.html'; }
  function pageUrl(slug) { return BASE_URL + '/' + pagePath(slug); }

  function bildUrl(data) {
    if (!data.bild) return FALLBACK_IMG;
    if (data.bild.indexOf('http') === 0) return data.bild;
    return BASE_URL + (data.bild.charAt(0) === '/' ? '' : '/') + data.bild;
  }

  function tagsOf(data) { return Array.isArray(data.tags) ? data.tags : []; }

  /* Kopfdaten: Titel, Beschreibung, Vorschaubild, Adresse und die
     strukturierten Daten (Schema.org) fuer Suchmaschinen. */
  function meta(data, slug) {
    var url = pageUrl(slug);
    var image = bildUrl(data);

    // Autor kann "Sergen & Julia" sein: in einzelne Personen aufteilen
    var autoren = (data.autor || 'Sergen & Julia').split(/\s*(?:&|und|,)\s*/).filter(Boolean).map(function (name) {
      return { '@type': 'Person', 'name': name.trim() };
    });

    var schema = {
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': data.titel || 'Artikel',
      'description': data.teaser || '',
      'image': image,
      'author': autoren.length === 1 ? autoren[0] : autoren,
      'publisher': {
        '@type': 'Organization',
        'name': 'The Freescape Project',
        'logo': { '@type': 'ImageObject', 'url': BASE_URL + '/assets/img/LOGONEW.png' }
      },
      'datePublished': data.datum || '',
      'dateModified': data.datum || '',
      'mainEntityOfPage': { '@type': 'WebPage', '@id': url },
      'inLanguage': 'de-DE'
    };
    if (data.land) schema.about = { '@type': 'Place', 'name': data.land };

    return {
      title: (data.titel || 'Artikel') + ' | The Freescape Project',
      description: data.teaser || '',
      image: image,
      url: url,
      schema: schema
    };
  }

  /* Der sichtbare Artikel (Titelbild, Text, Inhaltsverzeichnis, Teilen).
     opts.anchorPrefix: Seitenpfad vor den Sprungmarken des
     Inhaltsverzeichnisses. Auf den erzeugten Seiten noetig, weil dort
     <base href="/"> gilt und "#abschnitt-1" sonst zur Startseite fuehrt. */
  function renderBody(data, body, slug, marked, opts) {
    opts = opts || {};
    var anchorPrefix = opts.anchorPrefix || '';
    var typLabel = TYP_LABELS[data.typ] || 'Artikel';
    var tags = tagsOf(data);

    var bildSrc = data.bild || '';
    if (bildSrc && bildSrc.charAt(0) !== '/' && bildSrc.indexOf('http') !== 0) bildSrc = '/' + bildSrc;

    var heroHtml = bildSrc
      ? '<img class="artikel-hero__img" src="' + bildSrc + '" alt="' + escapeHtml(data.titel) + '">'
      : '<div class="artikel-hero__fallback" style="background:' + (data.bildGradient || 'linear-gradient(135deg,#1a2744,#e8431a)') + ';">' + (data.bildEmoji === '' ? '<span style="font-size:1.6rem;font-weight:600;opacity:0.8;">Bild folgt in Kürze</span>' : (data.bildEmoji !== undefined ? data.bildEmoji : '✈️')) + '</div>';

    var d = data.datum ? new Date(data.datum + 'T12:00:00') : new Date();
    var datumLabel = d.getDate() + '. ' + MONATE[d.getMonth()] + ' ' + d.getFullYear();

    // Bilder im Artikeltext bekommen loading="lazy" (liegen immer unterhalb des Heros)
    var renderer = new marked.Renderer();
    renderer.image = function (href, title, text) {
      return '<img src="' + href + '" alt="' + (text || '') + '"' +
        (title ? ' title="' + title + '"' : '') + ' loading="lazy">';
    };
    marked.setOptions({ breaks: true, gfm: true, renderer: renderer });

    var parsedBody = marked.parse(body);

    // Verweise auf andere Artikel in der alten Schreibweise
    // (artikel.html?post=<slug>) auf die fertigen Seiten umstellen
    parsedBody = parsedBody.replace(/href="\/?artikel\.html\?post=([\w-]+?)(?:\.md)?(#[^"]*)?"/g, function (m, ziel, anker) {
      return 'href="' + pagePath(ziel) + (anker || '') + '"';
    });

    // IDs an die h2-Ueberschriften fuer das Inhaltsverzeichnis
    var tocIndex = 0;
    parsedBody = parsedBody.replace(/<h2>(.*?)<\/h2>/g, function (match, title) {
      return '<h2 id="abschnitt-' + (tocIndex++) + '">' + title + '</h2>';
    });

    var h2Matches = [];
    body.replace(/^## (.+)$/gm, function (m, titel) { h2Matches.push(titel); return m; });
    var tocHtml = h2Matches.length > 1
      ? '<div class="toc-widget"><h4>Inhaltsverzeichnis</h4><ul class="toc-list">' +
          h2Matches.map(function (titel, i) { return '<li><a href="' + anchorPrefix + '#abschnitt-' + i + '">' + titel + '</a></li>'; }).join('') +
        '</ul></div>'
      : '';

    // Teilen: immer die Adresse der fertigen Seite, damit WhatsApp und
    // Pinterest Titel und Bild des Artikels anzeigen
    var shareUrl   = encodeURIComponent(pageUrl(slug));
    var shareTitle = encodeURIComponent(data.titel || '');
    var shareImg   = encodeURIComponent(bildUrl(data));
    var shareHtml = `
      <div class="share-bar">
        <a href="https://wa.me/?text=${shareTitle}%20${shareUrl}" target="_blank" rel="noopener" class="share-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.554 4.103 1.523 5.824L0 24l6.388-1.676A11.954 11.954 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.017-1.378l-.36-.214-3.732.979 1.001-3.645-.235-.374A9.818 9.818 0 1 1 12 21.818z"/></svg>
          WhatsApp
        </a>
        <a href="https://pinterest.com/pin/create/button/?url=${shareUrl}&media=${shareImg}&description=${shareTitle}" target="_blank" rel="noopener" class="share-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345c-.091.379-.293 1.194-.333 1.361-.052.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>
          Pinterest
        </a>
        <button onclick="navigator.clipboard.writeText(window.location.href).then(()=>{this.textContent='✓ Kopiert!';setTimeout(()=>{this.innerHTML='<svg width=\\'16\\' height=\\'16\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'2\\'><rect x=\\'9\\' y=\\'9\\' width=\\'13\\' height=\\'13\\' rx=\\'2\\'/><path d=\\'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1\\'/></svg> Link kopieren'},2000)})" class="share-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          Link kopieren
        </button>
      </div>`;

    var html =
      '<div id="artikel-top"></div>' +
      '<div class="artikel-hero">' +
        heroHtml +
        '<div class="artikel-hero__overlay"></div>' +
        '<div class="container artikel-hero__meta">' +
          '<span class="artikel-badge">' + typLabel + '</span>' +
          '<h1 style="color:white;margin:0.5rem 0;font-size:clamp(1.6rem,4vw,2.8rem);max-width:800px;line-height:1.2;">' + escapeHtml(data.titel) + '</h1>' +
          '<p style="color:rgba(255,255,255,0.7);margin:0.5rem 0 0;font-size:0.9rem;">' +
            escapeHtml(data.autor || 'Sergen & Julia') + ' · ' + datumLabel + ' · ' + escapeHtml(data.lesezeit || '5 min') + ' Lesezeit' +
            (data.land ? ' · ' + escapeHtml(data.land) : '') +
          '</p>' +
        '</div>' +
      '</div>' +
      '<div class="container">' +
        '<div class="artikel-layout">' +
          '<div class="artikel-body">' +
            '<a href="blog.html" class="artikel-back">← Zurück zum Blog</a>' +
            (data.teaser ? '<p class="artikel-teaser">' + escapeHtml(data.teaser) + '</p>' : '') +
            '<div class="artikel-meta-bar">' +
              '<span class="artikel-badge">' + typLabel + '</span>' +
              (data.land ? '<span style="font-size:0.85rem;color:var(--gray-500);">' + escapeHtml(data.land) + '</span>' : '') +
              '<span style="font-size:0.85rem;color:var(--gray-400);">' + datumLabel + '</span>' +
              '<span style="font-size:0.85rem;color:var(--gray-400);">' + escapeHtml(data.lesezeit || '5 min') + ' Lesezeit</span>' +
            '</div>' +
            '<div id="artikel-content">' + parsedBody + '</div>' +
            shareHtml +
            '<div id="artikel-video-teaser"></div>' +
            (tags.length ? '<div style="margin-top:2rem;padding-top:1.5rem;border-top:1px solid var(--gray-200);"><p style="font-size:0.8rem;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:var(--gray-400);margin-bottom:0.75rem;">Tags</p>' + tags.map(function (t) { return '<span class="tag">' + escapeHtml(t) + '</span>'; }).join('') + '</div>' : '') +
            '<div style="margin-top:3rem;padding-top:2rem;border-top:1px solid var(--gray-200);text-align:center;">' +
              '<a href="blog.html" class="btn btn-outline">← Alle Artikel</a>' +
            '</div>' +
          '</div>' +
          '<aside class="artikel-sidebar">' + tocHtml + '</aside>' +
        '</div>' +
      '</div>';

    return html;
  }

  return {
    BASE_URL: BASE_URL,
    escapeHtml: escapeHtml,
    parseFrontmatter: parseFrontmatter,
    pagePath: pagePath,
    pageUrl: pageUrl,
    tagsOf: tagsOf,
    meta: meta,
    renderBody: renderBody
  };
});
