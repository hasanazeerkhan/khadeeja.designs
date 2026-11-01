/** Khadeeja Designs shared site shell. */
function initPage(activePage) {
  const NAV_PAGES = [
    { id: 'home',    label: 'Home',            href: '/'               },
    { id: 'explore', label: 'Browse Designs', href: '/explore/'       },
    { id: 'blog',    label: 'Blog',            href: '/blog/'          },
    { id: 'faq',     label: 'FAQ',             href: '/faq/'          },
  ];

  /* Render the complete header from one source on every page. */
  const header = document.querySelector('nav');
  if (header) {
    header.className = 'site-header';
    header.setAttribute('aria-label', 'Primary navigation');
    header.innerHTML = `
      <a class="brand" href="/" aria-label="Khadeeja Designs home">Khadeeja Designs</a>
      <div class="nav-center">
        ${NAV_PAGES.map(p => `<a class="nav-link${p.id === activePage ? ' active' : ''}" href="${p.href}"${p.id === activePage ? ' aria-current="page"' : ''}>${p.label}</a>`).join('')}
        <a class="nav-cta button button--gold" data-button="gold" href="/contact/">Send Enquiry</a>
      </div>
      <button class="hamburger" type="button" aria-label="Open navigation menu" aria-expanded="false"><span></span><span></span><span></span></button>`;
    header.querySelector('.hamburger').addEventListener('click', _toggleMobileMenu);
  }

  /* ── Inject footer ── */
  const footer = document.querySelector('footer');
  if (footer) {
    footer.innerHTML = `
      <div class="footer-inner">
        <div>
          <a class="footer-brand" href="/">Khadeeja Designs</a>
          <p class="footer-tagline">Boutique Aari embroidery,<br>handcrafted in Trichy.</p>
        </div>
        <div class="footer-cols">
          <div class="footer-col">
            <span class="footer-col-label">Explore</span>
            <a href="/explore/">Portfolio</a>
            <a href="/blog/">Blog</a>
            <a href="/faq/">FAQ</a>
          </div>
          <div class="footer-col">
            <span class="footer-col-label">Contact</span>
            <a href="/contact/">Send Enquiry</a>
            <a href="https://instagram.com/khadeeja.designs" target="_blank" rel="noopener">Instagram</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">© Khadeeja Designs. All rights reserved.</span>
        <div class="footer-legal">
          <a href="/privacy/">Privacy Policy</a>
          <a href="/faq/">FAQ</a>
        </div>
      </div>`;
  }

  /* ── Wire hamburger ── */
  /* Normalise legacy page-specific CTAs into the shared button system. */
  document.querySelectorAll('.btn-gold, .cta, [data-button="gold"]').forEach(el => el.classList.add('button', 'button--gold'));
  document.querySelectorAll('.btn-ghost, [data-button="ghost"]').forEach(el => el.classList.add('button', 'button--ghost'));
  document.querySelectorAll('.faq, .seo-faq, .contact-faq').forEach(section => {
    if (section.querySelector('details')) section.classList.add('shared-question-section');
  });
}

// Keep dynamically generated portfolio images accessible and stable for search
// and assistive technology when product data is loaded client-side.
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img').forEach((img, index) => {
    if (!img.alt || /^View \d+$/.test(img.alt)) img.alt = `Khadeeja Designs Aari embroidery detail ${index + 1}`;
    if (!img.hasAttribute('width')) img.setAttribute('width', '600');
    if (!img.hasAttribute('height')) img.setAttribute('height', '600');
    if (!img.loading) img.loading = index === 0 ? 'eager' : 'lazy';
  });
});

function _toggleMobileMenu() {
  const existing = document.getElementById('mob-menu');
  const hamburger = document.querySelector('.hamburger');
  if (existing) { _closeMobileMenu(true); return; }

  const pages = [
    { label: 'Home',           href: '/'               },
    { label: 'Browse Designs', href: '/explore/'       },
    { label: 'Blog',           href: '/blog/'          },
    { label: 'FAQ',            href: '/faq/'           },
  ];

  const navH = document.querySelector('nav').offsetHeight;
  const m = document.createElement('div');
  m.id = 'mob-menu';
  m.setAttribute('role', 'dialog');
  m.setAttribute('aria-modal', 'true');
  m.setAttribute('aria-label', 'Mobile navigation');
  m.setAttribute('tabindex', '-1');
  m.className = 'mobile-menu';
  m.style.top = `${navH}px`;

  pages.forEach(({ label, href }) => {
    const a = document.createElement('a');
    a.textContent = label; a.href = href;
    m.appendChild(a);
  });

  const cta = document.createElement('a');
  cta.textContent = 'Send Enquiry';
  cta.href = '/contact/';
  cta.className = 'button button--gold';
  m.appendChild(cta);
  document.body.appendChild(m);
  document.body.style.overflow = 'hidden';
  hamburger?.setAttribute('aria-expanded', 'true');
  hamburger?.setAttribute('aria-label', 'Close navigation menu');

  const focusable = () => [...m.querySelectorAll('a, button, [tabindex]:not([tabindex="-1"])')];
  const onKeydown = e => {
    if (e.key === 'Escape') { e.preventDefault(); _closeMobileMenu(true); return; }
    if (e.key !== 'Tab') return;
    const items = focusable();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  const onOutsideClick = e => {
    if (!m.contains(e.target) && !hamburger?.contains(e.target)) _closeMobileMenu(false);
  };
  m.addEventListener('keydown', onKeydown);
  document.addEventListener('click', onOutsideClick);
  m._cleanup = () => {
    m.removeEventListener('keydown', onKeydown);
    document.removeEventListener('click', onOutsideClick);
  };

  m.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    _closeMobileMenu(false);
  }));
  setTimeout(() => m.querySelector('a')?.focus(), 0);
}

function _closeMobileMenu(returnFocus) {
  const menu = document.getElementById('mob-menu');
  const hamburger = document.querySelector('.hamburger');
  if (!menu) return;
  menu._cleanup?.();
  menu.remove();
  document.body.style.overflow = '';
  hamburger?.setAttribute('aria-expanded', 'false');
  hamburger?.setAttribute('aria-label', 'Open navigation menu');
  if (returnFocus) hamburger?.focus();
}
