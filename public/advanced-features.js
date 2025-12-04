/**
 * Advanced Features: Search & RSS Feed
 * Adds blog search functionality and RSS feed generation
 */

// ============ PART 1: BLOG SEARCH ENGINE ============

/**
 * Search blogs by title, excerpt, or content
 * @param {string} query - Search query
 * @param {Array} blogs - Array of blog objects
 * @returns {Array} Matching blog posts
 */
function searchBlogs(query, blogs) {
  if (!query || query.trim().length < 2) return [];

  const normalizedQuery = query.toLowerCase().trim();
  
  return blogs.filter(blog => {
    const titleMatch = blog.title.toLowerCase().includes(normalizedQuery);
    const excerptMatch = (blog.excerpt || '').toLowerCase().includes(normalizedQuery);
    const categoryMatch = (blog.category || '').toLowerCase().includes(normalizedQuery);
    const tagsMatch = (blog.tags || []).some(tag => 
      tag.toLowerCase().includes(normalizedQuery)
    );

    return titleMatch || excerptMatch || categoryMatch || tagsMatch;
  });
}

/**
 * Create search input UI
 * @returns {string} HTML string
 */
function createSearchUI() {
  return `
    <div class="search-container mb-8 space-y-4">
      <div class="relative">
        <input
          type="text"
          id="blog-search-input"
          placeholder="🔍 Search articles..."
          class="w-full px-4 py-3 bg-neutral-900 border border-gray-700 rounded-lg focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20 text-white placeholder-gray-500"
        />
        <button
          id="search-clear-btn"
          class="absolute right-3 top-3 text-gray-500 hover:text-gray-300 hidden"
          title="Clear search"
        >
          ✕
        </button>
      </div>
      <div id="search-results" class="text-sm text-gray-400"></div>
    </div>
  `;
}

/**
 * Setup blog search functionality
 * @param {string} inputSelector - Search input selector
 * @param {string} resultsSelector - Results display selector
 * @param {Array} blogs - Blog data
 */
function setupBlogSearch(inputSelector = '#blog-search-input', resultsSelector = '#search-results', blogs = null) {
  const input = document.querySelector(inputSelector);
  const results = document.querySelector(resultsSelector);
  
  if (!input) return;

  // Load blogs if not provided
  if (!blogs) {
    fetch('../blogs/blogs.json')
      .then(res => res.json())
      .then(data => {
        input.dataset.blogs = JSON.stringify(data);
        setupSearchHandlers(input, results);
      });
  } else {
    input.dataset.blogs = JSON.stringify(blogs);
    setupSearchHandlers(input, results);
  }
}

/**
 * Attach search event handlers
 */
function setupSearchHandlers(input, results) {
  const clearBtn = document.getElementById('search-clear-btn');

  input.addEventListener('input', (e) => {
    const query = e.target.value;
    const blogs = JSON.parse(input.dataset.blogs);
    
    if (query.length < 2) {
      results.innerHTML = '';
      clearBtn.classList.add('hidden');
      return;
    }

    clearBtn.classList.remove('hidden');
    const matches = searchBlogs(query, blogs);
    displaySearchResults(matches, results);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      results.innerHTML = '';
      clearBtn.classList.add('hidden');
      input.focus();
    });
  }
}

/**
 * Display search results
 */
function displaySearchResults(matches, container) {
  if (matches.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No articles found. Try different keywords.</p>';
    return;
  }

  const html = `
    <p class="text-gray-400">Found ${matches.length} result${matches.length !== 1 ? 's' : ''}</p>
    <ul class="mt-2 space-y-2 max-h-60 overflow-y-auto">
      ${matches.map(blog => `
        <li>
          <a
            href="blogs.html?post=${blog.slug}"
            class="block p-2 rounded hover:bg-neutral-800/50 transition-colors"
          >
            <div class="font-semibold text-pink-400">${blog.title}</div>
            <div class="text-xs text-gray-500">${blog.category || 'Article'} • ${blog.readTime || 5} min read</div>
          </a>
        </li>
      `).join('')}
    </ul>
  `;
  
  container.innerHTML = html;
}

// ============ PART 2: RSS FEED GENERATION ============

/**
 * Generate RSS feed from blogs
 * @param {Array} blogs - Blog data
 * @returns {string} RSS XML
 */
