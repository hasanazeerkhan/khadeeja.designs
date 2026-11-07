/** Khadeeja Designs shared site shell. */
let siteConfigPromise;

function getSiteConfig() {
  if (!siteConfigPromise) {
    siteConfigPromise = fetch('/site-config.json')
      .then(response => {
        if (!response.ok) throw new Error(`Site config request failed: ${response.status}`);
        return response.json();
      });
  }
  return siteConfigPromise;
}

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

  preserveCampaignParams();
  addLocalBusinessSchema(activePage);
  addBreadcrumbSchema(activePage);
  trackDesignView();
  renderProductGallery();
  renderProductDetailAccordions();
  updateProductPrice();
  renderRelatedLinks();
  getSiteConfig()
    .then(config => {
      renderOrderingSteps(config, activePage);
      renderTestimonials(config, activePage);
      renderWhatsAppLinks(config, activePage);
      applyReplyWindow(config);
    })
    .catch(error => console.error('Could not initialize shared site components', error));
}

async function renderProductGallery() {
  const product = document.querySelector('main.product');
  const photo = product?.querySelector('.photo');
  const mainImage = photo?.querySelector('img');
  const id = window.location.pathname.match(/\/explore\/designs\/([a-z0-9-]+)\//)?.[1];
  if (!product || !photo || !mainImage || !id) return;

  try {
    const response = await fetch(`/explore/designs/${encodeURIComponent(id)}/product.json`);
    if (!response.ok) throw new Error(`Product request failed: ${response.status}`);
    const data = await response.json();
    const images = Array.isArray(data.images)
      ? data.images.filter(image => typeof image === 'string' && image.trim())
      : [];
    if (images.length < 2) return;

    const thumbnails = document.createElement('div');
    thumbnails.className = 'product-gallery__thumbnails';
    thumbnails.setAttribute('aria-label', 'Design images');
    const mainImageId = `design-image-${id}`;
    mainImage.id = mainImageId;

    images.forEach((filename, index) => {
      const originalSrc = `/explore/designs/${encodeURIComponent(id)}/${encodeURIComponent(filename)}`;
      const webpSrc = originalSrc.replace(/\.(?:png|jpe?g)$/i, '.webp');
      const button = document.createElement('button');
      button.className = 'product-gallery__thumbnail';
      button.type = 'button';
      button.setAttribute('aria-label', `Show design image ${index + 1}`);
      button.setAttribute('aria-controls', mainImageId);
      button.setAttribute('aria-pressed', String(index === 0));
      if (index === 0) button.classList.add('is-active');

      const thumbnail = document.createElement('img');
      thumbnail.src = webpSrc;
      thumbnail.alt = '';
      thumbnail.loading = 'lazy';
      thumbnail.width = 96;
      thumbnail.height = 96;
      thumbnail.dataset.fallbackSrc = originalSrc;
      thumbnail.addEventListener('error', () => {
        if (!thumbnail.dataset.fallbackSrc) return;
        thumbnail.src = thumbnail.dataset.fallbackSrc;
        delete thumbnail.dataset.fallbackSrc;
      }, {once: true});
      button.appendChild(thumbnail);
      thumbnails.appendChild(button);

      button.addEventListener('click', () => {
        mainImage.src = webpSrc;
        mainImage.dataset.fallbackSrc = originalSrc;
        thumbnails.querySelectorAll('.product-gallery__thumbnail').forEach((item, itemIndex) => {
          const selected = itemIndex === index;
          item.classList.toggle('is-active', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
      });
    });

    photo.appendChild(thumbnails);
  } catch (error) {
    console.error('Could not load the design image gallery', error);
  }
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

function renderOrderingSteps(config, activePage) {
  if (!['home', 'contact'].includes(activePage) || !Array.isArray(config.orderingSteps)) return;
  const main = document.querySelector('main');
  if (!main || document.querySelector('.ordering-steps')) return;

  const section = document.createElement('section');
  section.className = 'ordering-steps';
  section.setAttribute('aria-labelledby', 'ordering-steps-title');
  section.innerHTML = `
    <div class="ordering-steps__heading">
      <div class="kicker"><div class="kicker-line"></div><span class="kicker-text">Simple process</span></div>
      <h2 id="ordering-steps-title">How ordering <em>works</em></h2>
    </div>
    <ol>${config.orderingSteps.map((step, index) => `
      <li><div class="ordering-steps__title"><span class="ordering-steps__number">Step 0${index + 1}</span><h3>${escapeHtml(step.title)}</h3></div>
        <p>${escapeHtml(step.description)}</p>
      </li>`).join('')}
    </ol>`;
  const serviceSection = activePage === 'home' ? document.querySelector('.service-section') : null;
  if (serviceSection) serviceSection.after(section);
  else {
    const faq = main.querySelector('.faq-section, .contact-faq');
    main.insertBefore(section, faq || null);
  }
}

function renderTestimonials(config, activePage) {
  if (!['home', 'contact'].includes(activePage) || !Array.isArray(config.testimonials) || !config.testimonials.length) return;
  const main = document.querySelector('main');
  if (!main || document.querySelector('.testimonials')) return;
  const section = document.createElement('section');
  section.className = 'testimonials';
  section.setAttribute('aria-labelledby', 'testimonials-title');
  section.innerHTML = `
    <div class="testimonials__heading">
      <div class="kicker"><div class="kicker-line"></div><span class="kicker-text">Client reviews</span></div>
      <h2 id="testimonials-title">Kind words from our <em>clients</em></h2>
    </div>
    <div class="testimonials__carousel" role="group" aria-roledescription="carousel" aria-label="Client testimonials">
      <div class="testimonials__toolbar">
        <button class="testimonials__button" type="button" aria-label="Previous review">‹</button>
        <span class="testimonials__stars" role="img"></span>
        <button class="testimonials__button" type="button" aria-label="Next review">›</button>
      </div>
      <div class="testimonials__viewport">
        <div class="testimonials__track" aria-live="polite">${config.testimonials.map((testimonial, index) => `
          <figure class="testimonials__slide" role="group" aria-roledescription="slide" aria-label="${index + 1} of ${config.testimonials.length}" aria-hidden="${index !== 0}">
            <blockquote>${escapeHtml(testimonial.quote)}</blockquote>
            <figcaption>${testimonial.photo ? `<img src="${escapeHtml(testimonial.photo)}" alt="" width="48" height="48" loading="lazy">` : ''}
              <span>${escapeHtml(testimonial.name)}${testimonial.city ? ` · ${escapeHtml(testimonial.city)}` : ''}</span>
            </figcaption>
          </figure>`).join('')}</div>
      </div>
    </div>
    `;
  const track = section.querySelector('.testimonials__track');
  const slides = Array.from(track.children);
  const stars = section.querySelector('.testimonials__stars');
  const ratings = config.testimonials.map(testimonial => Math.max(0, Math.min(5, Number(testimonial.rating) || 5)));
  let currentIndex = 0;
  const updateTrackHeight = () => {
    track.style.height = `${slides[currentIndex].offsetHeight}px`;
  };
  const showSlide = index => {
    currentIndex = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;
    updateTrackHeight();
    slides.forEach((slide, slideIndex) => slide.setAttribute('aria-hidden', String(slideIndex !== currentIndex)));
    stars.textContent = `${'★'.repeat(ratings[currentIndex])}${'☆'.repeat(5 - ratings[currentIndex])}`;
    stars.setAttribute('aria-label', `${ratings[currentIndex]} out of 5 stars`);
  };
  const buttons = section.querySelectorAll('.testimonials__toolbar .testimonials__button');
  buttons[0].addEventListener('click', () => showSlide(currentIndex - 1));
  buttons[1].addEventListener('click', () => showSlide(currentIndex + 1));
  const steps = main.querySelector('.ordering-steps');
  const serviceSection = activePage === 'home' ? document.querySelector('.service-section') : null;
  if (serviceSection) serviceSection.after(section);
  else main.insertBefore(section, steps || null);
  showSlide(0);
  const resizeObserver = new ResizeObserver(updateTrackHeight);
  slides.forEach(slide => resizeObserver.observe(slide));
}

function renderWhatsAppLinks(config, activePage) {
  const number = String(config.whatsappNumber || '').replace(/\D/g, '');
  if (!number) return;
  const product = document.querySelector('main.product');
  const designName = product?.querySelector('.title')?.textContent.trim();
  const message = designName
    ? `Hi, I'm interested in ${designName}`
    : 'Hi, I am interested in custom Aari blouse embroidery.';
  const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
  const createLink = (className, label, includeIcon = true) => {
    const link = document.createElement('a');
    link.className = `${className} whatsapp-link`;
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.dataset.whatsapp = 'true';

    if (includeIcon) {
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      icon.classList.add('whatsapp-icon');
      icon.setAttribute('viewBox', '0 0 24 24');
      icon.setAttribute('aria-hidden', 'true');
      icon.innerHTML = '<path d="M20.2 11.7a8.2 8.2 0 0 1-12.1 7.2L3 20l1.2-4.9a8.2 8.2 0 1 1 16-3.4Z"/><path d="M8.8 8.1c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.7 1.6c.1.3.1.5-.1.7l-.5.6c-.2.2-.2.4 0 .6.5.9 1.2 1.5 2.1 1.9.2.1.4.1.6-.1l.7-.8c.2-.2.4-.3.7-.1l1.5.7c.3.1.4.3.4.5 0 .3-.2 1.1-.7 1.4-.5.4-1.1.6-1.7.5-1-.1-2.2-.6-3.4-1.7-1.4-1.2-2.3-2.7-2.5-3.7-.2-.9 0-1.6.5-2.1Z"/>';
      link.append(icon);
    }
    const text = document.createElement('span');
    text.className = 'whatsapp-label';
    text.textContent = label;
    link.append(text);
    return link;
  };

  const floating = createLink('whatsapp-float', 'Chat on WhatsApp');
  floating.setAttribute('aria-label', 'Chat with Khadeeja Designs on WhatsApp');
  document.body.appendChild(floating);

  if (activePage === 'contact') {
    const header = document.querySelector('.contact-header');
    if (header && !header.querySelector('[data-whatsapp-cta]')) {
      const cta = createLink('button button--ghost contact-whatsapp', 'Enquire on WhatsApp');
      cta.dataset.whatsappCta = 'true';
      header.appendChild(cta);
    }
  }

  if (product && !product.querySelector('[data-whatsapp-cta]')) {
    const cta = createLink('button button--ghost product-whatsapp', 'Ask about this', false);
    cta.dataset.whatsappCta = 'true';
    const actions = product.querySelector('.product-actions');
    (actions || product.querySelector('.layout > div:last-child'))?.appendChild(cta);
  }

  if (!window.kdWhatsAppTrackingInstalled) {
    window.kdWhatsAppTrackingInstalled = true;
    document.addEventListener('click', event => {
      if (!event.target.closest('[data-whatsapp]')) return;
      trackMarketingEvent('Contact', 'click_whatsapp', {
        content_name: designName || 'Custom Aari embroidery',
        content_category: 'WhatsApp'
      });
    });
  }
}

function renderRelatedLinks() {
  const product = document.querySelector('main.product');
  if (product && !product.querySelector('.related-guide')) {
    const related = document.createElement('section');
    related.className = 'related-guide';
    related.setAttribute('aria-label', 'Related guide');
    const label = document.createElement('span');
    label.className = 'related-guide-label';
    label.textContent = 'From our blog';
    const link = document.createElement('a');
    link.className = 'related-guide-link';
    link.href = '/blog/how-to-choose-aari-embroidery-bridal-blouse/';
    const type = document.createElement('span');
    type.textContent = 'Related guide →';
    const title = document.createElement('strong');
    title.textContent = 'How to choose an Aari embroidery style for your wedding blouse';
    const date = document.createElement('small');
    date.textContent = 'June 2025';
    link.append(type, title, date);
    related.append(label, link);
    product.appendChild(related);
  }

  if (window.location.pathname !== '/blog/how-to-choose-aari-embroidery-bridal-blouse/') return;
  const article = document.querySelector('main article');
  if (!article || article.querySelector('.related-designs')) return;
  const links = document.createElement('section');
  links.className = 'related-designs';
  links.innerHTML = `
    <h2>Explore related blouse designs</h2>
    <ul>
      <li><a href="/explore/designs/bridal-royal-zardosi/">Bridal Royal Zardosi blouse</a></li>
      <li><a href="/explore/designs/midnight-gold-vine/">Midnight Gold Vine blouse</a></li>
    </ul>`;
  article.appendChild(links);
}

function applyReplyWindow(config) {
  const replyWindow = config.replyWindow || 'the stated reply window';
  document.querySelectorAll('[data-reply-window]').forEach(element => {
    element.textContent = replyWindow;
  });
}

function addLocalBusinessSchema(activePage) {
  if (!['home', 'contact'].includes(activePage)) return;
  const existing = [...document.querySelectorAll('script[type="application/ld+json"]')].some(script => {
    try { return JSON.parse(script.textContent)['@type'] === 'LocalBusiness'; }
    catch { return false; }
  });
  if (existing) return;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Khadeeja Designs',
    description: 'Handcrafted Aari embroidery and custom blouse design in Trichy, Tamil Nadu.',
    url: 'https://khadeejadesigns.in/',
    email: 'contact@khadeejadesigns.in',
    telephone: '+918667454391',
    image: 'https://khadeejadesigns.in/explore/designs/bridal-royal-zardosi/khadeeja_designs_bridal_royal_zardosi_blouse_back.webp',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '17 East Sayakara Lane, Jaffersha Street',
      addressLocality: 'Trichy',
      postalCode: '620008',
      addressCountry: 'IN'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 10.822033045661112,
      longitude: 78.69673369581488
    },
    areaServed: ['Trichy', 'Tamil Nadu', 'India'],
    alternateName: 'Khadeeja Designs Tiruchirappalli',
    priceRange: '₹1,999–₹8,499',
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '10:00',
      closes: '19:00'
    }],
    hasMap: 'https://maps.app.goo.gl/LLfyh2Ar4wq9Twyc8',
    sameAs: ['https://instagram.com/khadeeja.designs']
  };
  appendJsonLd(schema, 'local-business');
}

function addBreadcrumbSchema(activePage) {
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
    const link = document.querySelector('link[rel="canonical"]');
    const title = document.querySelector('h1')?.textContent.trim() || document.title;
    crumbs.push({name: title, item: link?.href || window.location.href.split('?')[0]});
  } else if (window.location.pathname !== '/') {
    const title = document.querySelector('h1')?.textContent.trim() || document.title;
    crumbs.push({name: title, item: window.location.href.split('?')[0]});
  }
  if (!crumbs.length) return;
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

  const sections = [
    { heading: headings[0], title: 'Design Details', content: headings[0].nextElementSibling },
    { heading: headings[1], title: 'Embroidery Details', content: headings[1].nextElementSibling },
    { heading: headings[2], title: 'Pricing', content: headings[2].nextElementSibling }
  ];

  const accordions = sections.map(({ heading, title, content: sectionContent }) => {
    if (!sectionContent || !sectionContent.matches('.copy, .specs')) return null;
    const accordion = document.createElement('details');
    accordion.className = `product-accordion${title === 'Pricing' ? ' product-accordion--pricing' : ''}`;
    const summary = document.createElement('summary');
    summary.textContent = title;
    accordion.append(summary, sectionContent);
    heading.replaceWith(accordion);
    return accordion;
  });

  const pricingAccordion = accordions[2];
  const enquiryLink = content.querySelector(':scope > .cta');
  if (!pricingAccordion || !enquiryLink) return;

  const actions = document.createElement('div');
  actions.className = 'product-actions';
  actions.setAttribute('role', 'group');
  actions.setAttribute('aria-label', 'Enquiry options');
  enquiryLink.textContent = 'Make It Yours';
  actions.appendChild(enquiryLink);
  pricingAccordion.after(actions);
}

