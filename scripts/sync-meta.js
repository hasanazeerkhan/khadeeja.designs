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

function setTitle(head, title) {
  if (/<title\b[^>]*>[\s\S]*?<\/title>/i.test(head)) {
    return head.replace(/(<title\b[^>]*>)[\s\S]*?(<\/title>)/i, `$1${title.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}$2`);
  }
  return head.replace(/<\/head>/i, `  <title>${title}</title>\n</head>`);
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
  const title = `${name} Aari Work Blouse | Khadeeja Designs`;
  const description = `${name} Aari work blouse from Khadeeja Designs, Trichy. Listed at ${formatPrice(product.newPrice)}. Customisation on request. Delivery across India.`;
  return { title, description };
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
  const html = fs.readFileSync(absolutePath, 'utf8');
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
  head = setMeta(head, 'property', 'og:title', pageMeta.title);
  head = setMeta(head, 'property', 'og:description', pageMeta.description);
  head = setMeta(head, 'name', 'twitter:title', pageMeta.title);
  head = setMeta(head, 'name', 'twitter:description', pageMeta.description);

  if (configured.ogImage) {
    head = setMeta(head, 'property', 'og:image', configured.ogImage);
    head = setMeta(head, 'name', 'twitter:image', configured.ogImage);
  }

  fs.writeFileSync(absolutePath, html.replace(headMatch[0], head), 'utf8');
}

console.log(`Synced metadata for ${Object.keys(metadata).length} pages.`);
