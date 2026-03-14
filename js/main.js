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
  document.querySelectorAll('.nav-link').forEach(link => {
    const linkPath = link.getAttribute('href');
    if (linkPath === currentPath || (currentPath === '' && linkPath === 'index.html')) {
      link.classList.add('active');
    }
  });

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
  if (typeof AOS !== 'undefined') {
    AOS.init({ duration: 700, once: true, offset: 60 });
  }

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
