/** Khadeeja Designs shared site shell. */

function initPage(activePage) {
  /* Nav and footer are written into the HTML at build time (tools/sync-site.js). */
  document.querySelector('.hamburger')?.addEventListener('click', _toggleMobileMenu);

  /* ── Wire hamburger ── */
  /* Normalise legacy page-specific CTAs into the shared button system. */
  document.querySelectorAll('.btn-gold, .cta, [data-button="gold"]').forEach(el => el.classList.add('button', 'button--gold'));
  document.querySelectorAll('.btn-ghost, [data-button="ghost"]').forEach(el => el.classList.add('button', 'button--ghost'));
  document.querySelectorAll('.faq, .seo-faq, .contact-faq').forEach(section => {
    if (section.querySelector('details')) section.classList.add('shared-question-section');
  });
  document.querySelectorAll('.reply-window-note').forEach(note => note.classList.add('reply-alert'));
  document.querySelectorAll('.product-contact-bar').forEach(bar => {
    bar.classList.add('mobile-contact-bar');
    bar.querySelector('.product-contact-bar__whatsapp')?.classList.add('mobile-contact-bar__whatsapp');
    bar.querySelector('.product-contact-bar__call')?.classList.add('mobile-contact-bar__call');
  });
  decorateWhatsAppLinks();

  preserveCampaignParams();
  installContactLinkTracking();
  addBreadcrumbSchema(activePage);
  trackDesignView();
  initProductGallery();
  renderProductDetailAccordions();
  initTestimonials();
}

/* Thumbnails are static HTML; swap both src and srcset so the browser really shows the chosen view. */
function initProductGallery() {
  const photo = document.querySelector('main.product .photo');
  const mainImage = photo?.querySelector(':scope > img');
  const buttons = photo ? [...photo.querySelectorAll('.product-gallery__thumbnail')] : [];
  if (!mainImage || buttons.length < 2) return;
  buttons.forEach(button => button.addEventListener('click', () => {
    mainImage.removeAttribute('srcset');
    if (button.dataset.srcset) mainImage.srcset = button.dataset.srcset;
    mainImage.src = button.dataset.src;
    if (button.dataset.alt) mainImage.alt = button.dataset.alt;
    buttons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
  }));
}

/* Reviews are static HTML; this only adds previous/next behaviour. */
function initTestimonials() {
  document.querySelectorAll('.testimonials').forEach(section => {
    const track = section.querySelector('.testimonials__track');
    const slides = track ? [...track.children] : [];
    const stars = section.querySelector('.testimonials__stars');
    const buttons = section.querySelectorAll('.testimonials__toolbar .testimonials__button');
    if (!slides.length || buttons.length < 2) return;
    let current = 0;
    const fit = () => { track.style.height = `${slides[current].offsetHeight}px`; };
    const show = index => {
      current = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      slides.forEach((slide, i) => slide.setAttribute('aria-hidden', String(i !== current)));
      const rating = Number(slides[current].dataset.rating) || 5;
      if (stars) {
        stars.textContent = `${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}`;
        stars.setAttribute('aria-label', `${rating} out of 5 stars`);
      }
      fit();
    };
    buttons[0].addEventListener('click', () => show(current - 1));
    buttons[1].addEventListener('click', () => show(current + 1));
    show(0);
    if ('ResizeObserver' in window) {
      const observer = new ResizeObserver(fit);
      slides.forEach(slide => observer.observe(slide));
    }
  });
}



document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img').forEach((img, index) => {
    if (!img.alt || /^View \d+$/.test(img.alt)) img.alt = `Khadeeja Designs Aari embroidery detail ${index + 1}`;
    if (!img.hasAttribute('width')) img.setAttribute('width', '600');
    if (!img.hasAttribute('height')) img.setAttribute('height', '600');
    if (!img.loading) img.loading = index === 0 ? 'eager' : 'lazy';
  });
});

