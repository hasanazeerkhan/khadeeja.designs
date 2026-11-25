#!/usr/bin/env node
/**
 * Regenerates llms-full.txt from the indexable pages, so the AI-readable copy never drifts from the site.
 * Usage: node tools/generate-llms-full.js   (run after sync-site.js)
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const SITE = 'https://khadeejadesigns.in';
const SKIP = new Set(['.git', '.github', 'node_modules', 'dist', 'scripts', 'tools', 'ScreemingFrogResults']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) { if (!SKIP.has(e.name)) walk(path.join(dir, e.name), out); }
    else if (e.name === 'index.html') out.push(path.join(dir, e.name));
  }
  return out;
}

const decode = s => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));

function toText(mainHtml) {
  let s = mainHtml
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<!--[\s\S]*?-->/g, '')
    .replace(/<(nav|button|svg|figure|picture|form)\b[\s\S]*?<\/\1>/g, '')
    .replace(/<div class="breadcrumbs[^"]*"[\s\S]*?<\/ol>\s*<\/div>/g, '');
  s = s.replace(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g, '\n\n# $1\n\n')
    .replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g, '\n\n## $1\n\n')
    .replace(/<h3\b[^>]*>([\s\S]*?)<\/h3>/g, '\n\n### $1\n\n')
    .replace(/<summary\b[^>]*>([\s\S]*?)<\/summary>/g, '\n\n### $1\n\n')
    .replace(/<li\b[^>]*>/g, '\n- ')
    .replace(/<tr\b[^>]*>/g, '\n- ').replace(/<\/t[hd]>/g, ' | ')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<\/(p|div|section|article|blockquote|figcaption|ul|ol|details|table|caption)>/g, '\n\n')
    .replace(/<[^>]+>/g, '');
  return decode(s).split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

const pages = walk(root)
  .map(abs => {
    const html = fs.readFileSync(abs, 'utf8');
    if (/<meta name="robots" content="[^"]*noindex/i.test(html)) return null;
    const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
    const title = decode(html.match(/<title>([\s\S]*?)<\/title>/)?.[1] || '').trim();
    const start = html.indexOf('<main'); const end = html.indexOf('</main>');
    if (!canonical || start < 0 || end < 0) return null;
    return { url: canonical, title, text: toText(html.slice(html.indexOf('>', start) + 1, end)) };
  })
  .filter(Boolean)
  .sort((a, b) => a.url.localeCompare(b.url));

const out = [
  '# Khadeeja Designs - Full Site Content',
  '',
  `> Full-text export of the public website for AI assistants and crawlers, generated from the live pages at build time. The canonical source pages are linked below. Key facts are in ${SITE}/llms.txt.`,
  '',
  '## Contents',
  '',
  ...pages.map(p => `- [${p.title}](${p.url})`),
  '',
  ...pages.flatMap(p => ['---', '', `## [${p.title}](${p.url})`, '', `Source: ${p.url}`, '', p.text, '']),
].join('\n');

fs.writeFileSync(path.join(root, 'llms-full.txt'), `${out}\n`);
console.log(`Generated llms-full.txt from ${pages.length} pages.`);
