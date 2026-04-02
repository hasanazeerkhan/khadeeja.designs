/**
 * shared-nav.js
 * Handles nav, footer, and mobile menu for ALL pages.
 * Uses ABSOLUTE PATHS so navigation works from any page depth.
 *
 * Usage on ALL pages:
 *   <script src="../shared-nav.js"></script>  (adjust ../ based on depth)
 *   <script>initPage('home');</script>        (or 'explore', 'blog', 'faq', 'contact')
 *
 * @param {string} activePage - nav item to highlight ('home', 'explore', 'blog', 'faq', 'contact')
 */
function initPage(activePage) {
  const NAV_PAGES = [
    { id: 'home',    label: 'Home',            href: '/'               },
    { id: 'explore', label: 'Explore Design', href: '/explore/'       },
    { id: 'blog',    label: 'Blog',            href: '/blog/'          },
    { id: 'faq',     label: 'FAQ',             href: '/faq/'          },
  ];

  /* ── Inject nav links ── */
  const navCenter = document.querySelector('nav .nav-center');
  if (navCenter) {
    navCenter.innerHTML =
      NAV_PAGES.map(p =>
        `<a class="nav-link${p.id === activePage ? ' active' : ''}" href="${p.href}">${p.label}</a>`
      ).join('') +
      `<a class="nav-cta" href="/contact/">Order Consultation</a>`;
  }

  /* ── Inject footer ── */
  const footer = document.querySelector('footer');
  if (footer) {
    footer.innerHTML = `
      <div class="footer-inner">
        <div>
          <span class="footer-brand">Khadeeja Designs</span>
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
            <a href="https://wa.me/918667454391" target="_blank" rel="noopener">WhatsApp</a>
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
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    hamburger.onclick = () => _toggleMobileMenu();
  }
}

function _toggleMobileMenu() {
  const existing = document.getElementById('mob-menu');
  if (existing) { existing.remove(); return; }

  const pages = [
    { label: 'Home',           href: '/'               },
    { label: 'Explore Design', href: '/explore/'       },
    { label: 'Blog',           href: '/blog/'          },
    { label: 'FAQ',            href: '/faq/'           },
  ];

  const navH = document.querySelector('nav').offsetHeight;
  const m = document.createElement('div');
  m.id = 'mob-menu';
  m.style.cssText = `position:fixed;top:${navH}px;left:0;right:0;background:#0f0f0f;
    border-bottom:1px solid rgba(255,255,255,0.07);z-index:99;
    padding:8px 20px 20px;display:flex;flex-direction:column;`;

  pages.forEach(({ label, href }) => {
    const a = document.createElement('a');
    a.textContent = label; a.href = href;
    a.style.cssText = 'border-bottom:1px solid rgba(255,255,255,0.06);color:#888;' +
      'font-family:var(--sans);font-size:14px;padding:14px 0;text-decoration:none;display:block;';
    m.appendChild(a);
  });

  const cta = document.createElement('a');
  cta.textContent = 'Order Consultation';
  cta.href = '/contact/';
  cta.style.cssText = 'background:var(--gold);color:#000;font-family:var(--sans);' +
    'font-size:14px;font-weight:500;padding:13px;margin-top:14px;' +
    'text-decoration:none;text-align:center;display:block;';
  m.appendChild(cta);
  document.body.appendChild(m);

  /* close on outside click */
  setTimeout(() => {
    document.addEventListener('click', function handler(e) {
      if (!m.contains(e.target) && !document.querySelector('.hamburger').contains(e.target)) {
        m.remove();
        document.removeEventListener('click', handler);
      }
    });
  }, 0);
}
