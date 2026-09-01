// =========================================
// CleanBooks Consulting — main.js
// Vanilla ES6+ — no jQuery
// =========================================

document.addEventListener('DOMContentLoaded', () => {

  // --- Dynamic copyright year ---
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // --- Active nav link highlighting ---
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  function updateActiveNav() {
    document.querySelectorAll('.nav-link').forEach(link => {
      const [linkPath, linkHash] = link.getAttribute('href').split('#');
      const pathMatches = linkPath === currentPath || (currentPath === 'index.html' && linkPath === '');
      // A plain page link (no #hash, e.g. "Home") is only active when the URL also
      // has no hash — otherwise a "#solutions" link on the same page would light up
      // "Home" too, since both share the same path.
      const hashMatches = linkHash ? window.location.hash === `#${linkHash}` : !window.location.hash;
      link.classList.toggle('active', pathMatches && hashMatches);
    });
  }
  updateActiveNav();

  // --- Reliable anchor scrolling ---
  // The browser's native scroll-to-fragment isn't trustworthy here (it can lose
  // the race with layout/animation and leave the page sitting at the top instead
  // of the intended section). Handle it ourselves so section nav links actually
  // land where they say they will.
  const NAV_OFFSET = 88; // sticky navbar height

  function scrollToHash(hash, behavior) {
    const target = hash && document.querySelector(hash);
    if (!target) return false;
    const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
    window.scrollTo({ top: Math.max(top, 0), behavior });
    return true;
  }

  // Same-page anchor links: smooth-scroll instead of the browser's instant jump.
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    const [path, hash] = link.getAttribute('href').split('#');
    if (!hash) return;
    const isSamePage = path === '' || path === currentPath;
    if (!isSamePage) return; // cross-page links navigate normally, handled below on load
    link.addEventListener('click', (e) => {
      if (scrollToHash(`#${hash}`, 'smooth')) {
        e.preventDefault();
        history.pushState(null, '', `#${hash}`);
        updateActiveNav();
      }
    });
  });

  // Back/forward through pushState hash changes: keep the nav in sync too.
  window.addEventListener('popstate', () => {
    updateActiveNav();
    if (window.location.hash) {
      scrollToHash(window.location.hash, 'smooth');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  });

  // Arriving at a page with a hash already in the URL (a cross-page nav link, or
  // a bookmarked/shared link): correct the position once the page has settled,
  // then tell AOS to reveal what's now on screen — a jump straight to a section
  // skips the scroll events its reveal animation normally runs on, so without
  // this the target section stays stuck at its pre-animation opacity.
  // This is a deliberate navigation, not a scroll discovery, so the reveal
  // happens instantly (transitions muted for one frame) rather than replaying
  // the fade — the content should just be there, not visibly catch up.
  if (window.location.hash) {
    window.addEventListener('load', () => {
      requestAnimationFrame(() => {
        document.documentElement.classList.add('aos-jump');
        scrollToHash(window.location.hash, 'auto');
        // Reveal everything up to and including what's now on screen directly —
        // the user skipped past it via the jump, so it should already be there.
        // AOS's own scroll-position math is built around scrolling forward into
        // view and doesn't reliably back-fill content that's now behind/at the
        // landing point, so set the state ourselves instead of trusting refresh().
        const visibleBottom = window.scrollY + window.innerHeight;
        document.querySelectorAll('[data-aos]').forEach((el) => {
          if (el.getBoundingClientRect().top + window.scrollY <= visibleBottom) {
            el.classList.add('aos-animate');
          }
        });
        requestAnimationFrame(() => {
          requestAnimationFrame(() => document.documentElement.classList.remove('aos-jump'));
        });
      });
    });
  }

  // --- Back to Top button ---
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.style.display = window.scrollY > 100 ? 'flex' : 'none';
    });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // --- AOS (Animate On Scroll) init ---
  // Respect prefers-reduced-motion: keep the fade (aids comprehension) but drop it
  // to a near-instant cross-fade instead of a travel-distance slide.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true,
      offset: 60,
      disable: reduceMotion,
    });
  }

  // --- Homepage dashboard demo switcher ---
  const demoTabs = document.querySelectorAll('[data-demo-tab]');
  const demoPanels = document.querySelectorAll('[data-demo-panel]');
  demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const selected = tab.dataset.demoTab;
      demoTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      demoPanels.forEach(panel => {
        const active = panel.dataset.demoPanel === selected;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    });
  });

  // --- "What We Offer" tab switcher (Solutions / Dashboards / Process) ---
  const offerTabs = document.querySelectorAll('[data-offer-tab]');
  const offerPanels = document.querySelectorAll('[data-offer-panel]');
  offerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const selected = tab.dataset.offerTab;
      offerTabs.forEach(item => {
        const active = item === tab;
        item.classList.toggle('active', active);
        item.setAttribute('aria-selected', String(active));
      });
      offerPanels.forEach(panel => {
        const active = panel.dataset.offerPanel === selected;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
    });
  });

  // --- Enable Submit button only when required fields are filled ---
  const submitBtn = document.getElementById('submit-btn');
  if (submitBtn) {
    const requiredFields = document.querySelectorAll('#contact-form [required]');
    const checkFields = () => {
      const allFilled = [...requiredFields].every(f => f.value.trim() !== '');
      submitBtn.disabled = !allFilled;
    };
    requiredFields.forEach(f => f.addEventListener('input', checkFields));
  }

  // --- Contact form: Web3Forms submission feedback ---
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.textContent;

      btn.disabled = true;
      btn.textContent = 'Sending...';

      const formData = new FormData(contactForm);

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();

        if (data.success) {
          showAlert(contactForm, 'success', 'Thank you! Your message has been sent. We\'ll be in touch soon.');
          contactForm.reset();
        } else {
          showAlert(contactForm, 'danger', 'Something went wrong. Please try emailing us directly at manjunathms@cleanbooksconsulting.net');
        }
      } catch {
        showAlert(contactForm, 'danger', 'Could not send message. Please email us at manjunathms@cleanbooksconsulting.net');
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  }

  function showAlert(form, type, message) {
    const existing = form.querySelector('.form-alert');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} mt-3 form-alert`;
    alert.textContent = message;
    form.appendChild(alert);

    setTimeout(() => alert.remove(), 6000);
  }

});
