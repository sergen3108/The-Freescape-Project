'use strict';

/* ── Vorschaubild-Fallback ─────────────────────────────────
   Bilder unter assets/img/thumbs/ erzeugt die GitHub Action
   (scripts/optimize-images.js) erst nach dem Push. Fehlt eins
   (noch), wird stattdessen das Original geladen. error-Events
   steigen nicht auf, daher in der Capture-Phase abfangen. */
document.addEventListener('error', (e) => {
  const img = e.target;
  if (!img || img.tagName !== 'IMG' || img.dataset.thumbFallback) return;
  const src = img.getAttribute('src') || '';
  if (src.indexOf('assets/img/thumbs/') === -1) return;
  img.dataset.thumbFallback = '1';
  img.src = src.replace('assets/img/thumbs/', 'assets/img/');
}, true);

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navigation ─────────────────────────────────────── */
  const nav = document.querySelector('.nav');
  const burger = document.querySelector('.nav__burger');
  const mobileMenu = document.querySelector('.nav__mobile');

  if (nav) {
    const updateNav = () => {
      if (window.scrollY > 60) {
        nav.classList.remove('nav--transparent');
        nav.classList.add('nav--solid');
      } else {
        nav.classList.add('nav--transparent');
        nav.classList.remove('nav--solid');
      }
    };
    window.addEventListener('scroll', updateNav, { passive: true });
    updateNav();
  }

  const laenderToggle = mobileMenu?.querySelector('.nav__mobile-toggle');
  const laenderSubmenu = mobileMenu?.querySelector('.nav__mobile-submenu');

  const closeMobileMenu = () => {
    if (!burger || !mobileMenu) return;
    burger.classList.remove('open');
    mobileMenu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    // Untermenü bei jedem Schließen zurücksetzen, damit es beim erneuten
    // Öffnen wieder eingeklappt startet
    laenderToggle?.classList.remove('open');
    laenderToggle?.setAttribute('aria-expanded', 'false');
    laenderSubmenu?.setAttribute('hidden', '');
  };

  if (burger && mobileMenu) {
    const openMobileMenu = () => {
      burger.classList.add('open');
      mobileMenu.classList.add('open');
      burger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      mobileMenu.querySelector('.nav__mobile-link')?.focus();
    };

    burger.addEventListener('click', () => {
      if (mobileMenu.classList.contains('open')) closeMobileMenu();
      else openMobileMenu();
    });

    // "Länder"-Button klappt das Untermenü auf/zu, ohne das ganze Menü zu schließen
    if (laenderToggle && laenderSubmenu) {
      laenderToggle.addEventListener('click', () => {
        const isOpen = laenderToggle.classList.toggle('open');
        laenderToggle.setAttribute('aria-expanded', String(isOpen));
        if (isOpen) laenderSubmenu.removeAttribute('hidden');
        else laenderSubmenu.setAttribute('hidden', '');
      });
    }

    // Menü schließen, sobald ein echter Link geklickt wird (auch bei
    // target="_blank", z.B. der YouTube-Link, wo sonst nichts die Seite/den
    // Zustand zurücksetzt). Der "Länder"-Umschalter (ein <button>, kein <a>)
    // ist bewusst ausgeschlossen.
    mobileMenu.querySelectorAll('a.nav__mobile-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    // Menü automatisch schließen, wenn der Viewport über die Mobile-Breakpoint
    // hinaus vergrößert wird (z.B. Tablet-Drehung), sonst bleibt es offen und
    // body.overflow gesperrt, obwohl der Burger nicht mehr sichtbar ist.
    const desktopQuery = window.matchMedia('(min-width: 1025px)');
    desktopQuery.addEventListener('change', (e) => {
      if (e.matches && mobileMenu.classList.contains('open')) closeMobileMenu();
    });

    // Fokus-Falle: Tab am letzten sichtbaren Link springt zurück zum
    // Burger-Button, statt in den (visuell verdeckten) Seiteninhalt dahinter
    // zu wandern. offsetParent ist null für nicht sichtbare Elemente (z.B.
    // Länder-Untermenü, solange eingeklappt), daher werden die passend
    // ausgefiltert statt fest verdrahtet zu sein.
    mobileMenu.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || e.shiftKey) return;
      const focusable = [...mobileMenu.querySelectorAll('a.nav__mobile-link, .nav__mobile-toggle')]
        .filter(el => el.offsetParent !== null);
      if (document.activeElement === focusable[focusable.length - 1]) {
        e.preventDefault();
        burger.focus();
      }
    });
  }

  /* ── Active nav link ────────────────────────────────── */
  // data-page zuerst pruefen (auch bei <button>-Elementen wie dem
  // "Laender"-Dropdown-Toggle vorhanden, die kein href haben), sonst href.
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
    const page = link.dataset.page || link.getAttribute('href');
    if (page && (page === currentPage || (currentPage === '' && page === 'index.html'))) {
      link.classList.add('active');
    }
  });

  /* ── Scroll Animations (Intersection Observer) ───────── */
  function observeAnimations(root = document) {
    const animEls = root.querySelectorAll('.animate-on-scroll, .img-reveal-wrap');
    if (!animEls.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
    animEls.forEach(el => observer.observe(el));
  }
  observeAnimations();
  window.observeAnimations = observeAnimations;

  /* ── Tage im Land (aus laender-config.js, taeglich aktuell) ──
     Element mit data-tage-land="<slug>": Summe aller Aufenthalte
     (Ende minus Start, Abreisetag zaehlt zum naechsten Land), offenes
     Ende (null) zaehlt bis einschliesslich heute. Bei fehlenden Daten
     bleibt der statische data-count als Fallback. */
  const morgen = new Date();
  morgen.setHours(0, 0, 0, 0);
  morgen.setDate(morgen.getDate() + 1);
  const tageZwischen = (von, bis) => {
    const start = new Date(von + 'T00:00:00');
    const ende = bis ? new Date(bis + 'T00:00:00') : morgen;
    const d = Math.round((ende - start) / 86400000);
    return isNaN(d) || d < 0 ? 0 : d;
  };
  document.querySelectorAll('[data-tage-land]').forEach(el => {
    const land = (window.LAENDER || []).find(l => l.slug === el.dataset.tageLand);
    if (!land || !Array.isArray(land.tage) || !land.tage.length) return;
    const summe = land.tage.reduce((s, [von, bis]) => s + tageZwischen(von, bis), 0);
    el.setAttribute('data-count', summe);
  });

  /* ── Counter Animation ──────────────────────────────── */
  function observeCounters(root = document) {
    // dataset-Flag verhindert Re-Observe, wenn observeCounters() mehrfach
    // pro Seite aufgerufen wird (z.B. sobald Blog- und Vlog-Stat async
    // nachladen) - sonst laeuft dieselbe Zahl mehrfach von 0 hoch.
    const counters = Array.from(root.querySelectorAll('[data-count]')).filter(el => !el.dataset.counterObserved);
    if (!counters.length) return;
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => {
      el.dataset.counterObserved = 'true';
      counterObserver.observe(el);
    });
  }
  observeCounters();
  window.observeCounters = observeCounters;

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = target.toLocaleString('de-DE');
      return;
    }
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('de-DE');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ── Dropdown "Länder": Klick auf Button → laender.html ─── */
  document.querySelectorAll('.nav__dropdown-toggle[data-href]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.href) window.location.href = btn.dataset.href;
    });
  });

  /* ── Smooth Scroll for anchor links ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
        if (mobileMenu?.classList.contains('open')) closeMobileMenu();
      }
    });
  });

  /* ── Cookie Banner ───────────────────────────────────── */
  const GA_ID = 'G-FXRW5YYPTB';
  const cookieBanner = document.querySelector('.cookie-banner');
  const cookieAccept = document.querySelector('.cookie-btn-accept');
  const cookieDecline = document.querySelector('.cookie-btn-decline');

  if (cookieBanner && !localStorage.getItem('ans_cookie')) {
    setTimeout(() => cookieBanner.classList.add('show'), 1200);
  }
  if (cookieAccept) {
    cookieAccept.addEventListener('click', () => {
      localStorage.setItem('ans_cookie', 'accepted');
      cookieBanner.classList.remove('show');
      window['ga-disable-' + GA_ID] = false;
      loadGA4();
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener('click', () => {
      localStorage.setItem('ans_cookie', 'declined');
      // "Nur notwendige" gilt laut Bannertext fuer Analytics UND Karte
      localStorage.removeItem('map_consent');
      cookieBanner.classList.remove('show');
      revokeGA4();
    });
  }

  const cookieSettingsBtn = document.getElementById('cookieSettingsBtn');
  if (cookieSettingsBtn) {
    cookieSettingsBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('ans_cookie');
      localStorage.removeItem('map_consent');
      if (cookieBanner) cookieBanner.classList.add('show');
    });
  }

  /* ── GA4 (consent-abhängig) ──────────────────────────── */
  function loadGA4() {
    if (document.querySelector('script[src*="gtag"]')) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  // Widerruf: GA auf der offenen Seite stoppen (offizielles Opt-out-Flag)
  // und die bereits gesetzten _ga-Cookies loeschen, die sonst bis zu zwei
  // Jahre liegen bleiben. GA setzt sie auf der Hauptdomain mit fuehrendem
  // Punkt, daher alle Domain-Varianten durchprobieren.
  function revokeGA4() {
    window['ga-disable-' + GA_ID] = true;
    const host = window.location.hostname;
    const domains = ['', host, '.' + host, '.' + host.split('.').slice(-2).join('.')];
    document.cookie.split(';').forEach(c => {
      const name = c.split('=')[0].trim();
      if (!/^_ga/.test(name)) return;
      domains.forEach(d => {
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  if (localStorage.getItem('ans_cookie') === 'accepted') {
    loadGA4();
  }

  /* ── Keyboard Escape ─────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (mobileMenu?.classList.contains('open')) {
        closeMobileMenu();
        burger?.focus();
      }
    }
  });

  /* ── Language Switcher ───────────────────────────────── */
  const langBtn = document.querySelector('.lang-switcher__btn');
  const langDropdown = document.querySelector('.lang-switcher__dropdown');
  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = langDropdown.classList.toggle('open');
      langBtn.setAttribute('aria-expanded', String(isOpen));
    });
    document.addEventListener('click', () => {
      langDropdown.classList.remove('open');
      langBtn.setAttribute('aria-expanded', 'false');
    });
    document.querySelectorAll('.lang-switcher__option').forEach(opt => {
      opt.addEventListener('click', () => {
        document.querySelectorAll('.lang-switcher__option').forEach(o => o.classList.remove('lang-switcher__option--active'));
        opt.classList.add('lang-switcher__option--active');
        langBtn.querySelector('.lang-switcher__flag').textContent = opt.dataset.flag;
        langBtn.querySelector('.lang-switcher__label').textContent = opt.dataset.label;
        langDropdown.classList.remove('open');
        langBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

});
