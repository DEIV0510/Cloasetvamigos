/* ============================================================
   CLÓSET LOS AMIGOS · script.js
   Interacciones vanilla JS · sin dependencias
   ============================================================ */
(function () {
  'use strict';

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const WA = 'https://wa.me/573137409650';

  /* ============================================================
     1. PRELOADER + PARTÍCULAS DORADAS
     ============================================================ */
  function initPreloader() {
    const pre = $('#preloader');
    if (!pre) return;
    const fill = $('.preloader__fill');
    const pct = $('.preloader__pct');
    const canvas = $('#preloader-canvas');

    // --- Partículas ---
    let raf, particles = [], running = true;
    if (canvas && !reduceMotion) {
      const ctx = canvas.getContext('2d');
      let w, h;
      const resize = () => { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; };
      resize();
      const COUNT = Math.min(60, Math.floor(window.innerWidth / 22));
      for (let i = 0; i < COUNT; i++) {
        particles.push({
          x: Math.random() * w, y: Math.random() * h,
          r: Math.random() * 2 + 0.6,
          vy: -(Math.random() * 0.6 + 0.2),
          vx: (Math.random() - 0.5) * 0.3,
          a: Math.random() * 0.6 + 0.2,
          tw: Math.random() * 0.02 + 0.005
        });
      }
      const draw = () => {
        if (!running) return;
        ctx.clearRect(0, 0, w, h);
        for (const p of particles) {
          p.y += p.vy; p.x += p.vx; p.a += p.tw;
          if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
          const op = 0.35 + Math.sin(p.a) * 0.3;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(212,175,55,' + Math.max(0, op) + ')';
          ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(212,175,55,0.6)';
          ctx.fill();
        }
        raf = requestAnimationFrame(draw);
      };
      draw();
      window.addEventListener('resize', resize);
    }

    // --- Progreso ---
    let progress = 0;
    const total = reduceMotion ? 500 : 2200;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / total, 1);
      // easing easeOutCubic
      progress = Math.round((1 - Math.pow(1 - t, 3)) * 100);
      if (fill) fill.style.width = progress + '%';
      if (pct) pct.textContent = progress + '%';
      if (t < 1) requestAnimationFrame(tick);
      else finish();
    }
    requestAnimationFrame(tick);

    let done = false;
    function finish() {
      if (done) return; done = true;
      setTimeout(() => {
        pre.classList.add('is-hidden');
        document.body.classList.remove('no-scroll');
        running = false;
        if (raf) cancelAnimationFrame(raf);
      }, reduceMotion ? 100 : 300);
    }
    document.body.classList.add('no-scroll');
    // failsafe
    setTimeout(finish, 4000);
  }

  /* Cursor personalizado eliminado: se usa el cursor nativo del sistema. */

  /* ============================================================
     3. HEADER + SCROLL PROGRESS + SCROLLSPY
     ============================================================ */
  function initScrollUI() {
    const header = $('#header');
    const bar = $('.scroll-progress');
    const links = $$('.nav__link');
    const sections = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
    let ticking = false;

    function update() {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 40);
      if (bar) {
        const docH = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (docH > 0 ? (y / docH) * 100 : 0) + '%';
      }
      // scrollspy
      let current = '';
      const mid = y + window.innerHeight * 0.32;
      for (const sec of sections) { if (sec.offsetTop <= mid) current = sec.id; }
      links.forEach(l => l.classList.toggle('is-current', l.getAttribute('href') === '#' + current));
      ticking = false;
    }
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ============================================================
     4. MENÚ MÓVIL
     ============================================================ */
  function initMenu() {
    const toggle = $('#navToggle'), nav = $('#nav');
    if (!toggle || !nav) return;
    const backdrop = document.createElement('div');
    backdrop.className = 'nav-backdrop';
    document.body.appendChild(backdrop);

    const setOpen = (open) => {
      nav.classList.toggle('is-open', open);
      backdrop.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('menu-open', open);
    };
    toggle.addEventListener('click', () => setOpen(!nav.classList.contains('is-open')));
    backdrop.addEventListener('click', () => setOpen(false));
    $$('.nav__link, .nav__cta', nav).forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  /* ============================================================
     5. REVEAL ON SCROLL
     ============================================================ */
  function initReveal() {
    const items = $$('[data-reveal]');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(i => i.classList.add('is-visible')); return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach(i => io.observe(i));
  }

  /* ============================================================
     6. CONTADORES ANIMADOS
     ============================================================ */
  function initCounters() {
    const nums = $$('.stat__num');
    if (!nums.length) return;
    const run = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      if (reduceMotion) { el.textContent = target + suffix; return; }
      const dur = 1800, start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / dur, 1);
        const val = Math.round((1 - Math.pow(1 - t, 3)) * target);
        el.textContent = val + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.5 });
    nums.forEach(n => io.observe(n));
  }

  /* ============================================================
     7. GALERÍA (render + filtros + lightbox)
     ============================================================ */
  const PROJECTS = [
    { src: 'closet1', cat: 'closets', title: 'Clóset en madera nogal', alt: 'Clóset a medida en madera nogal con acabado natural y herrajes metálicos' },
    { src: 'cocina3', cat: 'cocinas', title: 'Cocina moderna grafito', alt: 'Cocina integral moderna en L color grafito con electrodomésticos empotrados' },
    { src: 'bano1', cat: 'banos', title: 'Mueble de baño en madera', alt: 'Mueble de baño flotante en madera con lavamanos vessel blanco' },
    { src: 'closet2', cat: 'closets', title: 'Clóset gris a medida', alt: 'Clóset gris de seis puertas con cajonera central fabricado a medida' },
    { src: 'cocina2', cat: 'cocinas', title: 'Cocina integral en L', alt: 'Cocina integral en L con mesón oscuro y muebles en madera clara' },
    { src: 'puertas1', cat: 'puertas', title: 'Puerta corrediza', alt: 'Puerta corrediza blanca de panel fabricada a medida' },
    { src: 'closet3', cat: 'closets', title: 'Organizador juvenil', alt: 'Mueble organizador juvenil en fucsia y blanco con repisas abiertas' },
    { src: 'cocina1', cat: 'cocinas', title: 'Cocina integral lineal', alt: 'Cocina integral lineal en madera clara con estufa y lavaplatos' },
    { src: 'bano3', cat: 'banos', title: 'Mueble de baño grafito', alt: 'Mueble de baño flotante en tono grafito con lavamanos integrado' },
    { src: 'puertas3', cat: 'puertas', title: 'Puerta en madera', alt: 'Puerta enchapada en madera con marco a medida' },
    { src: 'bano2', cat: 'banos', title: 'Mueble de baño clásico', alt: 'Mueble de baño clásico blanco bajo lavamanos' },
    { src: 'puertas2', cat: 'puertas', title: 'Puerta clásica', alt: 'Puerta clásica blanca con relieve ovalado' }
  ];
  const CAT_LABEL = { closets: 'Clóset', cocinas: 'Cocina', banos: 'Baño', puertas: 'Puerta' };

  function initGallery() {
    const grid = $('#galleryGrid');
    if (!grid) return;

    grid.innerHTML = PROJECTS.map((p, i) => `
      <button class="gallery__item" data-cat="${p.cat}" data-index="${i}" type="button" aria-label="Ampliar proyecto: ${p.title}">
        <picture>
          <source type="image/webp" srcset="assets/img/${p.src}-sm.webp 820w, assets/img/${p.src}.webp 1500w" sizes="(max-width:600px) 100vw, (max-width:900px) 50vw, 33vw">
          <img src="assets/img/${p.src}.jpg" alt="${p.alt}" loading="lazy" decoding="async">
        </picture>
        <span class="gallery__zoom"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3M11 8v6M8 11h6"/></svg></span>
        <span class="gallery__overlay">
          <span class="gallery__cat">${CAT_LABEL[p.cat]}</span>
          <span class="gallery__title">${p.title}</span>
        </span>
      </button>`).join('');

    const items = $$('.gallery__item', grid);

    // Filtros
    $$('.filter').forEach(btn => {
      btn.addEventListener('click', () => {
        $$('.filter').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const f = btn.dataset.filter;
        items.forEach(it => {
          const show = f === 'all' || it.dataset.cat === f;
          if (show) {
            it.classList.remove('is-hidden');
            requestAnimationFrame(() => it.classList.remove('is-hiding'));
          } else {
            it.classList.add('is-hiding');
            setTimeout(() => it.classList.add('is-hidden'), 350);
          }
        });
      });
    });

    // Lightbox
    initLightbox(items);
  }

  function initLightbox(items) {
    const lb = $('#lightbox'), img = $('#lbImg'), cap = $('#lbCaption');
    if (!lb) return;
    let visible = []; // índices visibles actuales
    let pos = 0;

    const open = (index) => {
      visible = items.filter(it => !it.classList.contains('is-hidden')).map(it => +it.dataset.index);
      pos = visible.indexOf(index);
      if (pos < 0) pos = 0;
      show();
      lb.classList.add('is-open');
      lb.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    };
    const show = () => {
      const p = PROJECTS[visible[pos]];
      img.src = `assets/img/${p.src}.jpg`;
      img.alt = p.alt;
      cap.textContent = `${CAT_LABEL[p.cat]} · ${p.title}`;
    };
    const close = () => { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); document.body.classList.remove('no-scroll'); };
    const next = () => { pos = (pos + 1) % visible.length; show(); };
    const prev = () => { pos = (pos - 1 + visible.length) % visible.length; show(); };

    items.forEach(it => it.addEventListener('click', () => open(+it.dataset.index)));
    $('#lbClose').addEventListener('click', close);
    $('#lbNext').addEventListener('click', next);
    $('#lbPrev').addEventListener('click', prev);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    });
    // Swipe móvil
    let sx = 0;
    lb.addEventListener('touchstart', (e) => sx = e.touches[0].clientX, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50) (dx < 0 ? next() : prev());
    }, { passive: true });
  }

  /* ============================================================
     8. FAQ ACORDEÓN (animado)
     ============================================================ */
  function initFAQ() {
    const items = $$('.faq__item');
    const closeItem = (item) => {
      const a = $('.faq__answer', item);
      a.style.maxHeight = a.scrollHeight + 'px';
      requestAnimationFrame(() => { a.style.maxHeight = '0px'; });
      a.addEventListener('transitionend', function te() { item.removeAttribute('open'); a.removeEventListener('transitionend', te); }, { once: true });
    };
    const openItem = (item) => {
      item.setAttribute('open', '');
      const a = $('.faq__answer', item);
      a.style.maxHeight = a.scrollHeight + 'px';
    };
    items.forEach(item => {
      const summary = $('summary', item);
      summary.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = item.hasAttribute('open');
        items.forEach(o => { if (o !== item && o.hasAttribute('open')) closeItem(o); });
        isOpen ? closeItem(item) : openItem(item);
      });
    });
    // Recalcular altura del abierto al redimensionar
    window.addEventListener('resize', () => {
      items.forEach(item => { if (item.hasAttribute('open')) { const a = $('.faq__answer', item); a.style.maxHeight = a.scrollHeight + 'px'; } });
    });
  }

  /* ============================================================
     9. PARALLAX SUAVE
     ============================================================ */
  function initParallax() {
    if (reduceMotion || !finePointer) return;
    const els = $$('[data-parallax]');
    const band = $('[data-parallax-bg]');
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      els.forEach(el => {
        const r = el.getBoundingClientRect();
        const center = r.top + r.height / 2;
        const off = (center - vh / 2) * (parseFloat(el.dataset.parallax) || 0.05);
        el.style.transform = `translateY(${-off}px)`;
      });
      if (band) {
        const r = band.parentElement.getBoundingClientRect();
        if (r.bottom > 0 && r.top < vh) {
          const off = (r.top - vh / 2) * 0.12;
          band.style.transform = `translateY(${off}px)`;
        }
      }
      ticking = false;
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ============================================================
     10. FORMULARIO -> WHATSAPP
     ============================================================ */
  function initForm() {
    const form = $('#contactForm');
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = $('#nombre'), telefono = $('#telefono');
      let ok = true;
      [nombre, telefono].forEach(f => {
        if (!f.value.trim()) { f.classList.add('is-error'); ok = false; }
        else f.classList.remove('is-error');
      });
      if (!ok) { (nombre.value.trim() ? telefono : nombre).focus(); return; }

      const tipo = $('#tipo').value;
      const mensaje = $('#mensaje').value.trim();
      let text = `Hola, soy ${nombre.value.trim()}. Estoy interesado(a) en: ${tipo}.`;
      if (mensaje) text += ` ${mensaje}`;
      text += ` Mi WhatsApp es ${telefono.value.trim()}. Quisiera agendar una visita sin compromiso.`;
      window.open(`${WA}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    });
    // limpia error al escribir
    $$('#nombre, #telefono').forEach(f => f.addEventListener('input', () => f.classList.remove('is-error')));
  }

  /* ============================================================
     11. MISCELÁNEA
     ============================================================ */
  function initMisc() {
    const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
  }

  /* ============================================================
     INIT
     ============================================================ */
  document.addEventListener('DOMContentLoaded', () => {
    initPreloader();
    initScrollUI();
    initMenu();
    initReveal();
    initCounters();
    initGallery();
    initFAQ();
    initParallax();
    initForm();
    initMisc();
  });
})();
