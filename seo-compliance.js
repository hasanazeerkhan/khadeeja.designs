#!/usr/bin/env node
/**
 * seo-compliance.js - guards the Khadeeja Designs static site against regressions.
 * Zero dependencies. Node 18+.
 *
 *   node scripts/seo-compliance.js                  run every check
 *   node scripts/seo-compliance.js --only=head,products
 *   node scripts/seo-compliance.js --warnings-as-errors
 *   node scripts/seo-compliance.js --json           machine-readable output
 *
 * Groups: head, content, products, sitemap, links, schema, a11y, config, contact
 * Exit code 1 if any error (or any warning with --warnings-as-errors).
 *
 * Everything it checks is read from the repo files. Nothing is hard-coded per design or per post,
 * so adding designs or blog posts needs no change here.
 */
'use strict';
const fs = require('fs');
const path = require('path');

/* ------------------------------------------------------------------ settings */
const args = process.argv.slice(2);
const opt = (n, d) => { const a = args.find((x) => x.startsWith(`--${n}=`)); return a ? a.split('=').slice(1).join('=') : d; };
const ROOT = path.resolve(opt('root', '.'));
const ONLY = opt('only', '') ? opt('only', '').split(',').map((s) => s.trim()) : null;
const AS_JSON = args.includes('--json');
const WARN_AS_ERROR = args.includes('--warnings-as-errors');

const CFG = {
  site: 'https://khadeejadesigns.in',
  titleMax: 60,
  descMax: 160,
  descMin: 70,
  productsDir: 'explore/designs',
  categories: ['bridal', 'designer'],
  noindexPaths: ['/thankyou/', '/privacy/', '/product/', '/404.html'],
  skipDirs: new Set(['node_modules', '.git', '.github', 'scripts']),
  staleBlogDays: 60,
  maxImageKB: 500,
};

/* ------------------------------------------------------------------ plumbing */
const findings = [];
const add = (level, group, rule, where, msg) => findings.push({ level, group, rule, where, msg });
const err = (g, r, w, m) => add('error', g, r, w, m);
const warn = (g, r, w, m) => add('warn', g, r, w, m);
const on = (g) => !ONLY || ONLY.includes(g);

const abs = (rel) => path.join(ROOT, rel);
const exists = (rel) => fs.existsSync(abs(rel));
const readText = (rel) => (exists(rel) ? fs.readFileSync(abs(rel), 'utf8') : null);
const readJSON = (rel) => {
  const t = readText(rel);
  if (t == null) return null;
  try { return JSON.parse(t); } catch (e) { return { __parseError: e.message }; }
};

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!CFG.skipDirs.has(e.name)) walk(path.join(dir, e.name), out); }
    else out.push(path.join(dir, e.name));
  }
  return out;
}

const decode = (s) => s
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
  .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
  .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
const len = (s) => Array.from(s).length;
const squash = (s) => decode(s).replace(/\s+/g, ' ').trim();

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'));
  return m ? decode(m[2] !== undefined ? m[2] : m[3]) : null;
}
function metaContent(html, key) {
  for (const t of html.match(/<meta\b[^>]*>/gi) || []) {
    const k = (attr(t, 'name') || attr(t, 'property') || '').toLowerCase();
    if (k === key) return attr(t, 'content');
  }
  return null;
}
const hasMeta = (html, key) => (html.match(/<meta\b[^>]*>/gi) || []).some((t) => (attr(t, 'name') || attr(t, 'property') || '').toLowerCase() === key);
const stripNoise = (html) => html
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<script\b[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[\s\S]*?<\/style>/gi, '')
  .replace(/<template\b[\s\S]*?<\/template>/gi, '');
const visibleText = (html) => squash(stripNoise(html).replace(/<head\b[\s\S]*?<\/head>/i, ' ').replace(/<[^>]+>/g, ' '));

