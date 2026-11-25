#!/usr/bin/env node
/**
 * sync-site.js: writes every shared block into the static HTML at build time.
 *
 * One source of truth:
 *   site-config.json                      business facts, hours, analytics IDs, testimonials, ordering steps
 *   explore/designs/<id>/product.json     each design (price, images, FAQs, schema)
 *
 * Blocks it owns (between <!-- name:start --> and <!-- name:end --> markers, or replaced on first run):
 *   site-head        analytics (Clarity, GA4, Meta Pixel), the single business JSON-LD entity, share-image size
 *   site-nav         primary navigation (with the active page marked)
 *   site-footer      footer
 *   testimonials     customer reviews (home, contact, product and service pages)
 *   ordering-steps   "How ordering works" (home, contact)
 *   product-*        gallery, price + offer note, pricing scope, how-it-works strip, FAQs, related guide, Product JSON-LD
 *
 * The browser no longer rewrites any of this after load: crawlers and people see the same HTML.
 * Usage: node tools/sync-site.js
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const SITE = 'https://khadeejadesigns.in';
const config = JSON.parse(fs.readFileSync(path.join(root, 'site-config.json'), 'utf8'));
const biz = config.business;
const productIds = JSON.parse(fs.readFileSync(path.join(root, 'explore/designs/index.json'), 'utf8'));
const products = Object.fromEntries(productIds.map(id => [
  id, JSON.parse(fs.readFileSync(path.join(root, 'explore/designs', id, 'product.json'), 'utf8')),
]));

const SKIP = new Set(['.git', '.github', 'node_modules', 'dist', 'scripts', 'tools', 'ScreemingFrogResults']);

const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const rupees = amount => `₹${Math.round(amount).toLocaleString('en-IN')}`;
const jsonLd = (data, attr) => `<script type="application/ld+json" ${attr}>${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) { if (!SKIP.has(entry.name)) walk(path.join(dir, entry.name), out); }
    else if (entry.name.endsWith('.html')) out.push(path.join(dir, entry.name));
  }
  return out;
}

/** Replace a marked block; if no markers yet, replace `fallback` (regex) or insert via `insert(html, block)`. */
function setBlock(html, name, content, { fallback, insert, file } = {}) {
  const block = `<!-- ${name}:start -->${content}<!-- ${name}:end -->`;
  const marked = new RegExp(`<!-- ${name}:start -->[\\s\\S]*?<!-- ${name}:end -->`);
  if (marked.test(html)) return html.replace(marked, () => block);
  if (fallback && fallback.test(html)) return html.replace(fallback, () => block);
  if (insert) {
    const next = insert(html, block);
    if (next !== html) return next;
  }
  throw new Error(`${file}: could not place the "${name}" block`);
}

/* ------------------------------------------------------------------ shared blocks */

function businessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': biz.type,
    '@id': biz.id,
    name: biz.name,
    description: biz.description,
    url: biz.url,
    email: biz.email,
    telephone: biz.telephone,
    image: biz.image,
    logo: biz.logo,
    priceRange: biz.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: biz.streetAddress,
      addressLocality: biz.addressLocality,
      addressRegion: biz.addressRegion,
      postalCode: biz.postalCode,
      addressCountry: biz.addressCountry,
    },
    geo: { '@type': 'GeoCoordinates', latitude: biz.latitude, longitude: biz.longitude },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: biz.openingDays,
      opens: biz.opens,
      closes: biz.closes,
    }],
    areaServed: biz.areaServed,
    hasMap: biz.hasMap,
    sameAs: biz.sameAs,
  };
}