function generateRSSFeed(blogs) {
  const siteUrl = 'https://khadeejadesigns.com';
  const feedUrl = `${siteUrl}/feed.xml`;
  const currentDate = new Date().toISOString();

  // Sort blogs by date (newest first)
  const sortedBlogs = [...blogs].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  ).slice(0, 20); // Last 20 posts

  let itemsXml = sortedBlogs.map(blog => `
    <item>
      <title><![CDATA[${escapeXml(blog.title)}]]></title>
      <link>${siteUrl}/blogs/blogs.html?post=${blog.slug}</link>
      <guid>${siteUrl}/blogs/${blog.slug}</guid>
      <description><![CDATA[${escapeXml(blog.excerpt || blog.title)}]]></description>
      <pubDate>${new Date(blog.date).toUTCString()}</pubDate>
      <category>${blog.category || 'Article'}</category>
      ${blog.image ? `<image url="${siteUrl}/${blog.image}" />` : ''}
    </item>
  `).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Khadeeja Designs Blog</title>
    <link>${siteUrl}</link>
    <description>Hand-stitched Aari embroidery - Tips, trends, and techniques</description>
    <language>en-us</language>
    <lastBuildDate>${currentDate}</lastBuildDate>
    <image>
      <title>Khadeeja Designs</title>
      <url>${siteUrl}/public/logo.png</url>
      <link>${siteUrl}</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

  return rss;
}

/**
 * Escape XML special characters
 */
function escapeXml(str) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
  };
  return str.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Create RSS feed file (for backend)
 * Node.js/Express example:
 * 
 * app.get('/feed.xml', async (req, res) => {
 *   const blogs = require('./blogs/blogs.json');
 *   const rss = generateRSSFeed(blogs);
 *   res.type('application/rss+xml');
 *   res.send(rss);
 * });
 */

/**
 * Add RSS link to page head
 */
function addRSSLink() {
  // Check if already added
  if (document.querySelector('link[rel="alternate"][type="application/rss+xml"]')) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'alternate';
  link.type = 'application/rss+xml';
  link.title = 'Khadeeja Designs Blog Feed';
  link.href = '/feed.xml';
  
  document.head.appendChild(link);
  console.log('RSS feed link added to page');
}

// ============ PART 3: SITEMAP GENERATION ============

/**
 * Generate XML sitemap from blogs
 * @param {Array} blogs - Blog data
 * @returns {string} Sitemap XML
 */
function generateSitemap(blogs) {
  const baseUrl = 'https://khadeejadesigns.com';
  const urls = [
    { loc: baseUrl, priority: '1.0', changefreq: 'daily' },
    { loc: `${baseUrl}/blogs`, priority: '0.9', changefreq: 'weekly' }
  ];

  // Add blog posts
  blogs.forEach(blog => {
    urls.push({
      loc: `${baseUrl}/blogs/blogs.html?post=${blog.slug}`,
      priority: '0.8',
      changefreq: 'monthly',
      lastmod: blog.date
    });
  });

  let urlsXml = urls.map(url => `
    <url>
      <loc>${url.loc}</loc>
      <priority>${url.priority}</priority>
      <changefreq>${url.changefreq}</changefreq>
      ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}
    </url>
  `).join('\n');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urlsXml}
</urlset>`;

  return sitemap;
}

// ============ PART 4: INITIALIZE ALL FEATURES ============

/**
 * Initialize all additional features
 */
async function initializeAdditionalFeatures() {
  try {
    // Load blogs
    const blogsResponse = await fetch('../blogs/blogs.json');
    const blogs = await blogsResponse.json();

    // Initialize search
    const searchInput = document.querySelector('#blog-search-input');
    if (searchInput) {
      setupBlogSearch('#blog-search-input', '#search-results', blogs);
    }

    // Add RSS link
    addRSSLink();

    // Log features initialized
    console.log('Additional features initialized (search, RSS, sitemap)');

  } catch (error) {
    console.error('Error initializing additional features:', error);
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAdditionalFeatures);
} else {
  initializeAdditionalFeatures();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    searchBlogs,
    createSearchUI,
    setupBlogSearch,
    displaySearchResults,
    generateRSSFeed,
    escapeXml,
    addRSSLink,
    generateSitemap,
    initializeAdditionalFeatures
  };
}
