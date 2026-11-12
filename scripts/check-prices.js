const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const designsDirectory = path.join(root, 'explore', 'designs');
const explorePath = path.join(root, 'explore', 'index.html');
const exploreHtml = fs.readFileSync(explorePath, 'utf8');
const mismatches = [];

function record(design, source, expected, actual) {
  mismatches.push({ design, source, expected, actual });
}

function parsePrice(value) {
  const match = String(value ?? '').match(/^\s*(?:INR\s*|₹\s*|&#8377;)?([\d,]+(?:\.\d{1,2})?)\s*;?\s*$/i);
  if (!match) return null;
  const amount = Number(match[1].replace(/,/g, ''));
  return Number.isFinite(amount) ? amount : null;
}

function formatPrice(amount) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

function visibleText(markup) {
  return markup
    .replace(/&#8377;|&#x20b9;|&rupee;/gi, '₹')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .trim();
}

function hasStrikethrough(markup) {
  return /<(?:s|del)\b|\bclass=["'][^"']*\b(?:price-old|old)\b[^"']*["']|text-decoration\s*:\s*line-through/i.test(markup);
}

function isValidFutureOffer(product, today) {
  const originalPrice = parsePrice(product.originalPrice);
  const currentPrice = parsePrice(product.newPrice);
  if (originalPrice === null || currentPrice === null || originalPrice <= currentPrice) return false;
  if (typeof product.offerEndsOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(product.offerEndsOn)) return false;
  const date = new Date(`${product.offerEndsOn}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === product.offerEndsOn &&
    product.offerEndsOn > today;
}

function getCardMarkup(id) {
  const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const cardPattern = new RegExp(
    `<a\\b[^>]*href=["']/explore/designs/${escapedId}/["'][^>]*>([\\s\\S]*?)<\\/a>`,
    'i'
  );
  return exploreHtml.match(cardPattern)?.[1] ?? null;
}

function getProductOffer(html) {
  const scripts = html.matchAll(/<script\b(?=[^>]*type=["']application\/ld\+json["'])[^>]*>([\s\S]*?)<\/script>/gi);
  for (const script of scripts) {
    let data;
    try {
      data = JSON.parse(script[1]);
    } catch (error) {
      continue;
    }
    const products = Array.isArray(data) ? data : [data];
    const product = products.find(item => item && item['@type'] === 'Product');
    if (product) return product.offers ?? null;
  }
  return null;
}

const today = new Date().toISOString().slice(0, 10);
const designIds = fs.readdirSync(designsDirectory, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort();

for (const id of designIds) {
  const productPath = path.join(designsDirectory, id, 'product.json');
  const pagePath = path.join(designsDirectory, id, 'index.html');
  if (!fs.existsSync(productPath)) {
    record(id, 'product.json', 'present', 'missing');
    continue;
  }
  const product = JSON.parse(fs.readFileSync(productPath, 'utf8'));
  const expectedAmount = parsePrice(product.newPrice);

  if (expectedAmount === null) {
    record(id, 'product.json', 'parseable newPrice', product.newPrice);
    continue;
  }

  const expectedDisplay = formatPrice(expectedAmount);
  const cardMarkup = getCardMarkup(id);
  const cardPrice = cardMarkup?.match(/<span\b[^>]*class=["'][^"']*\bprice-new\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i)?.[1];
  if (!cardPrice) {
    record(id, 'Explore card', expectedDisplay, cardMarkup ? 'missing price' : 'missing card');
  } else if (visibleText(cardPrice) !== expectedDisplay) {
    record(id, 'Explore card', expectedDisplay, visibleText(cardPrice));
  }

  let pageHtml = '';
  if (!fs.existsSync(pagePath)) {
    record(id, 'Product page', expectedDisplay, 'missing page');
  } else {
    pageHtml = fs.readFileSync(pagePath, 'utf8');
    const pagePrice = pageHtml.match(/<div\b[^>]*class=["'][^"']*\bprice\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
    if (!pagePrice) {
      record(id, 'Product page', expectedDisplay, 'missing price');
    } else if (visibleText(pagePrice) !== expectedDisplay) {
      record(id, 'Product page', expectedDisplay, visibleText(pagePrice));
    }
  }

  const offers = getProductOffer(pageHtml);
  if (!offers) {
    record(id, 'JSON-LD price', expectedAmount, 'missing Product offer');
  } else {
    const schemaAmount = Number(offers.price);
    if (!Number.isFinite(schemaAmount) || schemaAmount !== expectedAmount) {
      record(id, 'JSON-LD price', expectedAmount, offers.price ?? 'missing price');
    }
    if (offers.priceCurrency !== 'INR') {
      record(id, 'JSON-LD currency', 'INR', offers.priceCurrency ?? 'missing currency');
    }
  }

  if (!isValidFutureOffer(product, today)) {
    if (cardMarkup && hasStrikethrough(cardMarkup)) {
      record(id, 'Explore strikethrough', 'no strikethrough without a valid future offer', 'strikethrough present');
    }
    const pagePrice = pageHtml.match(/<div\b[^>]*class=["'][^"']*\bprice\b[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1];
    if (pagePrice && hasStrikethrough(pagePrice)) {
      record(id, 'Product-page strikethrough', 'no strikethrough without a valid future offer', 'strikethrough present');
    }
  }
}

if (mismatches.length) {
  console.error('Price check failed:');
  console.table(mismatches);
  process.exitCode = 1;
} else {
  console.log(`Price check passed for ${designIds.length} designs.`);
}
