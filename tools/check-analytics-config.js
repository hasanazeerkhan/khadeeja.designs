const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const configPath = path.join(root, 'site-config.json');

function parseConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    throw new Error(`Could not read site-config.json: ${error.message}`);
  }
}

function isPlaceholder(value) {
  if (typeof value !== 'string') return false;
  const normalized = value.trim();
  if (!normalized) return false;
  return /(?:XXX|xxxx|todo|placeholder|example|test|sample|change-me|000000|123456)/i.test(normalized);
}

const config = parseConfig();
const analytics = config.analytics || {};
const issues = [];

for (const [key, value] of Object.entries({
  gaMeasurementId: analytics.gaMeasurementId,
  metaPixelId: analytics.metaPixelId
})) {
  if (typeof value === 'string' && value.trim() && isPlaceholder(value)) {
    issues.push(`${key} contains a placeholder value: ${value}`);
  }
}

if (issues.length) {
  console.error('Analytics config failed validation:\n' + issues.join('\n'));
  process.exit(1);
}

console.log('Analytics config OK: no placeholder IDs detected.');
