'use strict';

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

  /* ── Counter Animation ──────────────────────────────── */
  function observeCounters(root = document) {
    const counters = root.querySelectorAll('[data-count]');
    if (!counters.length) return;
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(el => counterObserver.observe(el));
  }
  observeCounters();
  window.observeCounters = observeCounters;

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
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

  /* ── Filter Buttons ──────────────────────────────────── */
document.querySelectorAll('.filter-bar:not(#blog-filter-bar)').forEach(bar => {
    const btns = bar.querySelectorAll('.filter-btn');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        filterItems(filter);
      });
    });
  });

  function filterItems(filter) {
    const items = document.querySelectorAll('[data-category]');
    items.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.style.display = '';
        item.style.animation = 'fade-in 0.3s ease';
      } else {
        item.style.display = 'none';
      }
    });
  }

  /* ── Dropdown "Länder": Klick auf Button → laender.html ─── */
  document.querySelectorAll('.nav__dropdown-toggle[data-href]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.dataset.href) window.location.href = btn.dataset.href;
    });
  });

  /* ── Newsletter Form ─────────────────────────────────── */
  const newsletterForms = document.querySelectorAll('.newsletter__form');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter__input');
      const btn = form.querySelector('.btn');
      if (!input || !input.value.includes('@')) {
        input?.classList.add('error');
        return;
      }
      btn.textContent = 'Angemeldet! ✓';
      btn.disabled = true;
      btn.style.background = 'var(--green-600)';
      input.value = '';
    });
  });

  /* ── Interactive Map (karte.html) ─────────────────────── */
  const mapCountries = document.querySelectorAll('.map-country');

  mapCountries.forEach(country => {
    country.addEventListener('mouseenter', () => {
      const name = country.dataset.country;
      const card = document.querySelector(`[data-map-card="${name}"]`);
      document.querySelectorAll('.map-country-card').forEach(c => c.classList.remove('active'));
      if (card) {
        card.classList.add('active');
        card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
    country.addEventListener('click', () => {
      const url = country.dataset.url;
      if (url) window.location.href = url;
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
      loadGA4();
    });
  }
  
  if (cookieDecline) {
    cookieDecline.addEventListener('click', () => {
      localStorage.setItem('ans_cookie', 'declined');
      cookieBanner.classList.remove('show');
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
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-FXRW5YYPTB';
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-FXRW5YYPTB', { anonymize_ip: true });
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

  /* ── Progress Tracker (reise-status) ─────────────────── */
  const progressBars = document.querySelectorAll('[data-progress]');
  progressBars.forEach(bar => {
    const pct = bar.dataset.progress;
    const fill = bar.querySelector('.progress-fill');
    if (fill) {
      setTimeout(() => { fill.style.width = pct + '%'; }, 300);
    }
  });

});
