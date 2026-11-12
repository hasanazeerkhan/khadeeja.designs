const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['.git', 'node_modules', '.github'].includes(entry.name)) continue;
      walk(full);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.html')) {
      htmlFiles.push(full);
    }
  }
}

walk(root);
const errors = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8');
  const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) continue;
  const head = headMatch[1];
  const trimmed = head.replace(/^\s+/, '');
  if (!trimmed.startsWith('<meta charset=')) {
    errors.push(`${path.relative(root, file)}: missing <meta charset> as the first tag in <head>`);
  }
}

if (!fs.existsSync(path.join(root, 'llms.txt'))) {
  errors.push('llms.txt: missing');
}

if (errors.length) {
  console.error('HTML standards check failed:\n' + errors.join('\n'));
  process.exit(1);
}

console.log(`HTML standards OK for ${htmlFiles.length} files; llms.txt present.`);
