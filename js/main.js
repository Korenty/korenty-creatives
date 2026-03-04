/* ============================================================
   KORENTY — Global JavaScript
   main.js — All dynamic behaviour across all pages
   ============================================================ */

(function () {
  'use strict';

  /* ─────────────────────────────────────────
     1. Navigation: transparent → solid on scroll
  ───────────────────────────────────────── */
  function initNav() {
    const nav = document.querySelector('.nav');
    if (!nav) return;

    const threshold = 60;
    function onScroll() {
      if (window.scrollY > threshold) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run on load
  }

  /* ─────────────────────────────────────────
     2. Mobile Menu Toggle
  ───────────────────────────────────────── */
  function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });

    // Close on outside click
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  /* ─────────────────────────────────────────
     3. Scroll Reveal (Intersection Observer)
  ───────────────────────────────────────── */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    if (!elements.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────
     4. Smooth Scroll for Anchor Links
  ───────────────────────────────────────── */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          const offset = 80;
          const top = target.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }

  /* ─────────────────────────────────────────
     5. Typewriter Effect
  ───────────────────────────────────────── */
  function initTypewriter() {
    const el = document.querySelector('[data-typewriter]');
    if (!el) return;

    const phrases = JSON.parse(el.dataset.typewriter || '[]');
    if (!phrases.length) return;

    let phraseIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let cursor = document.createElement('span');
    cursor.className = 'typewriter-cursor';
    el.appendChild(cursor);

    function type() {
      const current = phrases[phraseIdx];
      const speed = isDeleting ? 50 : 90;

      if (!isDeleting) {
        el.textContent = current.slice(0, ++charIdx);
        if (charIdx === current.length) {
          isDeleting = true;
          el.appendChild(cursor);
          setTimeout(type, 2200);
          return;
        }
      } else {
        el.textContent = current.slice(0, --charIdx);
        if (charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
        }
      }
      el.appendChild(cursor);
      setTimeout(type, speed);
    }

    el.textContent = '';
    type();
  }

  /* ─────────────────────────────────────────
     6. Parallax Scroll Effect
  ───────────────────────────────────────── */
  function initParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    if (!parallaxEls.length) return;

    function onScroll() {
      const scrollY = window.scrollY;
      parallaxEls.forEach(el => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ─────────────────────────────────────────
     7. Counter Animation
  ───────────────────────────────────────── */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const prefix = el.dataset.prefix || '';
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = prefix + current + suffix;
          if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });

    counters.forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────
     8. Carousel
  ───────────────────────────────────────── */
  function initCarousels() {
    document.querySelectorAll('[data-carousel]').forEach(carousel => {
      const track = carousel.querySelector('.carousel-track');
      const slides = carousel.querySelectorAll('.carousel-slide');
      const dots = carousel.querySelectorAll('.carousel-dot');
      const prevBtn = carousel.querySelector('[data-carousel-prev]');
      const nextBtn = carousel.querySelector('[data-carousel-next]');
      if (!track || !slides.length) return;

      let current = 0;
      let timer;

      function goTo(idx) {
        current = (idx + slides.length) % slides.length;
        track.style.transform = `translateX(-${current * 100}%)`;
        dots.forEach((d, i) => d.classList.toggle('active', i === current));
      }

      function next() { goTo(current + 1); }
      function prev() { goTo(current - 1); }

      function startAuto() {
        timer = setInterval(next, 4500);
      }
      function resetAuto() {
        clearInterval(timer);
        startAuto();
      }

      if (prevBtn) prevBtn.addEventListener('click', () => { prev(); resetAuto(); });
      if (nextBtn) nextBtn.addEventListener('click', () => { next(); resetAuto(); });
      dots.forEach((dot, i) => {
        dot.addEventListener('click', () => { goTo(i); resetAuto(); });
      });

      goTo(0);
      startAuto();
    });
  }

  /* ─────────────────────────────────────────
     9. Progress Bars (Intersection Observer)
  ───────────────────────────────────────── */
  function initProgressBars() {
    const bars = document.querySelectorAll('.progress-fill[data-width]');
    if (!bars.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.width = entry.target.dataset.width + '%';
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    bars.forEach(bar => observer.observe(bar));
  }

  /* ─────────────────────────────────────────
     10. Timeline Reveal
  ───────────────────────────────────────── */
  function initTimeline() {
    const items = document.querySelectorAll('.timeline-item');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    items.forEach(item => observer.observe(item));
  }

  /* ─────────────────────────────────────────
     11. Animated Underline on Scroll
  ───────────────────────────────────────── */
  function initAnimatedUnderlines() {
    const els = document.querySelectorAll('.animated-underline');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    els.forEach(el => observer.observe(el));
  }

  /* ─────────────────────────────────────────
     12. Case Study Filter Tabs
  ───────────────────────────────────────── */
  function initFilterTabs() {
    const tabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.case-card[data-category]');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const filter = tab.dataset.filter;

        cards.forEach(card => {
          const show = filter === 'all' || card.dataset.category === filter;
          card.style.display = show ? '' : 'none';
          // re-trigger animation
          if (show) {
            card.classList.remove('visible');
            requestAnimationFrame(() => card.classList.add('visible'));
          }
        });
      });
    });
  }

  /* ─────────────────────────────────────────
     13. Contact Form Validation
  ───────────────────────────────────────── */
  function initContactForm() {
    const form = document.querySelector('#contact-form');
    if (!form) return;

    const fields = form.querySelectorAll('.form-input[required], .form-input[data-validate]');

    function validateEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(field, msg) {
      field.classList.add('error');
      field.classList.remove('success');
      const errEl = field.parentElement.querySelector('.form-error');
      if (errEl) { errEl.textContent = msg; errEl.classList.add('show'); }
    }

    function showSuccess(field) {
      field.classList.remove('error');
      field.classList.add('success');
      const errEl = field.parentElement.querySelector('.form-error');
      if (errEl) errEl.classList.remove('show');
    }

    function validateField(field) {
      const value = field.value.trim();
      const name = field.name || field.id;

      if (field.hasAttribute('required') && !value) {
        showError(field, 'This field is required.');
        return false;
      }
      if (field.type === 'email' && value && !validateEmail(value)) {
        showError(field, 'Please enter a valid email address.');
        return false;
      }
      showSuccess(field);
      return true;
    }

    // Live validation on blur
    fields.forEach(field => {
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) validateField(field);
      });
    });

    // Submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;
      fields.forEach(field => {
        if (!validateField(field)) valid = false;
      });

      if (valid) {
        const btn = form.querySelector('[type="submit"]');
        btn.textContent = 'Sending…';
        btn.disabled = true;

        setTimeout(() => {
          const success = document.querySelector('#form-success');
          if (success) {
            form.style.display = 'none';
            success.style.display = 'block';
          } else {
            btn.textContent = 'Message Sent ✓';
            btn.style.background = '#22c55e';
          }
        }, 1500);
      }
    });
  }

  /* ─────────────────────────────────────────
     14. Active Nav Link Highlighting
  ───────────────────────────────────────── */
  function initActiveNav() {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === current || (current === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  /* ─────────────────────────────────────────
     15. Stagger children within a parent
  ───────────────────────────────────────── */
  function initStaggerChildren() {
    document.querySelectorAll('[data-stagger]').forEach(parent => {
      const delay = parseInt(parent.dataset.stagger) || 100;
      parent.querySelectorAll(':scope > .reveal, :scope > .card, :scope > .case-card').forEach((child, i) => {
        child.style.transitionDelay = `${i * delay}ms`;
      });
    });
  }

  /* ─────────────────────────────────────────
     16. Hero Rectangle Mouse Parallax
  ───────────────────────────────────────── */
  function initRectAnimations() {
    const rects = document.querySelectorAll('.hero-rect');
    if (!rects.length) return;

    // Parallax depths for each of the 12 .hero-rect elements (index-matched).
    // Extra rects beyond array length fall back to 0.03; fewer rects leave
    // extra values unused — both cases are harmless.
    const depths = [0.04, 0.06, 0.02, 0.05, 0.03, 0.06, 0.02, 0.04, 0.06, 0.03, 0.015, 0.025];

    function onMouseMove(e) {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;

      rects.forEach((rect, i) => {
        const d = depths[i] || 0.03;
        rect.style.transform = `translate(${dx * d}px, ${dy * d}px)`;
      });
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true });
  }

  /* ─────────────────────────────────────────
     Init All
  ───────────────────────────────────────── */
  function init() {
    initNav();
    initMobileMenu();
    initScrollReveal();
    initSmoothScroll();
    initTypewriter();
    initParallax();
    initCounters();
    initCarousels();
    initProgressBars();
    initTimeline();
    initAnimatedUnderlines();
    initFilterTabs();
    initContactForm();
    initActiveNav();
    initStaggerChildren();
    initRectAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
