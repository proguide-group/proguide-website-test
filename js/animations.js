/**
 * ProGuide – Animations & UI Interactions
 * Complete drop-in file.
 * Includes hero scan animation support and safe observers.
 */

/* -------------------- HERO ANIMATIONS -------------------- */
function initHeroAnimations() {
  // Create the 20x20 dot grid inside the scan box
  const dotGrid = document.querySelector('.scan-animation .dot-grid');
  if (dotGrid && !dotGrid.__filled) {
    dotGrid.__filled = true;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 400; i++) {
      const dot = document.createElement('span');
      dot.style.animationDelay = `${Math.random() * 2}s`;
      dot.style.opacity = (Math.random() * 0.3 + 0.1).toFixed(2);
      frag.appendChild(dot);
    }
    dotGrid.appendChild(frag);
  }

  // Reveal subtitle lines sequentially
  const subtitleLines = document.querySelectorAll('.subtitle-line');
  subtitleLines.forEach((line, idx) => {
    setTimeout(() => {
      line.style.transform = 'translateY(0)';
      line.style.opacity = '1';
    }, idx * 200 + 500);
  });

  // Optional hover flip (kept from your version)
  const scanContainer = document.querySelector('.scan-animation');
  if (scanContainer) {
    let isHovering = false;
    const real = document.querySelector('.part-real');
    const digital = document.querySelector('.part-digital');

    scanContainer.addEventListener('mouseenter', () => {
      isHovering = true;
      if (real) real.style.transform = 'rotateY(-90deg)';
      if (digital) digital.style.transform = 'rotateY(0deg)';
    });
    scanContainer.addEventListener('mouseleave', () => {
      isHovering = false;
      if (real) real.style.transform = 'rotateY(0deg)';
      if (digital) digital.style.transform = 'rotateY(90deg)';
    });

    // Occasionally auto-poke the effect
    setInterval(() => {
      if (!isHovering && Math.random() > 0.7) {
        scanContainer.classList.add('trigger-scan');
        setTimeout(() => scanContainer.classList.remove('trigger-scan'), 1200);
      }
    }, 5000);
  }
}

/* -------------------- PARTICLES (optional) -------------------- */
function initParticles() {
  if (!document.getElementById('particles-js')) return;
  particlesJS('particles-js', {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 1000 } },
      color: { value: '#a5b4fc' },
      shape: { type: 'circle', stroke: { width: 0, color: '#e0e7ff' } },
      opacity: { value: 0.3, random: true, anim: { enable: true, speed: 0.5, opacity_min: 0.05 } },
      size: { value: 2, random: true, anim: { enable: true, speed: 1, size_min: 0.1 } },
      line_linked: { enable: true, distance: 120, color: '#e0e7ff', opacity: 0.15, width: 1 },
      move: { enable: true, speed: 0.8, direction: 'none', random: true, straight: false, out_mode: 'out', bounce: false }
    },
    interactivity: {
      detect_on: 'canvas',
      events: { onhover: { enable: true, mode: 'grab' }, onclick: { enable: true, mode: 'push' }, resize: true },
      modes: { grab: { distance: 100, line_linked: { opacity: 0.3 } }, push: { particles_nb: 2 }, remove: { particles_nb: 2 } }
    },
    retina_detect: true
  });
}

/* -------------------- SCROLL ANIMS -------------------- */
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('animate');
      if (entry.target.classList.contains('fade-up')) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        entry.target.style.transition = 'all 0.6s ease-out';
      }
      if (entry.target.classList.contains('scale-in')) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'scale(1)';
        entry.target.style.transition = 'all 0.5s ease-out';
      }
      if (entry.target.classList.contains('slide-in-left') || entry.target.classList.contains('slide-in-right')) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateX(0)';
        entry.target.style.transition = 'all 0.6s ease-out';
      }
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-up, .scale-in, .slide-in-left, .slide-in-right, .reveal, .animate')
    .forEach(el => observer.observe(el));
}

/* -------------------- COUNTERS -------------------- */
async function animateCounters() {
  const counters = document.querySelectorAll('[data-metric]');
  if (!counters.length) return;

  let metricsData = {};
  try {
    const res = await fetch('/data/site-metrics.json');
    if (res.ok) metricsData = await res.json();
  } catch (_) { /* ignore */ }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const key = entry.target.getAttribute('data-metric');
      if (key === 'company_experience_badge') {
        const badgeValue = (metricsData.stats && metricsData.stats[key]) || metricsData[key] || entry.target.textContent;
        entry.target.textContent = badgeValue;
        obs.unobserve(entry.target);
        return;
      }

      const targetValue = (metricsData.stats && metricsData.stats[key] !== undefined)
        ? +metricsData.stats[key]
        : (metricsData[key] !== undefined ? +metricsData[key] : +entry.target.getAttribute('data-count') || 0);

      const duration = 2500;
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min((t - start) / duration, 1);
        const ease = 1 - Math.pow(1 - p, 3);
        entry.target.textContent = Math.floor(ease * targetValue);
        if (p < 1) requestAnimationFrame(tick); else entry.target.textContent = targetValue;
      };
      requestAnimationFrame(tick);
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
}

/* -------------------- SMOOTH SCROLL -------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const headerOffset = 100;
      const offset = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offset, behavior: 'smooth' });

      // Close mobile nav if open
      const nav = document.querySelector('.nav-links');
      const toggle = document.querySelector('.mobile-menu-toggle');
      if (nav && nav.classList.contains('open')) {
        toggle?.classList.remove('open');
        nav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });
}

/* -------------------- MOBILE MENU -------------------- */
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-menu-toggle');
  const nav = document.querySelector('.nav-links');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.classList.contains('open');
    toggle.classList.toggle('open');
    nav.classList.toggle('open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
    if (!isOpen) nav.style.visibility = 'visible';
    else setTimeout(() => { if (!nav.classList.contains('open')) nav.style.visibility = 'hidden'; }, 300);
  });

  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target) && !nav.contains(e.target) && nav.classList.contains('open')) {
      toggle.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    }
  });
}