const PRICE_RE = /(?:₹|&#8377;|&#x20B9;|INR|Rs\.?)\s*(\d[\d,]*)/gi;
const priceTokens = (s) => [...decode(s).matchAll(PRICE_RE)].map((m) => Number(m[1].replace(/,/g, '')));
const inr = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const today = new Date(); today.setHours(0, 0, 0, 0);
const validDate = (s) => /^\d{4}-\d{2}-\d{2}/.test(s || '') && !Number.isNaN(Date.parse(s));

/* ------------------------------------------------------------------ load site */
const siteCfg = readJSON('site-config.json') || {};
const REPLY = String(siteCfg.replyWindow || siteCfg.reply_window || siteCfg.replyTime || '');
const WA = String(siteCfg.whatsappNumber || siteCfg.whatsapp || '').replace(/\D/g, '');
const allFiles = walk(ROOT).map((f) => path.relative(ROOT, f).split(path.sep).join('/'));

const pages = allFiles
  .filter((f) => f === 'index.html' || f.endsWith('/index.html') || f === '404.html')
  .map((rel) => {
    const html = fs.readFileSync(abs(rel), 'utf8');
    const url = rel === '404.html' ? '/404.html' : rel === 'index.html' ? '/' : `/${rel.replace(/index\.html$/, '')}`;
    const kind = url === '/' ? 'home'
      : url === '/404.html' ? '404'
        : url.startsWith(`/${CFG.productsDir}/`) ? 'product'
          : url.startsWith('/blog/') && url !== '/blog/' ? 'post' : 'page';
    const robots = (metaContent(html, 'robots') || '').toLowerCase();
    return { rel, url, kind, html, clean: stripNoise(html), text: visibleText(html), noindex: robots.includes('noindex') };
  });
const byUrl = new Map(pages.map((p) => [p.url, p]));
const indexable = pages.filter((p) => p.kind !== '404' && !p.noindex);

function jsonLd(html) {
  const out = []; const errors = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html))) {
    try {
      const flat = (n) => (Array.isArray(n) ? n.flatMap(flat) : n && n['@graph'] ? [n, ...flat(n['@graph'])] : n ? [n] : []);
      out.push(...flat(JSON.parse(m[1])));
    } catch (e) { errors.push(e.message); }
  }
  return { nodes: out, errors };
}
const typeOf = (n) => [].concat(n['@type'] || []);