function headBlock(ogImage) {
  const a = config.analytics || {};
  const ga = String(a.gaMeasurementId || '').trim();
  const pixel = String(a.metaPixelId || '').trim();
  const clarity = String(a.clarityId || '').trim();
  const parts = ['\n'];
  if (pixel) {
    // Standard Meta Pixel base code, inline so the fastest bouncers are counted too.
    parts.push(`<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(pixel)});fbq('track','PageView');</script>\n`);
  }
  if (ga) {
    parts.push(`<script async src="https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga)}"></script>\n`);
    parts.push(`<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${JSON.stringify(ga)});</script>\n`);
  }
  if (clarity) {
    parts.push(`<script>window.addEventListener("load",function(){function c(){(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script",${JSON.stringify(clarity)});}if(window.requestIdleCallback){window.requestIdleCallback(c,{timeout:2000});}else{window.setTimeout(c,1000);}},{once:true});</script>\n`);
  }
  if (ogImage) parts.push('<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/jpeg">\n');
  parts.push(jsonLd(businessSchema(), 'data-business'), '\n');
  return parts.join('');
}

const NAV_PAGES = [
  { id: 'home', label: 'Home', href: '/' },
  { id: 'explore', label: 'Explore Designs', href: '/explore/' },
  { id: 'bridal', label: 'Bridal', href: '/bridal-aari-blouse/' },
  { id: 'blog', label: 'Blog', href: '/blog/' },
  { id: 'about', label: 'About', href: '/about/' },
  { id: 'faq', label: 'FAQ', href: '/faq/' },
];

function navBlock(active) {
  const links = NAV_PAGES.map(p => {
    const on = p.id === active;
    return `<a class="nav-link${on ? ' active' : ''}" href="${p.href}"${on ? ' aria-current="page"' : ''}>${p.label}</a>`;
  }).join('');
  return `<nav class="site-header" aria-label="Primary navigation"><a class="brand" href="/" aria-label="Khadeeja Designs home">Khadeeja Designs</a><div class="nav-center">${links}<a class="nav-cta button button--gold" data-button="gold" href="/contact/">Contact</a></div><button class="hamburger" type="button" aria-label="Open navigation menu" aria-expanded="false"><span></span><span></span><span></span></button></nav>`;
}

const ICONS = {
  instagram: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.8.1 3.2.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2zM12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7 1.2.1 1.6.1 4.9.1s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0zm0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9z"/></svg>',
  reddit: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C5.4 0 0 5.4 0 12c0 3.3 1.3 6.3 3.5 8.5l-2.3 2.3c-.4.4-.1 1.2.5 1.2H12c6.6 0 12-5.4 12-12S18.6 0 12 0zm4.4 3.2a2 2 0 1 1-1.9 2.5c-1.1.2-2 1.2-2 2.3 1.8.1 3.4.6 4.7 1.4a2.8 2.8 0 1 1 3.1 4.5c-.1 3.3-3.6 5.9-8 5.9s-7.9-2.6-8-5.9a2.8 2.8 0 1 1 3.1-4.5c1.3-.8 2.9-1.3 4.6-1.4 0-1.7 1.3-3 2.9-3.2.2-.9 1-1.6 1.9-1.6zM8.3 11.6c-.8 0-1.5.8-1.5 1.8s.6 1.4 1.4 1.4 1.4-.4 1.4-1.4-.6-1.8-1.3-1.8zm7.4 0c-.8 0-1.4.8-1.3 1.8 0 1 .6 1.4 1.4 1.4s1.5-.4 1.4-1.4c0-1-.7-1.8-1.5-1.8zM12 15.6c-1 0-1.9 0-2.8.1-.1 0-.2.2-.2.3.5 1.2 1.6 2 3 2s2.5-.8 3-2c0-.1-.1-.3-.2-.3-.9-.1-1.8-.1-2.8-.1z"/></svg>',
  medium: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 5h4.3l3.8 9.2L13.9 5H17v14h-3v-8l-3.1 8H8.8L5.7 11v8H2V5Z"></path><circle cx="20" cy="8" r="2"></circle><circle cx="20" cy="16" r="2"></circle></svg>',
};

