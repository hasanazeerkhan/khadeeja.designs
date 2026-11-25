#!/usr/bin/env node
/**
 * Netlify build: sync every generated block, run the checks (a failure stops the deploy),
 * then copy only public files into dist/. README, scripts, tools, reports and config stay private.
 *
 *   node tools/build.js            full build into dist/
 *   node tools/build.js --no-dist  sync + checks only (used in CI before committing)
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const run = (file, ...args) => {
  console.log(`\n▶ node ${file} ${args.join(' ')}`.trimEnd());
  execFileSync(process.execPath, [path.join(root, file), ...args], { cwd: root, stdio: 'inherit' });
};

// 1. Generate: one source of truth → static HTML
run('scripts/sync-meta.js');           // titles, descriptions, canonicals from seo-meta.json / product.json
run('tools/sync-reply-window.js');
run('tools/sync-site.js');
run('tools/generate-sitemap.js');
run('tools/generate-llms-full.js');

// 2. Gate: any error here exits non-zero and Netlify keeps the previous deploy live
run('scripts/check-meta.js');
run('seo-compliance.js');
run('tools/check-html-standards.js');
run('tools/check-analytics-config.js');
run('scripts/check-prices.js');

if (process.argv.includes('--no-dist')) process.exit(0);

// 3. Publish only what visitors need
const PRIVATE = new Set([
  '.git', '.github', '.gitignore', 'node_modules', 'dist', 'scripts', 'tools', 'ScreemingFrogResults',
  'README.md', 'SEO-IMPLEMENTATION-REPORT.md', 'netlify.toml', 'package.json', 'package-lock.json',
  'seo-compliance.js', 'seo-meta.json', 'seo-check.json', 'out.json', 'out-content.json', 'site-config.json',
]);
fs.rmSync(dist, { recursive: true, force: true });
let files = 0;
(function copy(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (from === root && PRIVATE.has(entry.name)) continue;
    const src = path.join(from, entry.name);
    const dest = path.join(to, entry.name);
    if (entry.isDirectory()) copy(src, dest);
    else { fs.copyFileSync(src, dest); files += 1; }
  }
})(root, dist);
console.log(`\n✔ Copied ${files} public files to dist/`);