async function updateProductPrice() {
  const page = document.querySelector('main.product');
  if (!page) return;
  const id = window.location.pathname.match(/\/explore\/designs\/([a-z0-9-]+)\//)?.[1];
  if (!id) return;
  try {
    const response = await fetch(`/explore/designs/${encodeURIComponent(id)}/product.json`);
    if (!response.ok) throw new Error(`Product request failed: ${response.status}`);
    const data = await response.json();
    const priceElement = page.querySelector('.price');
    let originalPrice = priceElement?.querySelector('.old');
    const offerActive = Boolean(
      data.originalPrice && data.offerEndsOn &&
      /^\d{4}-\d{2}-\d{2}$/.test(data.offerEndsOn) &&
      data.offerEndsOn >= new Date().toISOString().slice(0, 10)
    );
    if (offerActive && priceElement && !originalPrice) {
      originalPrice = document.createElement('span');
      originalPrice.className = 'old';
      priceElement.prepend(originalPrice);
    }
    if (originalPrice) {
      const originalAmount = Number(String(data.originalPrice || '').replace(/[^\d.]/g, ''));
      originalPrice.textContent = offerActive && Number.isFinite(originalAmount) && originalAmount > 0
        ? formatRupees(originalAmount)
        : '';
      originalPrice.hidden = !offerActive;
      originalPrice.style.display = offerActive ? 'inline' : 'none';
    }
    const price = Number(String(data.newPrice || '').replace(/[^\d.]/g, ''));
    if (Number.isFinite(price) && price > 0) {
      if (priceElement) {
        const amountNode = Array.from(priceElement.childNodes).find(node => node.nodeType === Node.TEXT_NODE);
        if (amountNode) amountNode.textContent = formatRupees(price);
        else priceElement.append(document.createTextNode(formatRupees(price)));
        priceElement.setAttribute('aria-label', `Listed rate ${formatRupees(price)}`);
      }
      const pricingCopy = page.querySelector('.product-accordion--pricing > .copy');
      if (pricingCopy?.matches('.copy')) {
        pricingCopy.textContent = 'The listed rate applies to the design shown. Customisation can be discussed for colours, motifs, placement, neckline and sleeve details. Final feasibility and quotation are confirmed after enquiry.';
      }
      document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
        try {
          const schema = JSON.parse(script.textContent);
          if (schema['@type'] !== 'Product' || !schema.offers) return;
          schema.offers.price = price;
          if (offerActive) schema.offers.priceValidUntil = data.offerEndsOn;
          else delete schema.offers.priceValidUntil;
          script.textContent = JSON.stringify(schema);
        } catch (error) {
          console.error('Could not update Product structured data', error);
        }
      });
    }
  } catch (error) {
    console.error('Could not update the design offer display', error);
  }
}

function formatRupees(amount) {
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
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

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

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