function footerBlock() {
  const nav = [['/explore/', 'Explore Designs'], ['/bridal-aari-blouse/', 'Bridal Aari Blouses'], ['/blog/', 'Blog'], ['/about/', 'About'], ['/faq/', 'FAQ'], ['/contact/', 'Contact']]
    .map(([href, label]) => `<a href="${href}">${label}</a>`).join('<span class="footer-separator" aria-hidden="true">·</span>');
  return `<footer><div class="footer-main"><div class="footer-signature"><a class="footer-brand" href="/">Khadeeja Designs</a><p class="footer-tagline">Boutique Aari embroidery, handcrafted in Trichy</p><p class="footer-tagline">${esc(biz.streetAddress)}, Trichy ${esc(biz.postalCode)} · <span data-studio-hours-static>${esc(config.studioHours)}</span></p></div><nav class="footer-nav" aria-label="Footer navigation">${nav}</nav><nav class="footer-social" aria-label="Social and community links"><a href="https://instagram.com/khadeeja.designs" target="_blank" rel="noopener noreferrer" aria-label="Instagram profile of Khadeeja Designs">${ICONS.instagram}<span>Instagram</span></a><a href="https://www.reddit.com/r/AariEmbroidery/" target="_blank" rel="noopener noreferrer" aria-label="Visit the r/AariEmbroidery community">${ICONS.reddit}<span>r/AariEmbroidery</span></a><a href="https://medium.com/@khadeejadesigns" target="_blank" rel="me noopener noreferrer" aria-label="Medium articles by Khadeeja Designs">${ICONS.medium}<span>Medium</span></a></nav></div><div class="footer-bottom"><span class="footer-copy">&copy; Khadeeja Designs. All rights reserved.</span><span class="footer-bottom-separator" aria-hidden="true">·</span><div class="footer-legal"><a href="/policies/">Order &amp; refund policy</a><span class="footer-bottom-separator" aria-hidden="true">·</span><a href="/privacy/">Privacy Policy</a></div></div></footer>`;
}

function testimonialsBlock(list = config.testimonials) {
  if (!Array.isArray(list) || !list.length) return '';
  const slides = list.map((t, i) => `<figure class="testimonials__slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${list.length}" data-rating="${Math.max(1, Math.min(5, Number(t.rating) || 5))}"><blockquote>${esc(t.quote)}</blockquote><figcaption>${t.photo ? `<img src="${esc(t.photo)}" alt="" width="48" height="48" loading="lazy">` : ''}<span>${esc(t.name)}${t.city ? ` · ${esc(t.city)}` : ''}</span></figcaption></figure>`).join('');
  return `<section class="testimonials" aria-labelledby="testimonials-title"><div class="testimonials__heading"><div class="kicker"><div class="kicker-line"></div><span class="kicker-text">Client reviews</span></div><h2 id="testimonials-title">What our clients say</h2></div><div class="testimonials__carousel" role="group" aria-roledescription="carousel" aria-label="Client testimonials"><div class="testimonials__toolbar"><button class="testimonials__button" type="button" aria-label="Previous review">‹</button><span class="testimonials__stars" role="img" aria-label="5 out of 5 stars">★★★★★</span><button class="testimonials__button" type="button" aria-label="Next review">›</button></div><div class="testimonials__viewport"><div class="testimonials__track" aria-live="polite">${slides}</div></div></div></section>`;
}

function orderingStepsBlock() {
  const steps = config.orderingSteps.map((s, i) => `<li><div class="ordering-steps__title"><span class="ordering-steps__number">Step 0${i + 1}</span><h3>${esc(s.title)}</h3></div><p>${esc(s.description)}</p></li>`).join('');
  return `<section class="ordering-steps" aria-labelledby="ordering-steps-title"><div class="ordering-steps__heading"><div class="kicker"><div class="kicker-line"></div><span class="kicker-text">Simple process</span></div><h2 id="ordering-steps-title">How ordering works</h2></div><ol>${steps}</ol><p class="ordering-steps__policy">Full terms: <a href="/policies/">order, advance and refund policy</a>.</p></section>`;
}

/* ------------------------------------------------------------------ product blocks */

const webp = file => file.replace(/\.(?:png|jpe?g)$/i, '.webp');
const variant = (file, suffix) => webp(file).replace(/\.webp$/, `${suffix}.webp`);

function productPrice(p) {
  const price = Number(String(p.newPrice || p.price).replace(/[^\d.]/g, ''));
  const today = new Date().toISOString().slice(0, 10);
  const offer = Boolean(p.originalPrice && /^\d{4}-\d{2}-\d{2}$/.test(p.offerEndsOn || '') && p.offerEndsOn >= today);
  const original = offer ? Number(String(p.originalPrice).replace(/[^\d.]/g, '')) : 0;
  return { price, offer, original };
}