function preserveCampaignParams() {
  const search = new URLSearchParams(window.location.search);
  const campaign = new URLSearchParams();
  search.forEach((value, key) => {
    if (/^utm_/i.test(key) || key === 'gclid' || key === 'fbclid') campaign.set(key, value);
  });

  try {
    if (campaign.toString()) sessionStorage.setItem('kd-campaign', campaign.toString());
  } catch (error) {
    console.warn('Campaign parameters could not be saved for this session', error);
  }

  let saved = '';
  try {
    saved = sessionStorage.getItem('kd-campaign') || '';
  } catch (error) {
    console.warn('Campaign parameters could not be restored for this session', error);
  }
  if (!saved) saved = campaign.toString();
  if (!saved) return;

  document.addEventListener('click', event => {
    const anchor = event.target.closest('a[href]');
    if (!anchor) return;
    const destination = new URL(anchor.href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    new URLSearchParams(saved).forEach((value, key) => {
      if (!destination.searchParams.has(key)) destination.searchParams.set(key, value);
    });
    anchor.href = destination.href;
  });
}



function installContactLinkTracking() {
  if (window.kdContactLinkTrackingInstalled) return;
  window.kdContactLinkTrackingInstalled = true;
  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('[data-contact-method]');
    if (!link) return;
    const method = link.dataset.contactMethod;
    if (method !== 'whatsapp' && method !== 'call') return;

    const designName = document.querySelector('main.product .title')?.textContent.trim();
    trackMarketingEvent('Contact', method === 'whatsapp' ? 'click_whatsapp' : 'click_call', {
      content_name: designName || 'Custom Aari embroidery',
      content_category: method === 'whatsapp' ? 'WhatsApp' : 'Phone'
    });
  });
}



function addBreadcrumbSchema(activePage) {
  /* The homepage is the top-level node of the site and has no breadcrumb trail. */
  if (activePage === 'home' || window.location.pathname === '/') return;
  const existing = [...document.querySelectorAll('script[type="application/ld+json"]')].some(script => {
    try { return JSON.parse(script.textContent)['@type'] === 'BreadcrumbList'; }
    catch { return false; }
  });
  if (existing) return;
  const product = document.querySelector('main.product');
  const crumbs = [{name: 'Home', item: 'https://khadeejadesigns.in/'}];
  if (product) {
    const title = product.querySelector('.title')?.textContent.trim();
    crumbs.push({name: 'Explore Designs', item: 'https://khadeejadesigns.in/explore/'});
    if (title) crumbs.push({name: title, item: window.location.href.split('?')[0]});
  } else if (activePage && activePage !== 'home') {
    const SECTION_LABELS = {
      explore: 'Explore Designs',
      blog: 'Blog',
      about: 'About Us',
      contact: 'Contact',
      faq: 'FAQ'
    };
    const link = document.querySelector('link[rel="canonical"]');
    const title = SECTION_LABELS[activePage] || document.querySelector('h1')?.textContent.trim() || document.title;
    crumbs.push({name: title, item: link?.href || window.location.href.split('?')[0]});
  } else if (window.location.pathname !== '/') {
    const title = document.querySelector('h1')?.textContent.trim() || document.title;
    crumbs.push({name: title, item: window.location.href.split('?')[0]});
  }
  if (crumbs.length < 2) return;
  appendJsonLd({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.item
    }))
  }, 'breadcrumbs');
}

function trackDesignView() {
  const product = document.querySelector('main.product');
  if (!product || window.kdViewContentTracked) return;
  window.kdViewContentTracked = true;
  const design = product.querySelector('.title')?.textContent.trim() || document.title;
  trackMarketingEvent('ViewContent', 'view_item', {
    content_name: design,
    content_type: 'product',
    items: [{item_name: design}]
  });
}


