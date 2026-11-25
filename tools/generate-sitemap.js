const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const siteUrl = 'https://khadeejadesigns.in';
const pageRoots = [
  '/',
  '/explore/',
  '/about/',
  '/blog/',
  '/faq/',
  '/contact/',
  '/bridal-aari-blouse/',
  '/policies/',
];

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function normalizeUrl(urlPath) {
  const formatted = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  return `${siteUrl}${formatted}`;
}

/**
 * lastmod = the date of the last commit that touched the page (or its product.json), so Google
 * sees real content dates instead of the build date. Falls back to the file's mtime for
 * uncommitted files or shallow clones without history.
 */
function latestDateFor(filePath, ...related) {
  const files = [filePath, ...related].filter(file => fs.existsSync(file));
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files.map(f => path.relative(root, f))], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    const dirty = execFileSync('git', ['status', '--porcelain', '--', ...files.map(f => path.relative(root, f))], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(out) && !dirty) return out;
  } catch {
    /* not a git checkout: fall through */
  }
  const newest = Math.max(...files.map(file => fs.statSync(file).mtimeMs));
  return new Date(newest).toISOString().slice(0, 10);
}

function buildImageTag(imagePath) {
  if (!imagePath) return '';
  const normalized = imagePath.startsWith('http') ? imagePath : `${siteUrl}${imagePath}`;
  return `\n    <image:image><image:loc>${xmlEscape(normalized)}</image:loc></image:image>`;
}

function collectProductUrls() {
  const idsFile = path.join(root, 'explore', 'designs', 'index.json');
  if (!fs.existsSync(idsFile)) return [];

  const ids = readJson(idsFile);
  return ids
    .filter(id => typeof id === 'string' && id.trim())
    .map(id => {
      const productDir = path.join(root, 'explore', 'designs', id);
      const productJsonPath = path.join(productDir, 'product.json');
      const pagePath = path.join(productDir, 'index.html');
      if (!fs.existsSync(pagePath)) return null;

      let imagePath = '';
      if (fs.existsSync(productJsonPath)) {
        const product = readJson(productJsonPath);
        const images = Array.isArray(product.images) ? product.images : [];
        if (images.length > 0) {
          const firstImage = images[0];
          const baseName = firstImage.replace(/\.[^.]+$/, '');
          imagePath = `/explore/designs/${encodeURIComponent(id)}/${encodeURIComponent(`${baseName}.webp`)}`;
          const webpFile = path.join(productDir, `${baseName}.webp`);
          if (!fs.existsSync(webpFile)) {
            imagePath = `/explore/designs/${encodeURIComponent(id)}/${encodeURIComponent(firstImage)}`;
          }
        }
      }

      return {
        loc: normalizeUrl(`/explore/designs/${id}/`),
        lastmod: latestDateFor(pagePath, productJsonPath),
        image: imagePath,
      };
    })
    .filter(Boolean);
}

function collectBlogUrls() {
  const blogDir = path.join(root, 'blog');
  if (!fs.existsSync(blogDir)) return [];

  return fs
    .readdirSync(blogDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const pagePath = path.join(blogDir, entry.name, 'index.html');
      if (!fs.existsSync(pagePath)) return null;
      return {
        loc: normalizeUrl(`/blog/${entry.name}/`),
        lastmod: latestDateFor(pagePath),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.loc.localeCompare(b.loc));
}

function collectPages() {
  const collected = pageRoots.map(pagePath => {
    const file = pagePath === '/'
      ? path.join(root, 'index.html')
      : path.join(root, pagePath.replace(/^\//, '').replace(/\/$/, ''), 'index.html');

    if (!fs.existsSync(file)) return null;
    return {
      loc: normalizeUrl(pagePath),
      lastmod: latestDateFor(file),
    };
  }).filter(Boolean);

  return [...collected, ...collectProductUrls(), ...collectBlogUrls()];
}

function dedupeByLocation(items) {
  const seen = new Set();
  return items.filter(item => {
    const key = item.loc;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const entries = dedupeByLocation(collectPages()).sort((a, b) => a.loc.localeCompare(b.loc));
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
  ...entries.map(({ loc, lastmod, image }) => `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${xmlEscape(lastmod)}</lastmod>${buildImageTag(image)}\n  </url>`),
  '</urlset>',
].join('\n');

fs.writeFileSync(path.join(root, 'sitemap.xml'), `${xml}\n`);
console.log(`Generated sitemap.xml with ${entries.length} URLs.`);