function galleryBlock(id, p) {
  const images = p.images.map(file => ({
    src: `./${webp(file)}`,
    srcset: `./${variant(file, '_480w')} 480w, ./${variant(file, '_720w')} 720w, ./${variant(file, '_960w')} 960w, ./${webp(file)} 1254w`,
    fallback: `./${file}`,
    label: /back/i.test(file) ? 'back view' : 'front view',
  }));
  const main = images[0];
  const thumbs = images.length < 2 ? '' : `<div class="product-gallery__thumbnails" role="group" aria-label="Design images">${images.map((img, i) => `<button class="product-gallery__thumbnail${i === 0 ? ' is-active' : ''}" type="button" aria-label="Show ${img.label}" aria-controls="design-image-${id}" aria-pressed="${i === 0}" data-src="${img.src}" data-srcset="${img.srcset}" data-alt="${esc(`${p.imageAlt}, ${img.label}`)}"><img src="./${variant(p.images[i], '_480w')}" alt="" width="96" height="96" loading="lazy"></button>`).join('')}</div>`;
  return `<div class="photo"><img id="design-image-${id}" loading="eager" src="${main.src}" srcset="${main.srcset}" sizes="(max-width: 900px) calc(100vw - 40px), 48vw" data-fallback-src="${main.fallback}" alt="${esc(`${p.imageAlt}, ${main.label}`)}" width="1254" height="1254" decoding="async" fetchpriority="high" onerror="if(this.dataset.fallbackSrc){this.removeAttribute('srcset');this.src=this.dataset.fallbackSrc;delete this.dataset.fallbackSrc}">${thumbs}</div>`;
}

function priceBlock(p) {
  const { price, offer, original } = productPrice(p);
  return `<div class="price" aria-label="Embroidery from ${rupees(price)}">${offer ? `<span class="old">${rupees(original)}</span>` : ''}${rupees(price)}</div><p class="offer-note"><strong>Hand Aari work on the blouse you send us.</strong> The price covers the embroidery. The blouse and courier are not included.</p>`;
}

function pricingScopeBlock(p) {
  return `<details class="product-accordion product-accordion--price-scope"><summary>How delivery works</summary><div class="pricing-scope content-panel"><ul><li><strong>Garment:</strong> ${p.customerSuppliesBlouse ? 'You supply the blouse or garment. We embroider it.' : 'The studio supplies the base fabric or blouse.'}</li><li><strong>Delivery:</strong> ${esc(p.shippingNote)}</li><li><strong>Courier:</strong> ${esc(config.policy.shipping)}</li></ul><p>See the full <a href="/policies/">order and refund policy</a>.</p></div></details>`;
}

function howItWorksBlock() {
  return `<ol class="how-it-works" aria-label="How it works"><li><strong>1. Post your blouse</strong><span>Courier it to our Trichy studio after you confirm the quote.</span></li><li><strong>2. We hand-embroider it</strong><span>About ${esc(config.policy.turnaround)} at the frame.</span></li><li><strong>3. Tracked delivery back</strong><span>Anywhere in India, with a tracking link.</span></li></ol>`;
}

function faqBlock(p) {
  const name = p.title.replace(/\s+Blouse$/i, '');
  const items = p.faqs.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join('');
  return `<section class="product-faqs" aria-labelledby="product-faqs-title"><h2 id="product-faqs-title">${esc(name)} FAQs</h2><div class="faq">${items}</div></section>`;
}

function relatedBlock(p) {
  const guide = p.category === 'bridal'
    ? ['/blog/how-to-choose-aari-embroidery-bridal-blouse/', 'How to choose an Aari embroidery style for your wedding blouse']
    : ['/blog/choose-aari-work-wedding-saree-colour/', 'How to choose Aari work colours for your wedding saree'];
  return `<section class="related-guide" aria-label="Related guide"><span class="related-guide-label">From our blog</span><a class="related-guide-link" href="${guide[0]}"><span>Related guide</span><strong>${guide[1]}</strong></a></section>`;
}

