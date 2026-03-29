/* shared-footer.js
   Injects consistent nav links and footer on every page.
   Include at bottom of each HTML body:
   <script src="shared-footer.js"></script>
   Then call: injectNav('home') and injectFooter()
*/

function injectNav(activePage) {
  const pages = [
    { id: 'home',    label: 'Home',           href: 'index.html'   },
    { id: 'explore', label: 'Explore Design',  href: 'explore.html' },
    { id: 'blog',    label: 'Blog',            href: 'blog.html'    },
    { id: 'faq',     label: 'FAQ',             href: 'faq.html'     },
    { id: 'contact', label: 'Contact',         href: 'contact.html' },
  ];
  const nav = document.querySelector('nav .nav-center');
  if (!nav) return;
  nav.innerHTML = pages.map(p =>
    `<a class="nav-link${p.id === activePage ? ' active' : ''}" href="${p.href}">${p.label}</a>`
  ).join('') + `<a class="nav-cta" href="contact.html">Order Consultation</a>`;
}

function injectFooter() {
  const footer = document.querySelector('footer');
  if (!footer) return;
  footer.innerHTML = `
    <div class="footer-inner">
      <div class="footer-brand-block">
        <span class="footer-brand">Khadeeja Designs</span>
        <p class="footer-tagline">Boutique Aari embroidery,<br>handcrafted in Trichy.</p>
      </div>
      <div class="footer-cols">
        <div class="footer-col">
          <span class="footer-col-label">Explore</span>
          <a href="explore.html">Portfolio</a>
          <a href="faq.html">FAQ</a>
          <a href="blog.html">Blog</a>
        </div>
        <div class="footer-col">
          <span class="footer-col-label">Contact</span>
          <a href="contact.html">Send Enquiry</a>
          <a href="https://wa.me/918667454391" target="_blank">WhatsApp</a>
          <a href="https://instagram.com/khadeeja.designs" target="_blank">Instagram</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© Khadeeja Designs. All rights reserved.</span>
      <div class="footer-legal">
        <a href="privacy.html">Privacy Policy</a>
        <a href="faq.html">FAQ</a>
      </div>
    </div>`;
}

function toggleMenu(activePage) {
  const existing = document.getElementById('mob-menu');
  if (existing) { existing.remove(); return; }
  const pages = [
    { label: 'Home',          href: 'index.html'   },
    { label: 'Explore Design',href: 'explore.html' },
    { label: 'Blog',          href: 'blog.html'    },
    { label: 'FAQ',           href: 'faq.html'     },
    { label: 'Contact',       href: 'contact.html' },
  ];
  const m = document.createElement('div');
  m.id = 'mob-menu';
  m.style.cssText = 'position:fixed;top:57px;left:0;right:0;background:#0f0f0f;border-bottom:1px solid rgba(255,255,255,0.07);z-index:99;padding:12px 20px 20px;display:flex;flex-direction:column;';
  pages.forEach(({ label, href }) => {
    const a = document.createElement('a');
    a.textContent = label; a.href = href;
    a.style.cssText = 'border-bottom:1px solid rgba(255,255,255,0.06);color:#888;font-family:var(--sans);font-size:14px;padding:14px 0;text-decoration:none;display:block;';
    m.appendChild(a);
  });
  const cta = document.createElement('a');
  cta.textContent = 'Order Consultation'; cta.href = 'contact.html';
  cta.style.cssText = 'background:var(--gold);color:#000;font-family:var(--sans);font-size:14px;font-weight:500;padding:13px;margin-top:14px;text-decoration:none;text-align:center;display:block;';
  m.appendChild(cta);
  document.body.appendChild(m);
}
