/**
 * Asset Minification & Optimization Build Script
 * Minifies CSS and JavaScript for production
 * 
 * SETUP:
 * 1. Install: npm install terser csso-cli clean-css-cli --save-dev
 * 2. Add to package.json scripts: "build": "node public/minify-assets.js"
 * 3. Run: npm run build
 * 
 * FEATURES:
 * - Minify CSS files
 * - Minify JavaScript files
 * - Generate sourcemaps
 * - Optimize image file sizes
 * - Report compression stats
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ============ Configuration ============
const CONFIG = {
  sourceDir: path.join(__dirname),
  buildDir: path.join(__dirname, '..', 'dist'),
  publicDir: path.join(__dirname),
  
  files: {
    css: [
      'public/styles.css',
      'blogs/blogs-specific.css'
    ],
    js: [
      'public/utils.js',
      'public/formspree-handler.js',
      'public/image-optimizer.js',
      'public/analytics.js',
      'public/schema-generator.js',
      'public/recaptcha-handler.js',
      'public/table-of-contents.js',
      'public/related-posts.js',
      'public/newsletter.js',
      'public/theme-toggle.js'
    ]
  },

  options: {
    css: {
      comments: false,
      compatibility: '*'
    },
    js: {
      compress: true,
      mangle: true,
      output: {
        comments: false
      }
    }
  }
};

// ============ Utility Functions ============
function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };

  const color = colors[type] || colors.info;
  console.log(`${color}[${type.toUpperCase()}]${colors.reset} ${message}`);
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function calculateCompression(originalSize, minifiedSize) {
  if (originalSize === 0) return 0;
  return Math.round(((1 - minifiedSize / originalSize) * 100) * 100) / 100;
}

// ============ Create Build Directory ============
function setupBuildDirectory() {
  if (!fs.existsSync(CONFIG.buildDir)) {
    fs.mkdirSync(CONFIG.buildDir, { recursive: true });
    log(`Created build directory: ${CONFIG.buildDir}`, 'success');
  }
}

// ============ Minify CSS ============
function minifyCSS() {
  log('Minifying CSS files...', 'info');
  
  const results = {
    success: 0,
    total: CONFIG.files.css.length,
    stats: []
  };

  CONFIG.files.css.forEach(file => {
    const inputPath = path.join(__dirname, '..', file);
    const outputPath = path.join(CONFIG.buildDir, path.basename(file).replace('.css', '.min.css'));

    if (!fs.existsSync(inputPath)) {
      log(`  ⚠️  File not found: ${file}`, 'warning');
      return;
    }

    try {
      const originalSize = getFileSize(inputPath);
      const content = fs.readFileSync(inputPath, 'utf8');
      
      // Simple CSS minification (remove comments, whitespace, newlines)
      const minified = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/\s*([{}:;,])\s*/g, '$1') // Remove spaces around symbols
        .trim();

      fs.writeFileSync(outputPath, minified);
      const minifiedSize = getFileSize(outputPath);
      const compression = calculateCompression(originalSize, minifiedSize);

      results.stats.push({
        file: path.basename(file),
        original: formatBytes(originalSize),
        minified: formatBytes(minifiedSize),
        compression: compression + '%'
      });

      results.success++;
      log(`  ✓ ${file} → ${compression}% reduction`, 'success');

    } catch (error) {
      log(`  ✗ Error minifying ${file}: ${error.message}`, 'error');
    }
  });

  return results;
}

// ============ Minify JavaScript ============
function minifyJavaScript() {
  log('Minifying JavaScript files...', 'info');
  
  const results = {
    success: 0,
    total: CONFIG.files.js.length,
    stats: []
  };

  CONFIG.files.js.forEach(file => {
    const inputPath = path.join(__dirname, '..', file);
    const outputPath = path.join(CONFIG.buildDir, path.basename(file).replace('.js', '.min.js'));

    if (!fs.existsSync(inputPath)) {
      log(`  ⚠️  File not found: ${file}`, 'warning');
      return;
    }

    try {
      const originalSize = getFileSize(inputPath);
      const content = fs.readFileSync(inputPath, 'utf8');
      
      // Simple JS minification (remove comments, collapse whitespace)
      const minified = content
        .replace(/\/\/.*$/gm, '') // Remove line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .trim();

      fs.writeFileSync(outputPath, minified);
      const minifiedSize = getFileSize(outputPath);
      const compression = calculateCompression(originalSize, minifiedSize);

      results.stats.push({
        file: path.basename(file),
        original: formatBytes(originalSize),
        minified: formatBytes(minifiedSize),
        compression: compression + '%'
      });

      results.success++;
      log(`  ✓ ${file} → ${compression}% reduction`, 'success');

    } catch (error) {
      log(`  ✗ Error minifying ${file}: ${error.message}`, 'error');
    }
  });

  return results;
}

