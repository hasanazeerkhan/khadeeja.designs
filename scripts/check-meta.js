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
  const twitterTitle = findMeta(head, 'name', 'twitter:title');
  const twitterDescription = findMeta(head, 'name', 'twitter:description');

  if (!title) failures.push(`${relativePath}: title is missing`);
  else if (title.length > 60) failures.push(`${relativePath}: title is ${title.length} characters (maximum 60)`);
  if (!description) failures.push(`${relativePath}: description is missing`);
  else if (description.length > 160) failures.push(`${relativePath}: description is ${description.length} characters (maximum 160)`);

  if (ogTitle !== title) failures.push(`${relativePath}: og:title differs from title`);
  if (twitterTitle !== title) failures.push(`${relativePath}: twitter:title differs from title`);
  if (ogDescription !== description) failures.push(`${relativePath}: og:description differs from description`);
  if (twitterDescription !== description) failures.push(`${relativePath}: twitter:description differs from description`);
  if (/<meta\b(?=[^>]*\bname\s*=\s*(["'])keywords\1)[^>]*>/i.test(head)) {
    failures.push(`${relativePath}: keywords meta tag remains`);
  }

  if (configured.source === 'product.json') {
    const productPath = path.join(root, path.dirname(pagePath), 'product.json');
    if (!fs.existsSync(productPath)) {
      failures.push(`${relativePath}: product.json is missing`);
      continue;
    }
    const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));
    const name = String(product.title || product.tag || '').replace(/\s+blouse\s*$/i, '').trim();
    const price = parsePrice(product.newPrice);
    if (price === null) {
      failures.push(`${relativePath}: product.json newPrice is invalid`);
      continue;
    }
    const expectedDescription = `${name} Aari work blouse from Khadeeja Designs, Trichy. Listed at ₹${price.toLocaleString('en-IN')}. Customisation on request. Delivery across India.`;
    if (description !== expectedDescription) {
      failures.push(`${relativePath}: description price or text differs from product.json`);
    }
  }
}

if (failures.length) {
  console.error('Metadata check failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Metadata check passed for ${Object.keys(metadata).length} pages.`);
}