function productSchema(id, p) {
  const { price, offer } = productPrice(p);
  const url = `${SITE}/explore/designs/${id}/`;
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${p.title.replace(/\s+Blouse$/i, '')} – Aari embroidery on your blouse`,
    description: `Hand Aari embroidery service: we embroider this design on the blouse you send us. ${p.description}`,
    image: p.images.map(file => `${SITE}/explore/designs/${id}/${webp(file)}`),
    sku: id,
    category: p.specs.category,
    brand: { '@type': 'Brand', name: 'Khadeeja Designs' },
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'INR',
      price,
      ...(offer ? { priceValidUntil: p.offerEndsOn } : {}),
      availability: 'https://schema.org/MadeToOrder',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': biz.id },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'IN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
        merchantReturnLink: `${SITE}/policies/`,
      },
    },
  };
}

function syncProduct(html, id, file) {
  const p = products[id];
  html = setBlock(html, 'product-gallery', galleryBlock(id, p), { file, fallback: /<div class="photo">[\s\S]*?<\/div>(?=<div><span class="category">)/ });
  html = setBlock(html, 'product-category', `<span class="category">${esc(p.specs.category)} · Hand Aari on your blouse</span>`, { file, fallback: /<span class="category">[^<]*<\/span>/ });
  html = setBlock(html, 'product-price', priceBlock(p), { file, fallback: /<div class="price"[^>]*>[\s\S]*?<\/div>/ });
  html = setBlock(html, 'product-pricing-scope', pricingScopeBlock(p), {
    file, insert: (h, b) => h.replace(/(<details class="product-accordion product-accordion--price-excludes[^"]*">[\s\S]*?<\/details>)/, (_, d) => `${d.replace(' product-accordion--pricing', '')}${b}`),
  });
  html = setBlock(html, 'product-how-it-works', howItWorksBlock(), { file, insert: (h, b) => h.replace('<!-- product-contact-actions:end -->', `<!-- product-contact-actions:end -->${b}`) });
  html = setBlock(html, 'product-faqs', faqBlock(p), { file, fallback: /<section><h2>[^<]*FAQs<\/h2>[\s\S]*?<\/section>/ });
  html = setBlock(html, 'testimonials', testimonialsBlock(), { file, insert: (h, b) => h.replace(/(<!-- product-faqs:start -->)/, `${b}$1`) });
  html = setBlock(html, 'product-related', relatedBlock(p), { file, insert: (h, b) => h.replace(/<\/main>/, `${b}</main>`) });
  html = setBlock(html, 'product-schema', jsonLd(productSchema(id, p), 'data-product'), {
    file, fallback: /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"Product"[\s\S]*?<\/script>/,
  });
  return html;
}

/* ------------------------------------------------------------------ price guide table */

/** Rupee bands for the price guide, generated from product.json so they always match listed prices. */
function priceTableBlock() {
  const bands = [
    ['Light / accent work', 'Neckline and sleeve borders, scattered motifs', p => p.price < 3000],
    ['Medium / balanced work', 'Several coordinated sections, beads and tassels', p => p.price >= 3000 && p.price < 6000],
    ['Heavy / bridal work', 'Dense motifs over most of the blouse, layered embellishment', p => p.price >= 6000],
  ];
  const rows = bands.map(([name, scope, test]) => {
    const list = productIds.map(id => ({ id, ...products[id] })).filter(test).sort((a, b) => a.price - b.price);
    if (!list.length) return '';
    const lo = list[0].price; const hi = list[list.length - 1].price;
    const range = lo === hi ? `from ${rupees(lo)}` : `${rupees(lo)}–${rupees(hi)}`;
    const links = list.map(p => `<a href="/explore/designs/${p.id}/">${esc(p.title.replace(/\s+Blouse$/i, ''))}</a> (${rupees(p.price)})`).join(', ');
    return `<tr><th scope="row">${name}</th><td>${range}</td><td>${scope}</td><td>${links}</td></tr>`;
  }).join('');
  return `<div class="price-table-wrap"><table class="price-table"><caption>Khadeeja Designs Aari embroidery prices (embroidery on your blouse; blouse and courier not included)</caption><thead><tr><th scope="col">Work level</th><th scope="col">Price</th><th scope="col">Typical coverage</th><th scope="col">Our designs</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

/* ------------------------------------------------------------------ FAQ schema */

const plain = fragment => fragment.replace(/<\/?(?:a|strong|em|span|b|i|code)\b[^>]*>/gi, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();

/** FAQPage JSON-LD is rebuilt from the visible answers so the two can never disagree. */
function syncFaqSchema(html, file) {
  const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'));
  const items = [...main.matchAll(/<details\b[^>]*>\s*<summary\b[^>]*>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)];
  if (!items.length) throw new Error(`${file}: FAQPage schema present but no visible FAQ items found`);
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(([, q, a]) => ({ '@type': 'Question', name: plain(q), acceptedAnswer: { '@type': 'Answer', text: plain(a) } })),
  };
  return setBlock(html, 'faq-schema', jsonLd(schema, 'data-faq'), {
    file, fallback: /<script type="application\/ld\+json">\s*\{\s*"@context":\s*"https:\/\/schema\.org",\s*"@type":\s*"FAQPage"[\s\S]*?<\/script>/,
  });
}

/* ------------------------------------------------------------------ per page */

function ogImageFor(rel) {
  const product = rel.match(/^explore\/designs\/([a-z0-9-]+)\/index\.html$/);
  if (product && fs.existsSync(path.join(root, 'explore/designs', product[1], 'og.jpg'))) return `${SITE}/explore/designs/${product[1]}/og.jpg`;
  const blog = rel.match(/^blog\/([a-z0-9-]+)\/index\.html$/);
  if (blog && fs.existsSync(path.join(root, 'blog', blog[1], 'og.jpg'))) return `${SITE}/blog/${blog[1]}/og.jpg`;
  return `${SITE}/images/og/default.jpg`;
}

let changed = 0;
for (const abs of walk(root)) {
  const rel = path.relative(root, abs).split(path.sep).join('/');
  let html = fs.readFileSync(abs, 'utf8');
  const before = html;
  const active = (html.match(/initPage\('([a-z]*)'\)/) || [])[1] || '';

  // Analytics + business entity live in one head block; drop the old per-page Clarity snippet.
  html = html.replace(/<script>\s*window\.addEventListener\("load", function \(\) \{\s*function loadClarity\(\)[\s\S]*?<\/script>\s*/, '');
  const og = ogImageFor(rel);
  const hasOg = /<meta property="og:image" content="[^"]*">/.test(html);
  html = html.replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${og}">`)
    .replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${og}">`);
  html = setBlock(html, 'site-head', headBlock(hasOg), { file: rel, insert: (h, b) => h.replace(/(<meta charset="UTF-8">)/i, `$1\n${b}`) });

  html = setBlock(html, 'site-footer', footerBlock(), { file: rel, fallback: /<footer\b[\s\S]*?<\/footer>/ });
  html = setBlock(html, 'site-nav', navBlock(active), { file: rel, fallback: /<nav\b[^>]*>[\s\S]*?<\/nav>/ });

  if (/<!-- testimonials:start -->/.test(html)) html = setBlock(html, 'testimonials', testimonialsBlock(), { file: rel });
  if (/<!-- ordering-steps:start -->/.test(html)) html = setBlock(html, 'ordering-steps', orderingStepsBlock(), { file: rel });

  if (/<!-- price-table:start -->/.test(html)) html = setBlock(html, 'price-table', priceTableBlock(), { file: rel });
  if (/"@type":\s*"FAQPage"/.test(html)) html = syncFaqSchema(html, rel);

  const productId = (rel.match(/^explore\/designs\/([a-z0-9-]+)\/index\.html$/) || [])[1];
  if (productId && products[productId]) html = syncProduct(html, productId, rel);

  if (html !== before) { fs.writeFileSync(abs, html); changed += 1; }
}
console.log(`sync-site: ${changed} page(s) updated.`);