/* ------------------------------------------------------------------ products */
const products = [];
if (exists(CFG.productsDir)) {
  for (const d of fs.readdirSync(abs(CFG.productsDir), { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    const j = readJSON(`${CFG.productsDir}/${d.name}/product.json`);
    if (j) products.push({ folder: d.name, json: j, url: `/${CFG.productsDir}/${d.name}/` });
  }
}
function priceOf(j) {
  if (typeof j.price === 'number') return j.price;
  const m = String(j.newPrice || '').match(/\d[\d,]*/);
  return m ? Number(m[0].replace(/,/g, '')) : NaN;
}
function offerState(j) {
  const o = j.originalPrice; const e = j.offerEndsOn;
  if (!o && !e) return { valid: false, partial: false };
  if (!o || !e) return { valid: false, partial: true };
  const end = new Date(e); end.setHours(23, 59, 59, 999);
  return { valid: !Number.isNaN(+end) && end >= today, partial: false };
}

/* =================================================================== CHECKS */

/* ---------- head: titles, descriptions, canonical, social tags ---------- */
if (on('head')) {
  const titles = new Map(); const descs = new Map();
  for (const p of pages) {
    if (p.kind === '404') continue;
    const w = p.url;
    const tm = p.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = tm ? squash(tm[1]) : '';
    const desc = squash(metaContent(p.html, 'description') || '');

    if (!title) err('head', 'title-missing', w, 'no <title>');
    else {
      if (len(title) > CFG.titleMax) err('head', 'title-too-long', w, `title is ${len(title)} chars (max ${CFG.titleMax}): "${title}"`);
      if (!/Khadeeja Designs/i.test(title)) warn('head', 'title-brand', w, 'title does not end with the brand name');
      titles.set(title, [...(titles.get(title) || []), w]);
    }
    if (!desc) err('head', 'desc-missing', w, 'no meta description');
    else {
      if (len(desc) > CFG.descMax) err('head', 'desc-too-long', w, `description is ${len(desc)} chars (max ${CFG.descMax})`);
      if (len(desc) < CFG.descMin) warn('head', 'desc-too-short', w, `description is ${len(desc)} chars (min ${CFG.descMin})`);
      descs.set(desc, [...(descs.get(desc) || []), w]);
    }

    if (hasMeta(p.html, 'keywords')) err('head', 'meta-keywords', w, '<meta name="keywords"> must be removed');

    const canon = (p.html.match(/<link\b[^>]*>/gi) || []).find((t) => /rel\s*=\s*["']canonical["']/i.test(t));
    const href = canon ? attr(canon, 'href') : null;
    if (!href) err('head', 'canonical-missing', w, 'no canonical link');
    else if (href !== CFG.site + p.url) err('head', 'canonical-wrong', w, `canonical is ${href}, expected ${CFG.site + p.url}`);

    if (!/<html[^>]*\blang=/i.test(p.html)) warn('head', 'html-lang', w, '<html> has no lang attribute');
    if (!hasMeta(p.html, 'viewport')) err('head', 'viewport', w, 'no viewport meta');

    const ogt = metaContent(p.html, 'og:title'); const ogd = metaContent(p.html, 'og:description');
    if (ogt == null) err('head', 'og-title-missing', w, 'no og:title');
    else if (squash(ogt) !== title) err('head', 'og-title-mismatch', w, `og:title "${squash(ogt)}" differs from <title> "${title}"`);
    if (ogd == null) err('head', 'og-desc-missing', w, 'no og:description');
    else if (squash(ogd) !== desc) err('head', 'og-desc-mismatch', w, 'og:description differs from meta description');
    for (const [k, ref] of [['twitter:title', title], ['twitter:description', desc]]) {
      const v = metaContent(p.html, k);
      if (v != null && squash(v) !== ref) err('head', 'twitter-mismatch', w, `${k} differs from the page ${k.endsWith('title') ? 'title' : 'description'}`);
    }
    if (!hasMeta(p.html, 'twitter:card')) warn('head', 'twitter-card', w, 'no twitter:card');
    const ogu = metaContent(p.html, 'og:url');
    if (ogu && ogu !== CFG.site + p.url) err('head', 'og-url-wrong', w, `og:url is ${ogu}`);

    const img = metaContent(p.html, 'og:image');
    if (!img) { if (p.kind !== 'page') warn('head', 'og-image-missing', w, 'no og:image'); }
    else if (!img.startsWith(`${CFG.site}/`)) err('head', 'og-image-host', w, `og:image must be an absolute ${CFG.site} URL: ${img}`);
    else if (!exists(img.slice(CFG.site.length + 1))) err('head', 'og-image-404', w, `og:image file not found in repo: ${img}`);

    const h1 = (p.clean.match(/<h1\b/gi) || []).length;
    if (h1 !== 1) err('head', 'h1-count', w, `page has ${h1} <h1> (expected exactly 1)`);

    if (CFG.noindexPaths.includes(p.url) !== p.noindex && p.url !== '/404.html') {
      if (p.noindex) err('head', 'unexpected-noindex', w, 'page is noindex but is not in the allowed noindex list');
      else err('head', 'missing-noindex', w, 'page must be noindex');
    }
  }
  for (const [t, urls] of titles) if (urls.length > 1) err('head', 'title-duplicate', urls.join(', '), `same title on ${urls.length} pages: "${t}"`);
  for (const [d, urls] of descs) if (urls.length > 1) err('head', 'desc-duplicate', urls.join(', '), `same description on ${urls.length} pages: "${d.slice(0, 70)}..."`);
}

/* ---------- content: placeholders, blank templates, reply-time promise ---------- */
if (on('content')) {
  const BANNED = [
    [/\bundefined\b/, 'the word "undefined"'],
    [/\bNaN\b/, '"NaN"'],
    [/\[object \w+\]/, '"[object Object]"'],
    [/\{\{|\}\}/, 'unrendered {{ }} placeholder'],
    [/\$\{/, 'unrendered ${ } placeholder'],
    [/lorem ipsum/i, 'lorem ipsum'],
    [/\b(TODO|FIXME|TBD)\b/, 'TODO/FIXME/TBD marker'],
    [/blouse\s+blouse/i, '"Blouse blouse" doubled word'],
    [/\bwithin\s+(to|with|and|for)\b/i, 'blank value before "to/with/and" after "within"'],
    [/\b(localhost|127\.0\.0\.1)\b/, 'localhost reference'],
  ];
  const want = (REPLY.match(/\d+/) || [])[0];
  for (const p of pages) {
    const w = p.url;
    for (const [re, label] of BANNED) if (re.test(p.clean)) err('content', 'banned-text', w, `found ${label}`);

    if (/\b(?:reply|respond|response|get back to you)\s+within\s*(?:[.,;:!?]|$)/i.test(p.text)) {
      err('content', 'blank-reply-window', w, 'reply-time sentence has no value ("within ."). Value must be in the static HTML, not injected by JS');
    }
    const re = /(?:reply|respond|response|get back|answer)[^.!?]{0,60}?\b(\d+)\s*(?:hours?|hrs?)\b([^.!?]{0,80})/gi;
    let m;
    while ((m = re.exec(p.text))) {
      if (want && m[1] !== want) err('content', 'reply-window-mismatch', w, `says ${m[1]} hours but site-config.json replyWindow is "${REPLY}"`);
      if (/studio hours/i.test(REPLY) && !/studio hours/i.test(m[0])) warn('content', 'reply-window-qualifier', w, 'reply promise should say "during studio hours"');
    }
    const dup = p.text.match(/\b([a-z]{4,})\s+\1\b/i);
    if (dup && !/blouse\s+blouse/i.test(dup[0])) warn('content', 'doubled-word', w, `doubled word "${dup[0]}"`);
  }
  for (const rel of allFiles) {
    if (!/\.(html|json|xml|txt|js|css)$/i.test(rel) || /^README/i.test(rel)) continue;
    const NETLIFY_HOST = 'netlify' + '.app'; if (new RegExp(NETLIFY_HOST.replace(/\./g, '\\.'), 'i').test(fs.readFileSync(abs(rel), 'utf8'))) err('content', 'netlify-host', `/${rel}`, 'references the ' + 'netlify' + '.app' + ' host; use the .in domain');
  }
}

/* ---------- products: one source of truth ---------- */
if (on('products')) {
  const listed = readJSON(`${CFG.productsDir}/index.json`);
  if (!Array.isArray(listed)) err('products', 'index-json', `/${CFG.productsDir}/index.json`, 'missing or not a JSON array');
  const listedIds = new Set(Array.isArray(listed) ? listed : []);
  const explore = byUrl.get('/explore/');
  const exploreDesc = explore ? squash(metaContent(explore.html, 'description') || '') : '';
  const prices = [];

  for (const { folder, json: j, url } of products) {
    const w = url;
    if (j.__parseError) { err('products', 'json-invalid', w, `product.json is invalid JSON: ${j.__parseError}`); continue; }
    if (j.id !== folder) err('products', 'id-folder', w, `id "${j.id}" does not match folder "${folder}"`);
    for (const f of ['title', 'summary', 'description', 'imageAlt', 'category']) if (!j[f]) err('products', 'field-missing', w, `product.json missing "${f}"`);
    for (const f of ['priceIncludes', 'priceExcludes', 'shippingNote']) if (typeof j[f] !== 'string' || !j[f].trim()) err('products', 'pricing-scope-missing', w, `product.json missing "${f}"`);
    if (typeof j.customerSuppliesBlouse !== 'boolean') err('products', 'pricing-scope-missing', w, 'product.json missing boolean "customerSuppliesBlouse"');
    if (j.category && !CFG.categories.includes(j.category)) err('products', 'category', w, `category "${j.category}" not in ${CFG.categories.join('/')}`);
    if (!Array.isArray(j.images) || !j.images.length) err('products', 'images', w, 'product.json "images" is empty');
    if (!listedIds.has(folder)) err('products', 'not-in-index', w, `"${folder}" is not listed in ${CFG.productsDir}/index.json`);

    const price = priceOf(j);
    if (!Number.isFinite(price) || price <= 0) { err('products', 'price-missing', w, 'product.json has no valid numeric "price" (or newPrice)'); continue; }
    prices.push(price);
    if (typeof j.price !== 'number') warn('products', 'price-numeric', w, 'add a numeric "price" field to product.json (newPrice string is derived from it)');
    if (typeof j.price === 'number' && j.newPrice) {
      const np = Number(String(j.newPrice).replace(/[^\d]/g, ''));
      if (np && np !== j.price) err('products', 'price-fields', w, `price ${j.price} differs from newPrice "${j.newPrice}"`);
    }
    const offer = offerState(j);
    if (offer.partial) err('products', 'offer-partial', w, 'originalPrice and offerEndsOn must both be set or both null');
    if (j.originalPrice && Number(String(j.originalPrice).replace(/[^\d]/g, '')) <= price) err('products', 'offer-not-a-discount', w, 'originalPrice is not higher than price');
    if (j.originalPrice && j.offerEndsOn && !offer.valid) err('products', 'offer-expired', w, `offer ended ${j.offerEndsOn}: set originalPrice and offerEndsOn to null`);
    const allowed = new Set([price]);
    if (offer.valid) allowed.add(Number(String(j.originalPrice).replace(/[^\d]/g, '')));

    for (const img of j.images || []) {
      const rel = `${CFG.productsDir}/${folder}/${img}`;
      if (!exists(rel)) err('products', 'image-missing', w, `image not found: ${img}`);
      const webp = rel.replace(/\.[a-z]+$/i, '.webp');
      if (!exists(webp)) err('products', 'webp-missing', w, `no .webp beside ${img}`);
      else if (fs.statSync(abs(webp)).size > CFG.maxImageKB * 1024) warn('products', 'image-heavy', w, `${path.basename(webp)} is over ${CFG.maxImageKB} KB`);
    }

    // catalogue card
    if (explore) {
      const html = explore.clean; const m = new RegExp(`/${CFG.productsDir}/${folder}/?["']`, 'i').exec(html);
      if (!m) err('products', 'card-missing', '/explore/', `no card linking to ${url}`);
      else {
        const rest = html.slice(m.index + 5);
        const nxt = rest.search(new RegExp(`/${CFG.productsDir}/(?!${folder}/?["'])[a-z0-9-]+/?["']`, 'i'));
        const win = html.slice(m.index, m.index + 5 + Math.min(nxt < 0 ? 2500 : nxt, 2500));
        const toks = priceTokens(win.replace(/<[^>]+>/g, ' '));
        if (!toks.length) err('products', 'card-no-price', '/explore/', `card for "${folder}" shows no price`);
        for (const t of toks) if (!allowed.has(t)) err('products', 'card-price', '/explore/', `card for "${folder}" shows ${inr(t)} but product.json price is ${inr(price)}`);
        if (!offer.valid && /<(s|del|strike)\b|line-through/i.test(win)) err('products', 'card-strikethrough', '/explore/', `card for "${folder}" shows a strikethrough price but there is no valid offer`);
      }
    }

    // product page
    const page = byUrl.get(url);
    if (!page) { err('products', 'page-missing', w, `no index.html in ${CFG.productsDir}/${folder}/`); continue; }
    const body = page.text;
    const toks = priceTokens(body);
    if (!toks.length) err('products', 'page-no-price', w, 'product page shows no price');
    for (const t of toks) if (!allowed.has(t)) err('products', 'page-price', w, `page shows ${inr(t)} but product.json price is ${inr(price)}`);
    if (!offer.valid && /<(s|del|strike)\b|line-through/i.test(page.clean)) err('products', 'page-strikethrough', w, 'strikethrough price shown without a valid offer');
    const pdesc = metaContent(page.html, 'description') || '';
    if (!priceTokens(pdesc).includes(price)) err('products', 'meta-price', w, `meta description must state the listed price (${inr(price)})`);
    const ptitle = (page.html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || '';
    if (j.title && !squash(ptitle).toLowerCase().includes(String(j.title).replace(/\s+blouse$/i, '').toLowerCase())) warn('products', 'title-name', w, 'page title does not contain the design name');
    if (j.imageAlt && !page.clean.includes(j.imageAlt.slice(0, 40))) warn('products', 'alt-text', w, 'hero image alt does not match product.json imageAlt');

    const ld = jsonLd(page.html);
    const pn = ld.nodes.find((n) => typeOf(n).includes('Product'));
    if (!pn) warn('schema', 'product-schema', w, 'no Product JSON-LD');
    else {
      const off = [].concat(pn.offers || [])[0] || {};
      if (off.price === undefined) warn('schema', 'product-offer', w, 'Product JSON-LD has no offers.price');
      else if (Number(String(off.price).replace(/,/g, '')) !== price) err('products', 'schema-price', w, `JSON-LD price ${off.price} differs from product.json ${price}`);
      if (off.priceCurrency && off.priceCurrency !== 'INR') err('products', 'schema-currency', w, `priceCurrency is ${off.priceCurrency}, expected INR`);
    }
  }
  for (const id of listedIds) if (!products.some((p) => p.folder === id)) err('products', 'index-orphan', `/${CFG.productsDir}/index.json`, `lists "${id}" but no product.json folder exists`);
  if (explore && prices.length) {
    const toks = priceTokens(exploreDesc);
    if (toks.length && (Math.min(...toks) !== Math.min(...prices) || Math.max(...toks) !== Math.max(...prices))) {
      err('products', 'explore-range', '/explore/', `description price range ${toks.map(inr).join('-')} differs from product.json range ${inr(Math.min(...prices))}-${inr(Math.max(...prices))}`);
    }
  }
}

/* ---------- sitemap + robots ---------- */
if (on('sitemap')) {
  const sm = readText('sitemap.xml');
  if (!sm) err('sitemap', 'missing', '/sitemap.xml', 'sitemap.xml not found');
  else {
    const entries = [...sm.matchAll(/<url>([\s\S]*?)<\/url>/gi)].map((m) => ({
      loc: ((m[1].match(/<loc>\s*([^<]+?)\s*<\/loc>/i) || [])[1] || ''),
      lastmod: ((m[1].match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/i) || [])[1] || ''),
    }));
    const locs = new Set(entries.map((e) => e.loc));
    for (const p of indexable) if (!locs.has(CFG.site + p.url)) err('sitemap', 'page-not-listed', p.url, 'indexable page is missing from sitemap.xml');
    for (const e of entries) {
      const url = e.loc.startsWith(CFG.site) ? e.loc.slice(CFG.site.length) : null;
      if (url === null) err('sitemap', 'wrong-host', e.loc, 'sitemap URL is not on the .in domain');
      else if (!byUrl.has(url)) err('sitemap', 'dead-entry', e.loc, 'sitemap lists a URL with no page in the repo');
      else if (byUrl.get(url).noindex) err('sitemap', 'noindex-listed', e.loc, 'noindex page listed in sitemap');
      if (!e.lastmod) warn('sitemap', 'lastmod-missing', e.loc, 'no <lastmod>');
      else if (!validDate(e.lastmod)) err('sitemap', 'lastmod-invalid', e.loc, `invalid lastmod "${e.lastmod}"`);
      else if (new Date(e.lastmod) > new Date(today.getTime() + 864e5)) err('sitemap', 'lastmod-future', e.loc, `lastmod ${e.lastmod} is in the future`);
    }
  }
  const rb = readText('robots.txt');
  if (!rb) err('sitemap', 'robots-missing', '/robots.txt', 'robots.txt not found');
  else {
    if (!new RegExp(`^Sitemap:\\s*${CFG.site.replace(/\./g, '\\.')}/sitemap\\.xml\\s*$`, 'im').test(rb)) err('sitemap', 'robots-sitemap', '/robots.txt', 'missing "Sitemap: https://khadeejadesigns.in/sitemap.xml"');
    if (/^Disallow:\s*\/\s*$/im.test(rb)) err('sitemap', 'robots-blocks-all', '/robots.txt', 'Disallow: / blocks the whole site');
    if (/^Disallow:\s*\/thankyou/im.test(rb) && byUrl.get('/thankyou/') && byUrl.get('/thankyou/').noindex) warn('sitemap', 'robots-hides-noindex', '/robots.txt', 'Disallow /thankyou/ stops crawlers from ever seeing its noindex; remove the Disallow line');
  }
}

/* ---------- links: dead links, orphans, blog hygiene ---------- */
if (on('links')) {
  const inbound = new Map();
  const resolve = (href) => {
    const clean = decodeURI(href.split('#')[0].split('?')[0]);
    if (clean.endsWith('/')) return exists(`${clean.slice(1)}index.html`) || clean === '/' ? { type: 'page', url: clean } : null;
    const rel = clean.slice(1);
    if (exists(rel) && fs.statSync(abs(rel)).isFile()) return { type: 'file' };
    if (exists(`${rel}/index.html`)) return { type: 'noslash', url: `${clean}/` };
    if (exists(`${rel}.html`)) return { type: 'file' };
    return null;
  };
  for (const p of pages) {
    const noChrome = p.clean.replace(/<(nav|header|footer)\b[\s\S]*?<\/\1>/gi, '');
    for (const t of p.clean.match(/<a\b[^>]*>/gi) || []) {
      let href = attr(t, 'href'); if (!href) continue;
      if (href.startsWith(CFG.site)) href = href.slice(CFG.site.length) || '/';
      if (!href.startsWith('/') || href.startsWith('//')) {
        if (/^http:\/\/(www\.)?khadeejadesigns\.in/i.test(href)) err('links', 'http-internal', p.url, `internal link uses http: ${href}`);
        continue;
      }
      if (/^\/product(\?|$)/.test(href)) continue; // legacy redirect handled by netlify.toml
      const r = resolve(href);
      if (!r) { err('links', 'dead-link', p.url, `link to ${href} does not resolve to a page or file`); continue; }
      if (r.type === 'noslash') warn('links', 'no-trailing-slash', p.url, `link ${href} should end with "/"`);
      const target = (r.url || href.split('#')[0].split('?')[0]);
      if (r.url || r.type === 'noslash') { inbound.set(target, (inbound.get(target) || new Set()).add(p.url)); }
    }
    for (const t of noChrome.match(/<a\b[^>]*>/gi) || []) {
      let href = attr(t, 'href') || ''; if (href.startsWith(CFG.site)) href = href.slice(CFG.site.length) || '/';
      if (href.split('#')[0].split('?')[0] === p.url && !href.includes('#') && p.kind !== '404') { warn('links', 'self-link', p.url, `page links to itself (${href}) in its content`); break; }
    }
  }
  for (const p of indexable) {
    const from = [...(inbound.get(p.url) || [])].filter((u) => u !== p.url);
    if (p.url === '/') continue;
    if (!from.length) (p.kind === 'product' || p.kind === 'post' ? err : warn)('links', 'orphan', p.url, 'no page links to this page in static HTML (nav/footer injected by JS do not count)');
  }
  // blog posts
  const posts = pages.filter((p) => p.kind === 'post');
  const dates = [];
  for (const p of posts) {
    if (!(inbound.get(p.url) || new Set()).has('/blog/')) err('links', 'post-not-on-index', p.url, 'post is not linked from /blog/');
    const dt = metaContent(p.html, 'article:published_time') || ((p.html.match(/<time[^>]*datetime=["']([^"']+)/i) || [])[1]);
    if (!dt) warn('links', 'post-date', p.url, 'no article:published_time');
    else if (!validDate(dt)) err('links', 'post-date', p.url, `invalid publish date "${dt}"`);
    else if (new Date(dt) > new Date(today.getTime() + 864e5)) err('links', 'post-date-future', p.url, `publish date ${dt} is in the future`);
    else dates.push(new Date(dt));
    const internal = new Set([...(inbound.entries())].filter(([, s]) => s.has(p.url)).map(([u]) => u));
    if (internal.size < 2) warn('links', 'post-internal-links', p.url, `post links to only ${internal.size} other page(s); add related guides and a design or enquiry link`);
    if (!internal.has('/contact/')) warn('links', 'post-cta', p.url, 'post has no link to /contact/');
  }
  if (dates.length) {
    const newest = new Date(Math.max(...dates));
    const age = Math.floor((today - newest) / 864e5);
    if (age > CFG.staleBlogDays) warn('links', 'blog-stale', '/blog/', `newest post is ${age} days old (threshold ${CFG.staleBlogDays})`);
  }
}

/* ---------- schema ---------- */
if (on('schema')) {
  for (const p of pages) {
    if (p.kind === '404') continue;
    const ld = jsonLd(p.html);
    for (const e of ld.errors) err('schema', 'jsonld-invalid', p.url, `JSON-LD does not parse: ${e}`);
    const types = ld.nodes.flatMap(typeOf);
    if (p.kind === 'home') {
      const lb = ld.nodes.find((n) => typeOf(n).some((t) => /LocalBusiness|Store|Organization/.test(t)));
      if (!lb) err('schema', 'localbusiness-missing', p.url, 'home page has no LocalBusiness JSON-LD');
      else {
        for (const f of ['name', 'address', 'telephone', 'url']) if (!lb[f]) err('schema', 'localbusiness-field', p.url, `LocalBusiness missing "${f}"`);
        for (const f of ['image', 'geo', 'openingHoursSpecification', 'priceRange']) if (!lb[f]) warn('schema', 'localbusiness-enrich', p.url, `LocalBusiness has no "${f}" (add only confirmed facts)`);
        if (WA && lb.telephone && !String(lb.telephone).replace(/\D/g, '').endsWith(WA.slice(-10))) warn('schema', 'phone-mismatch', p.url, 'schema telephone differs from site-config.json number');
      }
    }
    if (p.kind !== 'home' && !p.noindex && !types.includes('BreadcrumbList')) warn('schema', 'breadcrumb', p.url, 'no BreadcrumbList JSON-LD');
    if (p.kind === 'post' && !types.some((t) => /Article|BlogPosting/.test(t))) warn('schema', 'article', p.url, 'no Article/BlogPosting JSON-LD');
  }
}

/* ---------- accessibility basics ---------- */
if (on('a11y')) {
  for (const p of pages) {
    for (const t of p.clean.match(/<img\b[^>]*>/gi) || []) {
      if (attr(t, 'alt') === null) err('a11y', 'img-alt', p.url, `<img> without alt: ${(attr(t, 'src') || '').slice(-50)}`);
    }
    for (const m of p.clean.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/gi)) {
      const label = squash(m[2].replace(/<[^>]+>/g, ' '));
      if (!label && !attr(m[1], 'aria-label')) warn('a11y', 'button-name', p.url, 'button has no text and no aria-label');
      if (/faq-btn/.test(m[1]) && attr(m[1], 'aria-expanded') === null) warn('a11y', 'faq-aria', p.url, 'FAQ button has no aria-expanded');
    }
  }
}

/* ---------- site-config + contact channels (WhatsApp, phone, studio hours) ---------- */
if (on('config') || on('contact')) {
  if (!Object.keys(siteCfg).length) err('config', 'site-config', '/site-config.json', 'missing or empty');
  else if (siteCfg.__parseError) err('config', 'site-config', '/site-config.json', `invalid JSON: ${siteCfg.__parseError}`);
  else {
    if (!REPLY) err('config', 'reply-window', '/site-config.json', 'replyWindow is empty');
    if (/studio hours/i.test(REPLY) && !siteCfg.studioHours) err('config', 'studio-hours', '/site-config.json', 'replyWindow mentions studio hours but "studioHours" is not set');
    if (!/^91\d{10}$/.test(WA)) err('config', 'whatsapp', '/site-config.json', 'whatsappNumber must be digits with country code, e.g. 918667454391');
    if (Array.isArray(siteCfg.testimonials) && siteCfg.testimonials.length) warn('config', 'testimonials', '/site-config.json', 'testimonials are set: confirm each has customer permission');
  }
  if (on('contact') && WA) {
    const last10 = WA.slice(-10);
    const tels = (p) => (p.clean.match(/<a\b[^>]*>/gi) || []).map((t) => attr(t, 'href') || '').filter((h) => h.startsWith('tel:')).map((h) => h.replace(/\D/g, ''));
    const was = (p) => (p.clean.match(/<a\b[^>]*>/gi) || []).map((t) => attr(t, 'href') || '').filter((h) => /^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(h));
    const contact = byUrl.get('/contact/');
    if (contact) {
      if (!was(contact).some((h) => h.includes(`wa.me/${WA}`))) err('contact', 'contact-whatsapp', '/contact/', 'Contact page has no WhatsApp link in the static HTML');
      if (!tels(contact).some((d) => d.endsWith(last10))) err('contact', 'contact-tel', '/contact/', 'Contact page has no tel: link');
    }
    for (const { folder, json: j, url } of products) {
      const page = byUrl.get(url); if (!page) continue;
      const links = was(page);
      const good = links.filter((h) => h.includes(`wa.me/${WA}`));
      if (!good.length) { err('contact', 'product-whatsapp', url, 'product page has no WhatsApp link in the static HTML'); continue; }
      const text = (() => { try { return decodeURIComponent((good[0].split('text=')[1] || '').replace(/&amp;.*$/, '').replace(/\+/g, ' ')); } catch (e) { return ''; } })();
      if (!text) err('contact', 'whatsapp-text', url, 'WhatsApp link has no prefilled message');
      else if (j.title && !text.toLowerCase().includes(String(j.title).replace(/\s+blouse$/i, '').toLowerCase())) err('contact', 'whatsapp-text', url, 'WhatsApp message does not mention this design');
      else if (!text.includes(CFG.site + url)) warn('contact', 'whatsapp-url', url, 'WhatsApp message does not include the page URL');
      if (!tels(page).some((d) => d.endsWith(last10))) warn('contact', 'product-tel', url, 'product page has no tel: link');
    }
  }
}

/* =================================================================== REPORT */
const order = { error: 0, warn: 1 };
findings.sort((a, b) => order[a.level] - order[b.level] || a.group.localeCompare(b.group) || a.rule.localeCompare(b.rule) || a.where.localeCompare(b.where));
const errors = findings.filter((f) => f.level === 'error');
const warns = findings.filter((f) => f.level === 'warn');

if (AS_JSON) {
  console.log(JSON.stringify({ errors: errors.length, warnings: warns.length, findings }, null, 2));
} else {
  const line = (f) => `${f.level === 'error' ? 'ERROR' : 'warn '}  [${f.group}/${f.rule}]  ${f.where}\n       ${f.msg}`;
  if (errors.length) { console.log('\nERRORS (these must be fixed)\n'); errors.forEach((f) => console.log(line(f))); }
  if (warns.length) { console.log('\nWARNINGS\n'); warns.forEach((f) => console.log(line(f))); }
  console.log(`\n${pages.length} pages, ${products.length} designs checked. ${errors.length} error(s), ${warns.length} warning(s).`);
  console.log(errors.length ? 'RESULT: FAIL' : warns.length && WARN_AS_ERROR ? 'RESULT: FAIL (warnings as errors)' : 'RESULT: PASS');
}
process.exit(errors.length || (WARN_AS_ERROR && warns.length) ? 1 : 0);