/* -------------------- BACK TO TOP -------------------- */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  let visible = false;
  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    if (show && !visible) { btn.classList.add('visible'); visible = true; }
    if (!show && visible) { btn.classList.remove('visible'); visible = false; }
  });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* -------------------- FORMS -------------------- */
function initFormValidation() {
  document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
      let ok = true;
      const inputs = form.querySelectorAll('[required]');
      inputs.forEach(input => {
        input.classList.remove('error');
        const v = input.value.trim();
        if (!v) { ok = false; input.classList.add('error'); }
        else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) { ok = false; input.classList.add('error'); }
      });
      if (!ok) {
        e.preventDefault();
        showFormMessage(form, 'error', 'Please fill all required fields correctly.');
      }
    });
  });
}
function showFormMessage(form, type, message) {
  const existing = form.querySelector('.form-message');
  if (existing) existing.remove();
  const el = document.createElement('div');
  el.className = `form-message form-message-${type}`;
  el.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i><span>${message}</span>`;
  form.appendChild(el);
  setTimeout(() => el.remove(), type === 'success' ? 4000 : 3000);
}

/* -------------------- CONSENT, MAP & TAWK -------------------- */
(function consent() {
  const BANNER = document.getElementById('cc-banner');
  const MODAL  = document.getElementById('cc-modal');
  if (!BANNER || !MODAL) return;

  const btnAccept = document.getElementById('cc-accept');
  const btnReject = document.getElementById('cc-reject');
  const btnManage = document.getElementById('cc-manage');
  const btnSave   = document.getElementById('cc-save');
  const btnAcceptModal = document.getElementById('cc-accept-modal');

  const chkFunctional = document.getElementById('cc-functional');
  const chkMarketing  = document.getElementById('cc-marketing');

  const storageKey = 'pg_consent_v1';

  function readConsent() {
    try { return JSON.parse(localStorage.getItem(storageKey)); } catch (_) { return null; }
  }
  function writeConsent(c) {
    localStorage.setItem(storageKey, JSON.stringify(c));
    // Apply choices
    if (c.marketing) window.loadTawk?.();
    const mapBtn = document.getElementById('enable-map');
    const gmap = document.getElementById('gmap');
    if (c.functional && gmap && gmap.dataset.src) {
      gmap.src = gmap.dataset.src;
      gmap.hidden = false;
      document.getElementById('map-placeholder')?.remove();
    } else if (mapBtn) {
      mapBtn.onclick = () => {
        const newC = Object.assign({}, c, { functional: true });
        writeConsent(newC);
      };
    }
  }

  const existing = readConsent();
  if (!existing) {
    BANNER.hidden = false;
    // simple EN defaults; your translation loader can update text
    document.querySelector('[data-translate="cookie_consent_text"]')?.innerText =
      'We use cookies to improve your experience. Manage your preferences or accept all.';
    document.querySelector('[data-translate="reject_all"]')?.innerText = 'Reject';
    document.querySelector('[data-translate="manage_prefs"]')?.innerText = 'Preferences';
    document.querySelector('[data-translate="cookie_accept_button"]')?.innerText = 'Accept All';
    BANNER.classList.add('show');
  } else {
    writeConsent(existing); // apply on load (map/chat)
  }

  // Banner actions
  btnAccept?.addEventListener('click', () => {
    const c = { functional: true, marketing: true, ts: Date.now() };
    writeConsent(c);
    BANNER.classList.remove('show');
    setTimeout(() => BANNER.hidden = true, 300);
  });
  btnReject?.addEventListener('click', () => {
    const c = { functional: false, marketing: false, ts: Date.now() };
    writeConsent(c);
    BANNER.classList.remove('show');
    setTimeout(() => BANNER.hidden = true, 300);
  });
  btnManage?.addEventListener('click', () => { MODAL.hidden = false; chkFunctional.checked = !!(existing && existing.functional); chkMarketing.checked = !!(existing && existing.marketing); });

  // Modal actions
  btnSave?.addEventListener('click', () => {
    const c = { functional: chkFunctional.checked, marketing: chkMarketing.checked, ts: Date.now() };
    writeConsent(c); MODAL.hidden = true; BANNER.classList.remove('show'); setTimeout(() => BANNER.hidden = true, 300);
  });
  btnAcceptModal?.addEventListener('click', () => {
    const c = { functional: true, marketing: true, ts: Date.now() };
    writeConsent(c); MODAL.hidden = true; BANNER.classList.remove('show'); setTimeout(() => BANNER.hidden = true, 300);
  });

  // close modal on ESC / bg click
  MODAL.addEventListener('click', (e) => { if (e.target === MODAL) MODAL.hidden = true; });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !MODAL.hidden) MODAL.hidden = true; });
})();

/* -------------------- INIT -------------------- */
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(initParticles, 100);
  setTimeout(initHeroAnimations, 200);
  setTimeout(initScrollAnimations, 300);
  setTimeout(animateCounters, 400);

  initSmoothScroll();
  initMobileMenu();
  initBackToTop();
  initFormValidation();
});

/* Re-init particles on resize (debounced) */
window.addEventListener('resize', (function debounce(fn, wait=250){
  let t; return function(){ clearTimeout(t); t=setTimeout(fn, wait); };
})(() => {
  if (window.pJSDom && window.pJSDom.length > 0) {
    try { window.pJSDom[0].pJS.fn.vendors.destroypJS(); } catch(_) {}
    setTimeout(initParticles, 100);
  }
}));