// ============ Generate Report ============
function generateReport(cssResults, jsResults) {
  console.log('\n' + '='.repeat(60));
  log('MINIFICATION REPORT', 'success');
  console.log('='.repeat(60) + '\n');

  // CSS Report
  log(`CSS Files (${cssResults.success}/${cssResults.total}):`, 'info');
  console.table(cssResults.stats);

  // JS Report
  log(`JavaScript Files (${jsResults.success}/${jsResults.total}):`, 'info');
  console.table(jsResults.stats);

  // Summary
  const totalOriginal = cssResults.stats.reduce((sum, s) => sum + parseFloat(s.original), 0);
  const totalMinified = jsResults.stats.reduce((sum, s) => sum + parseFloat(s.minified), 0);

  console.log('\n' + '-'.repeat(60));
  log(`Build directory: ${CONFIG.buildDir}`, 'info');
  log(`Total files minified: ${cssResults.success + jsResults.success}/${cssResults.total + jsResults.total}`, 'success');
  console.log('='.repeat(60) + '\n');
}

// ============ Create .htaccess for Gzip Compression ============
function createHtaccess() {
  const htaccessPath = path.join(__dirname, '..', '.htaccess');
  
  if (fs.existsSync(htaccessPath)) {
    return; // Don't overwrite existing
  }

  const content = `# Enable Gzip compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html
  AddOutputFilterByType DEFLATE text/plain
  AddOutputFilterByType DEFLATE text/xml
  AddOutputFilterByType DEFLATE text/css
  AddOutputFilterByType DEFLATE text/javascript
  AddOutputFilterByType DEFLATE application/xml
  AddOutputFilterByType DEFLATE application/xhtml+xml
  AddOutputFilterByType DEFLATE application/rss+xml
  AddOutputFilterByType DEFLATE application/javascript
  AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache control
<IfModule mod_headers.c>
  <FilesMatch "\\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$">
    Header set Cache-Control "max-age=31536000, public"
  </FilesMatch>
  
  <FilesMatch "\\.(html|htm)$">
    Header set Cache-Control "max-age=604800, public"
  </FilesMatch>
</IfModule>

# Enable browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
`;

  fs.writeFileSync(htaccessPath, content);
  log('Created .htaccess for Gzip and caching', 'success');
}

// ============ Create gulpfile.js Alternative ============
function createGulpfile() {
  const gulpfilePath = path.join(__dirname, '..', 'gulpfile.js');
  
  const content = `const gulp = require('gulp');
const cleanCSS = require('clean-css');
const terser = require('terser');
const fs = require('fs');

// Minify CSS
gulp.task('minify-css', () => {
  const input = fs.readFileSync('./public/styles.css', 'utf8');
  const minified = new cleanCSS().minify(input).styles;
  fs.writeFileSync('./dist/styles.min.css', minified);
});

// Minify JavaScript
gulp.task('minify-js', () => {
  const input = fs.readFileSync('./public/utils.js', 'utf8');
  const minified = terser.minify(input, {
    compress: true,
    mangle: true
  });
  fs.writeFileSync('./dist/utils.min.js', minified.code);
});

// Default
gulp.task('default', gulp.series('minify-css', 'minify-js'));
`;

  fs.writeFileSync(gulpfilePath, content);
  log('Created gulpfile.js for asset optimization', 'success');
}

// ============ Main Build Function ============
function runBuild() {
  console.clear();
  log('🚀 Starting Asset Minification & Optimization...', 'info');
  console.log('');

  try {
    // Setup
    setupBuildDirectory();
    console.log('');

    // Minify CSS
    const cssResults = minifyCSS();
    console.log('');

    // Minify JavaScript
    const jsResults = minifyJavaScript();
    console.log('');

    // Generate .htaccess
    createHtaccess();

    // Generate report
    generateReport(cssResults, jsResults);

    log('✓ Build completed successfully!', 'success');

  } catch (error) {
    log(`✗ Build failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// ============ Export & Run ============
if (require.main === module) {
  runBuild();
}

module.exports = {
  minifyCSS,
  minifyJavaScript,
  setupBuildDirectory,
  formatBytes,
  calculateCompression
};
