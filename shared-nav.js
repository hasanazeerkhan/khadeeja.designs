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
    { id: 'home',    label: 'Home',            href: '/'         },
    { id: 'explore', label: 'Explore Designs', href: '/explore/' },
    { id: 'blog',    label: 'Blog',            href: '/blog/'    },
    { id: 'about',   label: 'About',           href: '/about/'   },
    { id: 'faq',     label: 'FAQ',             href: '/faq/'     },
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
        <a class="nav-cta button button--gold" data-button="gold" href="/contact/">Contact</a>
      </div>
      <button class="hamburger" type="button" aria-label="Open navigation menu" aria-expanded="false"><span></span><span></span><span></span></button>`;
    header.querySelector('.hamburger').addEventListener('click', _toggleMobileMenu);
  }

  /* ── Inject footer ── */
  const footer = document.querySelector('footer');
  if (footer) {
    footer.innerHTML = `
      <div class="footer-main">
        <div class="footer-signature">
          <a class="footer-brand" href="/">Khadeeja Designs</a>
          <p class="footer-tagline">Boutique Aari embroidery, handcrafted in Trichy</p>
        </div>
        <nav class="footer-nav" aria-label="Footer navigation">
          <a href="/explore/">Explore Designs</a>
          <span class="footer-separator" aria-hidden="true">·</span>
          <a href="/blog/">Blog</a>
          <span class="footer-separator" aria-hidden="true">·</span>
          <a href="/about/">About</a>
          <span class="footer-separator" aria-hidden="true">·</span>
          <a href="/faq/">FAQ</a>
          <span class="footer-separator" aria-hidden="true">·</span>
          <a href="/contact/">Contact</a>
        </nav>
        <nav class="footer-social" aria-label="Social and community links">
          <a href="https://instagram.com/khadeeja.designs" target="_blank" rel="noopener noreferrer" aria-label="Instagram profile of Khadeeja Designs">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg>
            <span>Instagram</span>
          </a>
          <a href="https://www.reddit.com/user/khadeejadesigns/" target="_blank" rel="me noopener noreferrer" aria-label="Reddit profile of Khadeeja Designs">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.016.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"/></svg>
            <span>Reddit</span>
          </a>
          <a href="https://www.reddit.com/r/AariEmbroidery/" target="_blank" rel="noopener noreferrer" aria-label="Visit the r/AariEmbroidery community">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.016.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z"/></svg>
            <span>r/AariEmbroidery</span>
          </a>
          <a href="https://medium.com/@khadeejadesigns" target="_blank" rel="me noopener noreferrer" aria-label="Medium articles by Khadeeja Designs">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5h4.3l3.8 9.2L13.9 5H17v14h-3v-8l-3.1 8H8.8L5.7 11v8H2V5Z"></path><circle cx="20" cy="8" r="2"></circle><circle cx="20" cy="16" r="2"></circle></svg>
            <span>Medium</span>
          </a>
        </nav>
      </div>
      <div class="footer-bottom">
        <span class="footer-copy">&copy; Khadeeja Designs. All rights reserved.</span>
        <span class="footer-bottom-separator" aria-hidden="true">·</span>
        <div class="footer-legal">
          <a href="/privacy/">Privacy Policy</a>
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
  document.querySelectorAll('.reply-window-note').forEach(note => note.classList.add('reply-alert'));
  document.querySelectorAll('.product-contact-bar').forEach(bar => {
    bar.classList.add('mobile-contact-bar');
    bar.querySelector('.product-contact-bar__whatsapp')?.classList.add('mobile-contact-bar__whatsapp');
    bar.querySelector('.product-contact-bar__call')?.classList.add('mobile-contact-bar__call');
  });
  decorateWhatsAppLinks();

  preserveCampaignParams();
  installContactLinkTracking();
  addLocalBusinessSchema(activePage);
  addBreadcrumbSchema(activePage);
  trackDesignView();
  renderProductGallery();
  renderProductPricingScope();
  renderProductDetailAccordions();
  updateProductPrice();
  renderRelatedLinks();
  getSiteConfig()
    .then(config => {
      renderOrderingSteps(config, activePage);
      renderTestimonials(config, activePage);
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
function initialiseAnalyticsFromConfig(config) {
  const analytics = (config && config.analytics) || {};
  const gaMeasurementId = String(analytics.gaMeasurementId || '').trim();
  const metaPixelId = String(analytics.metaPixelId || '').trim();
  if (gaMeasurementId && !/^(G-|UA-|AW-)?(TEST|TODO|PLACEHOLDER|XXXX|000000|123456)/i.test(gaMeasurementId)) {
    if (!window.dataLayer) window.dataLayer = [];
    if (!window.gtag) {
      window.gtag = function gtag() {
        window.dataLayer.push(arguments);
      };
    }
    window.gtag('js', new Date());
    window.gtag('config', gaMeasurementId, { send_page_view: true });
  }

  if (metaPixelId && !/^(1234567890|000000000000000|TEST|TODO|PLACEHOLDER|XXXX)/i.test(metaPixelId)) {
    if (!window.fbq) {
      window.fbq = function fbq() { (window.fbq.q = window.fbq.q || []).push(arguments); };
      window.fbq.q = window.fbq.q || [];
    }
    if (!window.fbq.loaded) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://connect.facebook.net/en_US/fbevents.js`;
      document.head.appendChild(script);
      window.fbq.loaded = true;
    }
    window.fbq('init', metaPixelId);
    window.fbq('track', 'PageView');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('img').forEach((img, index) => {
    if (!img.alt || /^View \d+$/.test(img.alt)) img.alt = `Khadeeja Designs Aari embroidery detail ${index + 1}`;
    if (!img.hasAttribute('width')) img.setAttribute('width', '600');
    if (!img.hasAttribute('height')) img.setAttribute('height', '600');
    if (!img.loading) img.loading = index === 0 ? 'eager' : 'lazy';
  });

  getSiteConfig()
    .then(config => initialiseAnalyticsFromConfig(config))
    .catch(error => console.warn('Analytics config is unavailable right now', error));
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

async function renderProductPricingScope() {
  const product = document.querySelector('main.product');
  if (!product) return;

  const id = window.location.pathname.match(/\/explore\/designs\/([a-z0-9-]+)\//)?.[1];
  if (!id) return;

  try {
    const response = await fetch(`/explore/designs/${encodeURIComponent(id)}/product.json`);
    if (!response.ok) throw new Error(`Product request failed: ${response.status}`);
    const data = await response.json();
    const priceDetails = document.createElement('details');
    priceDetails.className = 'product-accordion product-accordion--price-scope';
    const summary = document.createElement('summary');
    summary.textContent = 'What this price covers';
    const scope = document.createElement('div');
    scope.className = 'pricing-scope content-panel';
    scope.innerHTML = `
      <h3>Listed design</h3>
      <p>The listed rate applies to the embroidery shown in this design.</p>
      <ul>
        <li><strong>Garment:</strong> ${data.customerSuppliesBlouse ? 'The customer supplies the blouse or garment for embroidery.' : 'The studio supplies the base fabric or blouse for the work.'}</li>
        <li><strong>Delivery:</strong> ${escapeHtml(data.shippingNote || 'Delivery arrangements are confirmed with the quote.')}</li>
      </ul>
    `;
    priceDetails.append(summary, scope);
    const lastPricingAccordion = product.querySelector('.product-accordion--price-excludes')
      || product.querySelector('.product-accordion--price-includes')
      || product.querySelector('.product-accordion--pricing');
    if (lastPricingAccordion) lastPricingAccordion.after(priceDetails);
  } catch (error) {
    console.error('Could not render the pricing scope', error);
  }
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
    { label: 'Home',            href: '/'          },
    { label: 'Explore Designs', href: '/explore/'  },
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
  document.querySelectorAll('a[href*="wa.me/"]').forEach(link => {
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
