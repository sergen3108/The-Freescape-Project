/* ============================================================
   LAND-PAGE.JS: Blog-Artikel und Vlogs fuer EINE Laenderseite
   ------------------------------------------------------------
   Gemeinsam genutzt von kolumbien.html, ecuador.html, peru.html,
   bolivien.html, chile.html und argentinien.html. Das Land kommt
   aus dem Script-Tag:

     <script src="land-page.js" data-land="peru" defer></script>

   Optional: data-blog-max="8" fuer mehr Blog-Karten (Standard 6).

   Braucht: blog-posts.js, laender-config.js, vlog-utils.js und
   main.js davor geladen.
   ============================================================ */

(function () {
  var script    = document.currentScript;
  var LAND_SLUG = script ? script.dataset.land : '';
  var BLOG_MAX  = (script && parseInt(script.dataset.blogMax, 10)) || 6;
  if (!LAND_SLUG) return;

  function linkOrteToArticles(posts) {
    var chips = document.querySelectorAll('.ort-chip[data-ort]');
    chips.forEach(function (chip) {
      var name = chip.getAttribute('data-ort').toLowerCase();
      // Exakter Tag-Abgleich statt Freitext-Suche in Titel/Teaser: sonst
      // gewinnt faelschlicherweise ein neuerer Artikel, der den Ort nur
      // beilaeufig im Teaser erwaehnt (z.B. "Mindo war unser Gegenpol zu
      // Quito und Baños" hat sonst die Quito/Baños-Chips gekapert).
      var match = posts.filter(function (p) {
        return (p.tags || []).some(function (t) { return t.toLowerCase() === name; });
      })[0];
      if (match) chip.setAttribute('href', match.link);
    });
  }

  // HTML-Escaping fuer Texte aus vlogs-data.json und Blog-Frontmatter, die
  // per String-Konkatenation in innerHTML landen (wie in vlogs.html).
  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ── Blog-Artikel dieses Landes ─────────────────────────── */
  function renderBlog(posts) {
    var grid    = document.getElementById('land-blog-grid');
    var empty   = document.getElementById('land-blog-empty');
    var statEl  = document.getElementById('stat-blog-num');
    var mine    = (posts || []).filter(function (p) {
      return window.slugifyLand(p.land) === LAND_SLUG;
    });

    if (statEl) {
      statEl.setAttribute('data-count', mine.length);
      statEl.textContent = '0';
      if (window.observeCounters) window.observeCounters();
    }
    linkOrteToArticles(mine);

    if (!mine.length) {
      grid.style.display = 'none';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';
    var hub = mine.find(function (p) { return p.typ === 'reiseroute'; });
    var others = mine.filter(function (p) { return p !== hub; }).slice(0, hub ? BLOG_MAX - 1 : BLOG_MAX);
    var toRender = hub ? [hub].concat(others) : others;
    grid.innerHTML = toRender.map(function (p) {
      var thumb = p.bild
        ? '<img src="' + p.bildKlein + '" alt="' + escapeHtml(p.titel) + '" loading="lazy">'
        : '<div style="height:160px;background:' + p.bildFallback.gradient + ';display:flex;align-items:center;justify-content:center;font-size:2.5rem;">' + (p.bildFallback.emoji === '' ? '<span style="font-size:1.05rem;font-weight:600;opacity:0.75;">Bild folgt in Kürze</span>' : p.bildFallback.emoji) + '</div>';
      var isHub = p === hub;
      return '<a href="' + p.link + '" class="blog-teaser-card">' + thumb +
        '<div class="blog-teaser-card__body">' +
          (isHub ? '<span class="blog-teaser-card__badge">Reiseroute</span><br>' : '') +
          '<div class="blog-teaser-card__title">' + escapeHtml(p.titel) + '</div>' +
          '<div class="blog-teaser-card__meta">' + escapeHtml(p.datumLabel) + ' · ' + escapeHtml(p.lesezeit) + '</div>' +
        '</div></a>';
    }).join('');
  }

  if (window.BLOG_POSTS) {
    renderBlog(window.BLOG_POSTS);
  } else {
    document.addEventListener('blogPostsReady', function () { renderBlog(window.BLOG_POSTS || []); });
  }

  /* ── Vlogs dieses Landes (aus lokaler vlogs-data.json) ──── */
  function formatDate(iso) {
    return new Date(iso).toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  }

  function buildThumb(v) {
    if (v.thumb) {
      return '<img src="' + v.thumb + '" alt="' + escapeHtml(v.title) + '" loading="lazy" style="width:100%;aspect-ratio:16/9;object-fit:cover;display:block;">' +
        '<span class="vlog-card__play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>';
    }
    return '<div class="vlog-thumb-fallback"><span class="vlog-card__play" style="position:static;transform:none;"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span></div>';
  }

  function makeCard(v, i) {
    var delay = ['', 'animate-delay-1', 'animate-delay-2'][i % 3];
    var ort = window.VlogUtils ? window.VlogUtils.detectOrt(v.description) : null;
    var desc = (v.description || '').slice(0, 120).trim();
    return '<article class="vlog-card ' + delay + '" data-video-id="' + v.id + '">' +
      '<div class="vlog-card__thumb">' +
        '<a href="https://www.youtube.com/watch?v=' + v.id + '" target="_blank" rel="noopener" style="display:block;position:relative;">' + buildThumb(v) + '</a>' +
      '</div>' +
      '<div class="vlog-card__body">' +
        '<div class="vlog-card__meta">' +
          (ort ? '<span class="vlog-card__country">📍 ' + escapeHtml(ort) + '</span>' : '') +
          '<span class="vlog-card__date">' + formatDate(v.publishedAt) + '</span>' +
        '</div>' +
        '<h3 class="vlog-card__title">' + escapeHtml(v.title) + '</h3>' +
        '<p class="vlog-card__desc">' + escapeHtml(desc) + (desc.length >= 120 ? '…' : '') + '</p>' +
        '<div class="vlog-card__footer">' +
          '<a href="https://www.youtube.com/watch?v=' + v.id + '" target="_blank" rel="noopener" class="vlog-card__watch">Auf YouTube ansehen →</a>' +
          '<span class="vlog-card__blog-link"></span>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  // Traegt nachtraeglich einen "Zum Blogartikel"-Link in die Vlog-Karten ein,
  // sobald window.BLOG_POSTS geladen ist (laeuft parallel zu den Vlogs, daher
  // getrennt statt den Vlog-Render zu blockieren).
  function enrichVlogCardsWithBlogLinks(videos) {
    function apply(posts) {
      if (!posts || !posts.length || !window.VlogUtils) return;
      videos.forEach(function (v) {
        var post = window.VlogUtils.findMatchingPost(v, posts);
        if (!post) return;
        var el = document.querySelector('.vlog-card[data-video-id="' + v.id + '"] .vlog-card__blog-link');
        if (el) el.innerHTML = ' · <a href="' + post.link + '" class="vlog-card__watch">Zum Blogartikel →</a>';
      });
    }
    if (window.BLOG_POSTS) apply(window.BLOG_POSTS);
    else document.addEventListener('blogPostsReady', function () { apply(window.BLOG_POSTS || []); }, { once: true });
  }

  function loadVlogs() {
    var loading    = document.getElementById('land-vlogs-loading');
    var grid       = document.getElementById('land-vlogs-grid');
    var empty      = document.getElementById('land-vlogs-empty');
    var shortsTab  = document.getElementById('land-shorts-tab');
    var shortsGrid = document.getElementById('land-shorts-grid');

    fetch('vlogs-data.json', { cache: 'no-cache' })
      .then(function (res) { if (!res.ok) throw new Error('no data'); return res.json(); })
      .then(function (data) {
        var mine = (data.videos || []).filter(function (v) {
          return window.detectCountry(v.title) === LAND_SLUG;
        });
        var videos = mine.filter(function (v) { return !window.VlogUtils.isShort(v); });
        var shorts = mine.filter(function (v) { return window.VlogUtils.isShort(v); });
        var statEl = document.getElementById('stat-vlogs-num');
        if (statEl) {
          statEl.setAttribute('data-count', mine.length);
          statEl.textContent = '0';
          if (window.observeCounters) window.observeCounters();
        }

        if (loading) loading.style.display = 'none';

        if (!mine.length) {
          empty.style.display = 'block';
          return;
        }

        grid.innerHTML = videos.map(makeCard).join('');
        grid.querySelectorAll('.vlog-card').forEach(function (el) { el.classList.add('visible'); });
        window.VlogUtils.limitCards(grid, 3, 'Vlogs');

        if (shorts.length) {
          shortsGrid.innerHTML = shorts.map(makeCard).join('');
          shortsGrid.querySelectorAll('.vlog-card').forEach(function (el) { el.classList.add('visible'); });
          window.VlogUtils.limitCards(shortsGrid, 3, 'Shorts');
          shortsTab.style.display = '';
        }

        enrichVlogCardsWithBlogLinks(mine);
      })
      .catch(function (err) {
        console.error('[' + LAND_SLUG + '] Vlogs konnten nicht geladen werden:', err);
        if (loading) loading.style.display = 'none';
        empty.style.display = 'block';
      });
  }

  document.querySelectorAll('#land-content-tabs .content-tab').forEach(function (tab) {
    tab.addEventListener('click', function () {
      document.querySelectorAll('#land-content-tabs .content-tab').forEach(function (t) { t.classList.remove('active'); });
      document.querySelectorAll('#tab-land-videos, #tab-land-shorts').forEach(function (p) { p.classList.remove('active'); });
      tab.classList.add('active');
      document.getElementById('tab-land-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Als defer-Skript laeuft diese Datei vor DOMContentLoaded, aber nach
  // vlog-utils.js und laender-config.js. Die Vlogs trotzdem erst bei
  // DOMContentLoaded holen, wie bisher auf den Laenderseiten.
  document.addEventListener('DOMContentLoaded', loadVlogs);
})();
