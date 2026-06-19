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

  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
  }

  /* ── Active nav link ────────────────────────────────── */
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link, .nav__mobile-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (href === currentPage || (currentPage === '' && href === 'index.html'))) {
      link.classList.add('active');
    }
  });

  /* ── Scroll Animations (Intersection Observer) ───────── */
  const animEls = document.querySelectorAll('.animate-on-scroll');
  if (animEls.length) {
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

  /* ── Counter Animation ──────────────────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
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

  /* ── Video Modal ─────────────────────────────────────── */
  const videoModal = document.querySelector('.video-modal');
  const videoFrame = document.querySelector('.video-modal__iframe');
  const videoClose = document.querySelector('.video-modal__close');

  document.querySelectorAll('[data-video]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const videoId = el.dataset.video;
      if (!videoId || !videoModal || !videoFrame) return;
      videoFrame.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
      videoModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  if (videoClose) {
    videoClose.addEventListener('click', closeVideoModal);
  }
  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  function closeVideoModal() {
    if (!videoModal || !videoFrame) return;
    videoModal.classList.remove('open');
    videoFrame.src = '';
    document.body.style.overflow = '';
  }

  /* ── Gallery Lightbox ───────────────────────────────── */
  const lightbox = document.querySelector('.lightbox');
  const lightboxImg = document.querySelector('.lightbox__img');
  const lightboxClose = document.querySelector('.lightbox__close');

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      if (!lightbox || !lightboxImg) return;
      const src = el.dataset.lightbox;
      const placeholder = el.querySelector('.gallery-placeholder');
      if (src) {
        lightboxImg.src = src;
        lightboxImg.style.display = 'block';
      }
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* ── Filter Buttons ──────────────────────────────────── */
  document.querySelectorAll('.filter-bar').forEach(bar => {
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
      const href = btn.dataset.href;
      if (!href) return;
      const menu = btn.closest('.nav__dropdown')?.querySelector('.nav__dropdown-menu');
      const isVisible = menu && getComputedStyle(menu).opacity > 0.5;
      if (isVisible) {
        window.location.href = href;
      }
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

  /* ── Contact Form ────────────────────────────────────── */
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn');
      btn.textContent = 'Nachricht gesendet ✓';
      btn.disabled = true;
      btn.style.background = 'var(--green-600)';
    });
  }

  /* ── Interactive Map (karte.html) ─────────────────────── */
  const mapCountries = document.querySelectorAll('.map-country');
  const mapInfo = document.querySelector('.map-info-panel');

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
      const name = country.dataset.country;
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
        if (mobileMenu?.classList.contains('open')) {
          mobileMenu.classList.remove('open');
          burger?.classList.remove('open');
          document.body.style.overflow = '';
        }
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
    });
  }
  if (cookieDecline) {
    cookieDecline.addEventListener('click', () => {
      localStorage.setItem('ans_cookie', 'declined');
      cookieBanner.classList.remove('show');
    });
  }

  /* ── Keyboard Escape ─────────────────────────────────── */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModal();
      closeLightbox();
      if (mobileMenu?.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        burger?.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });

  /* ── Load More (vlogs) ───────────────────────────────── */
  const loadMoreBtn = document.querySelector('.load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      const hiddenCards = document.querySelectorAll('.vlog-card.hidden');
      hiddenCards.forEach((card, i) => {
        setTimeout(() => {
          card.classList.remove('hidden');
          card.style.animation = 'fade-in-up 0.4s ease forwards';
        }, i * 100);
      });
      if (document.querySelectorAll('.vlog-card.hidden').length === 0) {
        loadMoreBtn.style.display = 'none';
      }
    });
  }

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
