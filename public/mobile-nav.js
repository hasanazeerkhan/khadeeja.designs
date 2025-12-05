/* Mobile Navigation Toggle
 - Toggles `nav-open` class on <body> to display a full-width mobile menu.
 - Keeps aria-expanded in sync and prevents body scroll when open.
*/

document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('mobile-nav-toggle');
  const nav = document.getElementById('main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function (e) {
    const open = document.body.classList.toggle('nav-open');
    toggle.setAttribute('aria-expanded', String(open));

    // Prevent page scroll when nav open
    if (open) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  });

  // Close nav when clicking outside or selecting a link
  document.addEventListener('click', function (ev) {
    if (!document.body.classList.contains('nav-open')) return;
    const target = ev.target;
    if (!nav.contains(target) && target !== toggle && !toggle.contains(target)) {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
    }
  }, { passive: true });

  // Close on Escape
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape' && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
});
