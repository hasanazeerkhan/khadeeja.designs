const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const metaPath = path.join(root, 'seo-meta.json');
const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(/([^\s=/>]+)\s*=\s*(["'])(.*?)\2/gs)) {
    attributes[match[1].toLowerCase()] = match[3];
  }
  return attributes;
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function replaceMeta(head, predicate, content) {
  const escapedContent = escapeAttribute(content);
  let replaced = false;
  const updated = head.replace(/<meta\b[^>]*>/gi, tag => {
    if (!predicate(parseAttributes(tag))) return tag;
    if (replaced) return '';
    replaced = true;
    if (/\bcontent\s*=\s*(["']).*?\1/is.test(tag)) {
      return tag.replace(/\bcontent\s*=\s*(["']).*?\1/is, `content="${escapedContent}"`);
    }
    return tag.replace(/\s*\/?>$/, ` content="${escapedContent}">`);
  });
  return replaced ? updated : updated.replace(/<\/head>/i, `  <meta content="${escapedContent}">\n</head>`);
}

function setMeta(head, attribute, value, content) {
  const predicate = attrs => attrs[attribute] === value;
  let updated = replaceMeta(head, predicate, content);
  if (!new RegExp(`<meta\\b(?=[^>]*\\b${attribute}\\s*=\\s*["']${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'])`, 'i').test(updated)) {
    updated = updated.replace(/<meta content="([^"]*)">(?=\s*<\/head>)/i, `<meta ${attribute}="${value}" content="$1">`);
  }
  return updated;
}

function setLink(head, rel, href) {
  let replaced = false;
  const escapedHref = escapeAttribute(href);
  const updated = head.replace(/<link\b[^>]*>/gi, tag => {
    const attrs = parseAttributes(tag);
    if (attrs.rel !== rel) return tag;
    if (replaced) return '';
    replaced = true;
    if (/\bhref\s*=\s*(["']).*?\1/is.test(tag)) {
      return tag.replace(/\bhref\s*=\s*(["']).*?\1/is, `href="${escapedHref}"`);
    }
    return tag.replace(/\s*\/?>$/, ` href="${escapedHref}">`);
  });
  return replaced
    ? updated
    : updated.replace(/<\/head>/i, `  <link rel="${rel}" href="${escapedHref}">\n</head>`);
}

function setTitle(head, title) {
  if (/<title\b[^>]*>[\s\S]*?<\/title>/i.test(head)) {
    return head.replace(/(<title\b[^>]*>)[\s\S]*?(<\/title>)/i, `$1${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}$2`);
  }
  return head.replace(/<\/head>/i, `  <title>${title}</title>\n</head>`);
}

function replaceJsonLd(head, schemaType, data) {
  let replaced = false;
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const updated = head.replace(
    /<script\b(?=[^>]*\btype\s*=\s*(["'])application\/ld\+json\1)[^>]*>([\s\S]*?)<\/script>/gi,
    (tag, _quote, content) => {
      let existing;
      try {
        existing = JSON.parse(content);
      } catch (error) {
        throw new Error(`Invalid existing JSON-LD: ${error.message}`);
      }
      if (existing['@type'] !== schemaType) return tag;
      if (replaced) return '';
      replaced = true;
      return tag.replace(content, json);
    }
  );
  return replaced
    ? updated
    : updated.replace(/<\/head>/i, `  <script type="application/ld+json">${json}</script>\n</head>`);
}

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)));
}

function formatPrice(value) {
  const match = String(value ?? '').match(/^\s*(?:INR\s*)?([\d,]+(?:\.\d{1,2})?)\s*$/i);
  if (!match) throw new Error(`Invalid product price: ${value}`);
  const amount = Number(match[1].replace(/,/g, ''));
  if (!Number.isFinite(amount)) throw new Error(`Invalid product price: ${value}`);
  return `₹${amount.toLocaleString('en-IN')}`;
}

function productMetadata(pagePath) {
  const productPath = path.join(root, path.dirname(pagePath), 'product.json');
  const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));
  const name = String(product.title || product.tag || '')
    .replace(/\s+blouse\s*$/i, '')
    .trim();
  if (!name) throw new Error(`Product name missing in ${path.relative(root, productPath)}`);
  const title = product.seoTitle || `${name} Aari Work Blouse | Khadeeja Designs`;
  const description = product.seoDescription || `${name} Aari work blouse from Khadeeja Designs, Trichy. Listed at ${formatPrice(product.newPrice)}. Customisation on request. Delivery across India.`;
  const imageName = String(product.images?.[0] || '').replace(/\.(?:png|jpe?g|webp)$/i, '.webp');
  const imagePath = path.join(root, path.dirname(pagePath), imageName);
  const ogImage = imageName && fs.existsSync(imagePath)
    ? `https://khadeejadesigns.in/explore/designs/${product.id}/${encodeURIComponent(imageName)}`
    : '';
  return { title, description, ogImage, product };
}

function canonicalUrl(pagePath) {
  const normalizedPath = pagePath.replace(/\\/g, '/');
  if (normalizedPath === 'index.html') return 'https://khadeejadesigns.in/';
  if (normalizedPath.endsWith('/index.html')) {
    return `https://khadeejadesigns.in/${normalizedPath.slice(0, -'index.html'.length)}`;
  }
  return `https://khadeejadesigns.in/${normalizedPath}`;
}

function stripMarkup(value) {
  return decodeEntities(String(value).replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function faqSchema(html) {
  const questions = [];
  const questionPattern = /<div class="faq-item">\s*<button\b[^>]*>[\s\S]*?<span class="faq-q">([\s\S]*?)<\/span>[\s\S]*?<\/button>\s*<div class="faq-a">([\s\S]*?)<\/div>\s*<\/div>/gi;
  for (const match of html.matchAll(questionPattern)) {
    questions.push({
      '@type': 'Question',
      name: stripMarkup(match[1]),
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripMarkup(match[2]),
      },
    });
  }
  if (!questions.length) throw new Error('FAQ page has no static question and answer pairs.');
  return { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: questions };
}

function productSchema(pagePath, product) {
  const price = Number(product.price);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error(`Invalid numeric product price for ${pagePath}`);
  }
  const image = String(product.images?.[0] || '').replace(/\.(?:png|jpe?g)$/i, '.webp');
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: `https://khadeejadesigns.in/explore/designs/${product.id}/${encodeURIComponent(image)}`,
    description: product.description || product.summary,
    brand: { '@type': 'Brand', name: 'Khadeeja Designs' },
    offers: {
      '@type': 'Offer',
      url: canonicalUrl(pagePath),
      priceCurrency: 'INR',
      price,
      availability: 'https://schema.org/InStock',
      seller: { '@type': 'Organization', name: 'Khadeeja Designs' },
    },
  };
}

function productStoryHtml(product) {
  if (!product.seoCopy) throw new Error(`Product copy missing for ${product.id}`);
  if (product.seoCopy.trim().split(/\s+/).length < 150) {
    throw new Error(`Product copy must contain at least 150 words for ${product.id}`);
  }
  const name = escapeAttribute(product.title);
  const copy = escapeAttribute(product.seoCopy);
  return `<section class="product-story" aria-labelledby="product-story-title"><h2 id="product-story-title">${name}: Materials, Styling and Timing</h2><p class="copy">${copy}</p></section>`;
}

function syncProductStory(html, product) {
  const story = productStoryHtml(product);
  const storyPattern = /<section class="product-story" aria-labelledby="product-story-title">[\s\S]*?<\/section>/i;
  if (storyPattern.test(html)) return html.replace(storyPattern, story);
  const faqHeading = /<section><h2>[^<]* FAQs<\/h2>/i;
  if (!faqHeading.test(html)) throw new Error(`Product FAQ section missing for ${product.id}`);
  return html.replace(faqHeading, `${story}$&`);
}

const productPrices = Object.entries(metadata)
  .filter(([, value]) => value.source === 'product.json')
  .map(([pagePath]) => {
    const productPath = path.join(root, path.dirname(pagePath), 'product.json');
    const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));
    return Number(String(product.newPrice).replace(/[^\d.]/g, ''));
  });
if (!productPrices.length || productPrices.some(price => !Number.isFinite(price))) {
  throw new Error('Unable to calculate the product price range from product.json files.');
}
const minPrice = `₹${Math.min(...productPrices).toLocaleString('en-IN')}`;
const maxPrice = `₹${Math.max(...productPrices).toLocaleString('en-IN')}`;

for (const [pagePath, configured] of Object.entries(metadata)) {
  const absolutePath = path.join(root, pagePath);
  if (!fs.existsSync(absolutePath)) throw new Error(`Page not found: ${pagePath}`);
  let html = fs.readFileSync(absolutePath, 'utf8');
  const headMatch = html.match(/<head\b[\s\S]*?<\/head>/i);
  if (!headMatch) throw new Error(`Head not found: ${pagePath}`);

  const pageMeta = configured.source === 'product.json'
    ? productMetadata(pagePath)
    : {
        title: configured.title,
        description: configured.description
          .replace('{{minPrice}}', minPrice)
          .replace('{{maxPrice}}', maxPrice)
      };
  let head = headMatch[0].replace(/<meta\b[^>]*>/gi, tag =>
    /\bname\s*=\s*(["'])keywords\1/i.test(tag) ? '' : tag
  );
  head = setTitle(head, pageMeta.title);
  head = setMeta(head, 'name', 'description', pageMeta.description);
  const pageCanonical = canonicalUrl(pagePath);
  const ogImage = configured.ogImage || pageMeta.ogImage ||
    'https://khadeejadesigns.in/explore/designs/bridal-royal-zardosi/khadeeja_designs_bridal_royal_zardosi_blouse_front.webp';
  const defaultOgType = configured.source === 'product.json'
    ? 'product'
    : pagePath.startsWith('blog/') && pagePath !== 'blog/index.html'
      ? 'article'
      : 'website';
  head = setLink(head, 'canonical', pageCanonical);
  head = setMeta(head, 'name', 'robots', configured.robots || 'index,follow');
  head = setMeta(head, 'property', 'og:type', configured.ogType || defaultOgType);
  head = setMeta(head, 'property', 'og:site_name', 'Khadeeja Designs');
  head = setMeta(head, 'property', 'og:url', pageCanonical);
  head = setMeta(head, 'property', 'og:title', pageMeta.title);
  head = setMeta(head, 'property', 'og:description', pageMeta.description);
  head = setMeta(head, 'property', 'og:image', ogImage);
  head = setMeta(head, 'name', 'twitter:card', 'summary_large_image');
  head = setMeta(head, 'name', 'twitter:title', pageMeta.title);
  head = setMeta(head, 'name', 'twitter:description', pageMeta.description);
  head = setMeta(head, 'name', 'twitter:image', ogImage);

  if (configured.source === 'product.json') {
    head = replaceJsonLd(head, 'Product', productSchema(pagePath, pageMeta.product));
    html = syncProductStory(html, pageMeta.product);
  }
  if (pagePath === 'faq/index.html') {
    head = replaceJsonLd(head, 'FAQPage', faqSchema(html));
  }
  if (pagePath === 'index.html') {
    const localBusiness = [...head.matchAll(/<script\b(?=[^>]*\btype\s*=\s*(["'])application\/ld\+json\1)[^>]*>([\s\S]*?)<\/script>/gi)]
      .map(match => JSON.parse(match[2]))
      .find(schema => schema['@type'] === 'LocalBusiness' || schema['@type'] === 'ClothingStore');
    if (!localBusiness) throw new Error('Homepage LocalBusiness schema is missing.');
    localBusiness['@type'] = 'ClothingStore';
    localBusiness.logo = 'https://khadeejadesigns.in/apple-touch-icon.png';
    localBusiness.address.addressLocality = 'Tiruchirappalli';
    localBusiness.address.addressRegion = 'Tamil Nadu';
    head = replaceJsonLd(head, 'LocalBusiness', localBusiness);
  }

  html = html.replace(/(\d{4}):(\d{2})- (\d{2})/g, '$1-$2-$3');
  fs.writeFileSync(absolutePath, html.replace(headMatch[0], head), 'utf8');
}

console.log(`Synced metadata for ${Object.keys(metadata).length} pages.`);