function renderProductDetailAccordions() {
  const product = document.querySelector('main.product');
  const content = product?.querySelector('.layout > div:last-child');
  const headings = content ? Array.from(content.querySelectorAll(':scope > h2')) : [];
  if (!content || headings.length < 3 || content.querySelector('.product-accordion')) return;

  headings.forEach((heading, index) => {
    const sectionContent = heading.nextElementSibling;
    if (!sectionContent || !sectionContent.matches('.copy, .specs')) return;
    const title = index === 0
      ? 'Design Details'
      : index === 1
        ? 'Embroidery Details'
        : index === 2
          ? 'Pricing'
          : heading.textContent.trim();
    const accordion = document.createElement('details');
    accordion.className = 'product-accordion';
    if (index === 2) accordion.classList.add('product-accordion--pricing');
    if (/what the listed price includes/i.test(title)) accordion.classList.add('product-accordion--price-includes');
    if (/what is quoted separately/i.test(title)) accordion.classList.add('product-accordion--price-excludes');
    const summary = document.createElement('summary');
    summary.textContent = title;
    accordion.append(summary, sectionContent);
    heading.replaceWith(accordion);
  });

  const enquiryLink = content.querySelector(':scope > .product-actions > .cta, :scope > .cta');
  if (enquiryLink) enquiryLink.textContent = 'Make It Yours';
}


function getCampaignParams() {
  const search = new URLSearchParams(window.location.search);
  let campaign = new URLSearchParams();
  search.forEach((value, key) => {
    if (/^utm_/i.test(key) || key === 'gclid' || key === 'fbclid') campaign.set(key, value);
  });
  try {
    if (!campaign.toString()) {
      campaign = new URLSearchParams(sessionStorage.getItem('kd-campaign') || '');
    }
  } catch (error) {
    console.warn('Campaign parameters are unavailable for this enquiry', error);
  }
  const values = {};
  campaign.forEach((value, key) => {
    if (/^utm_/i.test(key) || key === 'gclid' || key === 'fbclid') values[key] = value;
  });
  return values;
}

function trackMarketingEvent(pixelEvent, gaEvent, parameters) {
  if (typeof window.fbq === 'function') window.fbq('track', pixelEvent, parameters);
  else console.warn(`Meta Pixel is unavailable; ${pixelEvent} was not sent`);
  if (typeof window.gtag === 'function') window.gtag('event', gaEvent, parameters);
  else console.warn(`GA4 is unavailable; ${gaEvent} was not sent`);
}

function appendJsonLd(data, marker) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  if (marker) script.dataset[marker] = 'true';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}


function _toggleMobileMenu() {
  const existing = document.getElementById('mob-menu');
  const hamburger = document.querySelector('.hamburger');
  if (existing) { _closeMobileMenu(true); return; }

  const pages = [
    { label: 'Home',            href: '/'          },
    { label: 'Explore Designs', href: '/explore/'  },
    { label: 'Bridal',          href: '/bridal-aari-blouse/' },
    { label: 'Blog',            href: '/blog/'     },
    { label: 'About',           href: '/about/'    },
    { label: 'FAQ',             href: '/faq/'      },
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
  cta.textContent = 'Contact';
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

function decorateWhatsAppLinks() {
  document.querySelectorAll('a[href*="wa.me/"]:not([data-static-label])').forEach(link => {
    const isProductLink = link.classList.contains('product-whatsapp');
    let icon = link.querySelector('.whatsapp-icon');
    let label = isProductLink ? null : link.querySelector('.whatsapp-label');
    let prefix = link.querySelector('.whatsapp-prefix');
    if (!icon) {
      icon = document.createElement('img');
      icon.className = 'whatsapp-icon';
      icon.src = '/images/whatsapp-icon.png';
      icon.alt = '';
      icon.setAttribute('aria-hidden', 'true');
    }
    if (!label) {
      label = document.createElement('span');
      label.className = 'whatsapp-label';
    }
    if (isProductLink && !prefix) {
      prefix = document.createElement('span');
      prefix.className = 'whatsapp-prefix';
    }
    if (isProductLink) {
      link.replaceChildren(prefix, icon);
      prefix.textContent = 'Discuss on';
    } else {
      if (!label) {
        label = document.createElement('span');
        label.className = 'whatsapp-label';
      }
      link.replaceChildren(icon, label);
      label.textContent = 'WhatsApp';
    }
    link.classList.add('whatsapp-link');
    if (isProductLink) {
      const currentLabel = link.getAttribute('aria-label') || '';
      link.setAttribute('aria-label', currentLabel.replace(/^Chat about this design on WhatsApp/i, 'Discuss this design on WhatsApp'));
    }
  });
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
