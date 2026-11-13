const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const metadata = JSON.parse(fs.readFileSync(path.join(root, 'seo-meta.json'), 'utf8'));
const failures = [];

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

function parseAttributes(tag) {
  const attributes = {};
  for (const match of tag.matchAll(/([^\s=/>]+)\s*=\s*(["'])(.*?)\2/gs)) {
    attributes[match[1].toLowerCase()] = decodeEntities(match[3]);
  }
  return attributes;
}

function findMeta(head, attribute, value) {
  const matches = [];
  for (const tag of head.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = parseAttributes(tag[0]);
    if (attrs[attribute] === value) matches.push(attrs.content ?? null);
  }
  if (matches.length !== 1) {
    failures.push(`${attribute}="${value}" should appear once; found ${matches.length}`);
  }
  return matches[0] ?? null;
}

function parsePrice(value) {
  const match = String(value ?? '').match(/^\s*(?:INR\s*)?([\d,]+(?:\.\d{1,2})?)\s*$/i);
  if (!match) return null;
  const price = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(price) ? price : null;
}

function canonicalFor(pagePath) {
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

function parseSchemas(head, pagePath) {
  const schemas = [];
  for (const match of head.matchAll(/<script\b(?=[^>]*\btype\s*=\s*(["'])application\/ld\+json\1)[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      schemas.push(JSON.parse(match[2]));
    } catch (error) {
      failures.push(`${pagePath}: invalid JSON-LD (${error.message})`);
    }
  }
  return schemas;
}

function findSchema(schemas, type) {
  const stack = [...schemas];
  while (stack.length) {
    const schema = stack.shift();
    if (!schema) continue;
    if (schema['@graph']) {
      stack.push(...(Array.isArray(schema['@graph']) ? schema['@graph'] : [schema['@graph']]));
    }
    if (schema['@type'] === type || (Array.isArray(schema['@type']) && schema['@type'].includes(type))) {
      return schema;
    }
  }
  return null;
}

function faqPairs(html) {
  const pairs = [];
  const questionPattern = /<div class="faq-item">\s*<button\b[^>]*>[\s\S]*?<span class="faq-q">([\s\S]*?)<\/span>[\s\S]*?<\/button>\s*<div class="faq-a">([\s\S]*?)<\/div>\s*<\/div>/gi;
  for (const match of html.matchAll(questionPattern)) {
    pairs.push([stripMarkup(match[1]), stripMarkup(match[2])]);
  }
  return pairs;
}

const pageTitles = new Map();
const productDescriptions = new Set();
const productStories = new Set();
const sitemapPages = [];

for (const [pagePath, configured] of Object.entries(metadata)) {
  const relativePath = pagePath.replace(/\\/g, '/');
  const absolutePath = path.join(root, pagePath);
  if (!fs.existsSync(absolutePath)) {
    failures.push(`${relativePath}: page is missing`);
    continue;
  }

  const html = fs.readFileSync(absolutePath, 'utf8');
  const head = html.match(/<head\b[\s\S]*?<\/head>/i)?.[0];
  if (!head) {
    failures.push(`${relativePath}: head is missing`);
    continue;
  }

  const titleMatch = head.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const title = titleMatch ? decodeEntities(titleMatch[1].trim()) : null;
  const description = findMeta(head, 'name', 'description');
  const ogTitle = findMeta(head, 'property', 'og:title');
  const ogDescription = findMeta(head, 'property', 'og:description');
  const ogType = findMeta(head, 'property', 'og:type');
  const ogSiteName = findMeta(head, 'property', 'og:site_name');
  const ogUrl = findMeta(head, 'property', 'og:url');
  const ogImage = findMeta(head, 'property', 'og:image');
  const twitterTitle = findMeta(head, 'name', 'twitter:title');
  const twitterDescription = findMeta(head, 'name', 'twitter:description');
  const twitterCard = findMeta(head, 'name', 'twitter:card');
  const twitterImage = findMeta(head, 'name', 'twitter:image');
  const expectedCanonical = canonicalFor(pagePath);
  const canonicalTags = [...head.matchAll(/<link\b[^>]*>/gi)]
    .map(match => parseAttributes(match[0]))
    .filter(attrs => attrs.rel === 'canonical');
  const robots = findMeta(head, 'name', 'robots');

  if (!title) failures.push(`${relativePath}: title is missing`);
  else {
    if (title.length < 53 || title.length > 59) failures.push(`${relativePath}: title is ${title.length} characters (expected 53-59)`);
    if (!title.endsWith('| Khadeeja Designs')) failures.push(`${relativePath}: title does not use the site suffix`);
    if (pageTitles.has(title)) failures.push(`${relativePath}: duplicate title also used by ${pageTitles.get(title)}`);
    else pageTitles.set(title, relativePath);
  }
  if (!description) failures.push(`${relativePath}: description is missing`);
  else if (description.length < 140 || description.length > 152) {
    failures.push(`${relativePath}: description is ${description.length} characters (expected 140-152)`);
  }

  if (ogTitle !== title) failures.push(`${relativePath}: og:title differs from title`);
  if (twitterTitle !== title) failures.push(`${relativePath}: twitter:title differs from title`);
  if (ogDescription !== description) failures.push(`${relativePath}: og:description differs from description`);
  if (twitterDescription !== description) failures.push(`${relativePath}: twitter:description differs from description`);
  if (!ogType) failures.push(`${relativePath}: og:type is missing`);
  if (ogSiteName !== 'Khadeeja Designs') failures.push(`${relativePath}: og:site_name is missing or incorrect`);
  if (ogUrl !== expectedCanonical) failures.push(`${relativePath}: og:url differs from canonical`);
  if (!ogImage || !/^https:\/\//i.test(ogImage)) failures.push(`${relativePath}: og:image is missing or not absolute HTTPS`);
  if (twitterCard !== 'summary_large_image') failures.push(`${relativePath}: twitter:card should be summary_large_image`);
  if (twitterImage !== ogImage) failures.push(`${relativePath}: twitter:image differs from og:image`);
  if (canonicalTags.length !== 1 || canonicalTags[0].href !== expectedCanonical) {
    failures.push(`${relativePath}: expected one self-referencing canonical (${expectedCanonical})`);
  }
  const expectedRobots = configured.robots || 'index,follow';
  if (robots !== expectedRobots) failures.push(`${relativePath}: robots is "${robots}", expected "${expectedRobots}"`);
  if (expectedRobots === 'index,follow') sitemapPages.push(expectedCanonical);
  if (/<meta\b(?=[^>]*\bname\s*=\s*(["'])keywords\1)[^>]*>/i.test(head)) {
    failures.push(`${relativePath}: keywords meta tag remains`);
  }

  const schemas = parseSchemas(head, relativePath);
  if (!schemas.length) failures.push(`${relativePath}: JSON-LD is missing`);
  const breadcrumb = findSchema(schemas, 'BreadcrumbList');
  if (!breadcrumb) failures.push(`${relativePath}: BreadcrumbList schema is missing`);
  else {
    const items = breadcrumb.itemListElement || [];
    if (!items.length || items[items.length - 1].item !== expectedCanonical) {
      failures.push(`${relativePath}: BreadcrumbList does not end at the canonical URL`);
    }
    if (items.some((item, index) => item.position !== index + 1)) {
      failures.push(`${relativePath}: BreadcrumbList positions are not sequential`);
    }
    const expectedItems = relativePath === 'index.html'
      ? ['https://khadeejadesigns.in/']
      : relativePath.startsWith('blog/') && relativePath !== 'blog/index.html'
        ? ['https://khadeejadesigns.in/', 'https://khadeejadesigns.in/blog/', expectedCanonical]
        : relativePath.startsWith('explore/designs/')
          ? ['https://khadeejadesigns.in/', 'https://khadeejadesigns.in/explore/', expectedCanonical]
          : relativePath === 'blog/index.html'
            ? ['https://khadeejadesigns.in/', expectedCanonical]
            : relativePath === 'explore/index.html'
              ? ['https://khadeejadesigns.in/', expectedCanonical]
              : ['https://khadeejadesigns.in/', expectedCanonical];
    if (items.length !== expectedItems.length ||
        items.some((item, index) => item.item !== expectedItems[index])) {
      failures.push(`${relativePath}: BreadcrumbList does not match the page URL hierarchy`);
    }
  }

  if (pagePath === 'index.html') {
    const store = findSchema(schemas, 'ClothingStore') || findSchema(schemas, 'LocalBusiness');
    if (!store || !store.logo || !store.address || !store.priceRange) {
      failures.push(`${relativePath}: ClothingStore/LocalBusiness schema needs logo, address and priceRange`);
    }
  }

  if (pagePath === 'faq/index.html') {
    const faq = findSchema(schemas, 'FAQPage');
    const visiblePairs = faqPairs(html);
    if (!faq) failures.push(`${relativePath}: FAQPage schema is missing`);
    else {
      const schemaPairs = (faq.mainEntity || []).map(question => [
        question.name,
        question.acceptedAnswer?.text,
      ]);
      if (schemaPairs.length !== visiblePairs.length ||
          schemaPairs.some((pair, index) => pair[0] !== visiblePairs[index]?.[0] || pair[1] !== visiblePairs[index]?.[1])) {
        failures.push(`${relativePath}: FAQPage schema does not match all visible questions and answers`);
      }
    }
  }

  if (/^blog\/[^/]+\/index\.html$/.test(relativePath) && relativePath !== 'blog/index.html') {
    const article = findSchema(schemas, 'Article') || findSchema(schemas, 'BlogPosting');
    if (!article) failures.push(`${relativePath}: Article/BlogPosting schema is missing`);
    else {
      for (const field of ['headline', 'description', 'image', 'author', 'publisher']) {
        if (!article[field]) failures.push(`${relativePath}: Article schema ${field} is missing`);
      }
      for (const field of ['datePublished', 'dateModified']) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(article[field] || '')) {
          failures.push(`${relativePath}: Article schema ${field} is not an ISO date`);
        }
      }
    }
  }

  if (configured.source === 'product.json') {
    const productPath = path.join(root, path.dirname(pagePath), 'product.json');
    if (!fs.existsSync(productPath)) {
      failures.push(`${relativePath}: product.json is missing`);
      continue;
    }
    const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));
    const price = parsePrice(product.newPrice);
    if (price === null) {
      failures.push(`${relativePath}: product.json newPrice is invalid`);
      continue;
    }
    if (description !== product.seoDescription) {
      failures.push(`${relativePath}: description differs from product.json seoDescription`);
    }
    if (productDescriptions.has(description)) failures.push(`${relativePath}: product description is duplicated`);
    productDescriptions.add(description);
    if (title !== product.seoTitle) {
      failures.push(`${relativePath}: title differs from product.json seoTitle`);
    }
    const schema = findSchema(schemas, 'Product');
    const numericPrice = Number(String(product.newPrice).replace(/[^\d.]/g, ''));
    if (!schema || !schema.image || !schema.description || schema.brand?.name !== 'Khadeeja Designs' ||
        typeof schema.offers?.price !== 'number' || schema.offers.price !== numericPrice ||
        schema.offers.priceCurrency !== 'INR' ||
        schema.offers.availability !== 'https://schema.org/InStock') {
      failures.push(`${relativePath}: Product schema is missing valid product or Offer data`);
    }
    const story = html.match(/<section class="product-story" aria-labelledby="product-story-title">([\s\S]*?)<\/section>/i);
    const storyText = story ? stripMarkup(story[1]) : '';
    const storyWords = storyText.split(/\s+/).filter(Boolean).length;
    if (storyWords < 150) failures.push(`${relativePath}: static product copy has ${storyWords} words (minimum 150)`);
    if (productStories.has(storyText)) failures.push(`${relativePath}: static product copy is duplicated`);
    productStories.add(storyText);
    if (!/Aari|Zardosi/i.test(storyText) ||
        !/bead|pearl|stone|thread/i.test(storyText) ||
        !/saree/i.test(storyText) ||
        !storyText.includes(`₹${numericPrice.toLocaleString('en-IN')}`) ||
        !/timeline|turnaround|completion period|production window|crafting duration|schedule/i.test(storyText)) {
      failures.push(`${relativePath}: static product copy omits technique, materials, pairing, price or timeline details`);
    }
    if (!/<h1\b[^>]*>[\s\S]*?<\/h1>/i.test(html)) failures.push(`${relativePath}: static product h1 is missing`);
    const bodyPrice = html.match(/<div class="price"[^>]*>([\s\S]*?)<\/div>/i);
    if (!bodyPrice || parsePrice(stripMarkup(bodyPrice[1]).replace(/^₹/, '')) !== numericPrice) {
      failures.push(`${relativePath}: visible product price differs from product.json`);
    }
    for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
      if (!/\balt\s*=\s*(["'])\s*[^"']+\1/i.test(image[0])) {
        failures.push(`${relativePath}: product image is missing descriptive alt text`);
      }
    }
  }
}

for (const pagePath of Object.keys(metadata)) {
  if (!fs.existsSync(path.join(root, pagePath))) failures.push(`${pagePath}: configured page is missing`);
}

const sitemapPath = path.join(root, 'sitemap.xml');
const sitemap = fs.existsSync(sitemapPath) ? fs.readFileSync(sitemapPath, 'utf8') : '';
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decodeEntities(match[1]));
const sitemapSet = new Set(sitemapUrls);
if (sitemapUrls.length !== sitemapSet.size) failures.push('sitemap.xml: duplicate URLs found');
for (const page of sitemapPages) {
  if (!sitemapSet.has(page)) failures.push(`sitemap.xml: indexable page is missing (${page})`);
}
for (const url of sitemapUrls) {
  if (!sitemapPages.includes(url)) failures.push(`sitemap.xml: contains a non-indexable or unknown page (${url})`);
}

const robotsPath = path.join(root, 'robots.txt');
const robotsFile = fs.existsSync(robotsPath) ? fs.readFileSync(robotsPath, 'utf8') : '';
if (!/^User-agent:\s*\*\s*$/mi.test(robotsFile)) failures.push('robots.txt: wildcard User-agent rule is missing');
if (!/^Allow:\s*\/\s*$/mi.test(robotsFile)) failures.push('robots.txt: Allow: / is missing');
if (!/^Sitemap:\s*https:\/\/khadeejadesigns\.in\/sitemap\.xml\s*$/mi.test(robotsFile)) {
  failures.push('robots.txt: canonical sitemap directive is missing');
}

const exploreHtml = fs.readFileSync(path.join(root, 'explore', 'index.html'), 'utf8');
if (/Showing the saved catalogue|JavaScript is off/i.test(exploreHtml)) {
  failures.push('explore/index.html: fallback or JavaScript-off placeholder remains');
}
for (const id of JSON.parse(fs.readFileSync(path.join(root, 'explore', 'designs', 'index.json'), 'utf8'))) {
  if (!new RegExp(`href=["'][^"']*\\/explore\\/designs\\/${id}\\/["']`).test(exploreHtml)) {
    failures.push(`explore/index.html: static product link is missing for ${id}`);
  }
}
const bridalGuide = fs.readFileSync(path.join(root, 'blog', 'how-to-choose-aari-embroidery-bridal-blouse', 'index.html'), 'utf8');
if (/Add hero image:\s*images\/blog\/bridal-blouse-guide\.jpg/i.test(bridalGuide)) {
  failures.push('blog/how-to-choose-aari-embroidery-bridal-blouse/index.html: image placeholder remains');
}

if (failures.length) {
  console.error('Metadata check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`SEO checks passed for ${Object.keys(metadata).length} HTML pages.`);
}
