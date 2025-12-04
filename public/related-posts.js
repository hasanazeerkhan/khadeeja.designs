/**
 * Related Posts Engine
 * Shows similar blog posts based on categories and tags
 * 
 * Usage:
 * 1. Ensure blogs.json has category field
 * 2. Call displayRelatedPosts(currentSlug) after loading blog
 * 3. Related posts appear in designated container
 */

// ============ Fetch Blogs Data ============
/**
 * Load blogs.json data
 * @returns {Promise<Array>} Array of blog objects
 */
async function fetchBlogsData() {
  try {
    const response = await fetch('../blogs/blogs.json');
    if (!response.ok) throw new Error('Failed to fetch blogs');
    return await response.json();
  } catch (error) {
    console.error('Error loading blogs:', error);
    return [];
  }
}

// ============ Calculate Relevance Score ============
/**
 * Calculate relevance score between two posts
 * @param {Object} currentPost - Current blog post
 * @param {Object} otherPost - Post to compare
 * @returns {number} Relevance score (0-100)
 */
function calculateRelevanceScore(currentPost, otherPost) {
  let score = 0;

  // Same category: +50 points
  if (currentPost.category === otherPost.category) {
    score += 50;
  }

  // Same tags: +15 points each (max 30)
  if (currentPost.tags && otherPost.tags) {
    const commonTags = currentPost.tags.filter(tag =>
      otherPost.tags.includes(tag)
    );
    score += Math.min(commonTags.length * 15, 30);
  }

  // Similar read time: +10 points
  if (currentPost.readTime && otherPost.readTime) {
    const timeDiff = Math.abs(currentPost.readTime - otherPost.readTime);
    if (timeDiff <= 2) {
      score += 10;
    }
  }

  // Recent posts: +10 points
  if (otherPost.date) {
    const postDate = new Date(otherPost.date);
    const daysSince = Math.floor((new Date() - postDate) / (1000 * 60 * 60 * 24));
    if (daysSince <= 90) {
      score += 10;
    }
  }

  return score;
}

// ============ Get Related Posts ============
/**
 * Get related posts sorted by relevance
 * @param {string} currentSlug - Current post slug
 * @param {Array} allPosts - All blog posts
 * @param {number} limit - Max number of related posts
 * @returns {Array} Related posts sorted by relevance
 */
function getRelatedPosts(currentSlug, allPosts, limit = 3) {
  // Find current post
  const currentPost = allPosts.find(post => post.slug === currentSlug);
  if (!currentPost) return [];

  // Calculate scores for all other posts
  const postsWithScores = allPosts
    .filter(post => post.slug !== currentSlug)
    .map(post => ({
      ...post,
      relevanceScore: calculateRelevanceScore(currentPost, post)
    }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .filter(post => post.relevanceScore > 0) // Only include posts with some relevance
    .slice(0, limit);

  return postsWithScores;
}

// ============ Render Related Posts ============
/**
 * Render related posts in HTML
 * @param {Array} relatedPosts - Array of related post objects
 * @param {string} containerSelector - Target container selector
 */
function renderRelatedPosts(relatedPosts, containerSelector = '#related-posts') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  if (relatedPosts.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8">
        <p class="text-gray-400">No related posts found</p>
      </div>
    `;
    return;
  }

  const html = `
    <div class="space-y-4">
      <h3 class="text-2xl font-bold mb-6">📚 Related Articles</h3>
      <div class="grid grid-cols-1 md:grid-cols-${Math.min(relatedPosts.length, 3)} gap-6">
        ${relatedPosts.map(post => createRelatedPostCard(post)).join('')}
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Add click handlers
  container.querySelectorAll('a.related-link').forEach(link => {
    link.addEventListener('click', (e) => {
      const slug = link.dataset.slug;
      if (slug) {
        trackRelatedPostClick(slug);
      }
    });
  });
}

// ============ Create Related Post Card ============
/**
 * Create HTML for a single related post card
 * @param {Object} post - Post object
 * @returns {string} HTML string
 */
function createRelatedPostCard(post) {
  const imageUrl = post.image.startsWith('/')
    ? post.image
    : `../${post.image}`;

  const categoryBadge = post.category
    ? `<span class="inline-block bg-pink-900/50 text-pink-200 text-xs font-semibold px-3 py-1 rounded">${post.category}</span>`
    : '';

  return `
    <article class="bg-neutral-800/50 rounded-lg overflow-hidden hover:bg-neutral-800 transition-colors duration-300">
      <div class="relative h-40 overflow-hidden group">
        <img
          src="${imageUrl}"
          alt="${post.title}"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onerror="this.src='../public/placeholder.jpg'"
        />
      </div>
      
      <div class="p-4 space-y-3">
        ${categoryBadge}
        
        <h4 class="font-semibold text-lg line-clamp-2">
          ${post.title}
        </h4>
        
        <p class="text-sm text-gray-400 line-clamp-2">
          ${post.excerpt || post.title}
        </p>
        
        <div class="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-700">
          <span>📅 ${formatDate(post.date)}</span>
          <span>⏱️ ${post.readTime || 5} min read</span>
        </div>
        
        <a
          href="blogs.html?post=${post.slug}"
          data-slug="${post.slug}"
          class="related-link block w-full mt-4 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded transition-colors text-center"
        >
          Read Article →
        </a>
      </div>
    </article>
  `;
}

// ============ Date Formatter ============
/**
 * Format date to readable string
 * @param {string} dateString - Date string
 * @returns {string} Formatted date
 */
function formatDate(dateString) {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

// ============ Track Related Post Clicks ============
/**
 * Send analytics event for related post click
 * @param {string} slug - Post slug
 */
function trackRelatedPostClick(slug) {
  if (window.trackEvent) {
    window.trackEvent('related_post_click', {
      related_post_slug: slug,
      location: 'bottom_of_article'
    });
  }
}

// ============ Display Related Posts ============
/**
 * Main function to fetch and display related posts
 * @param {string} currentSlug - Current post slug
 * @param {string} containerSelector - Container for related posts
 */
async function displayRelatedPosts(
  currentSlug,
  containerSelector = '#related-posts'
) {
  try {
    // Show loading state
    const container = document.querySelector(containerSelector);
    if (container) {
      container.innerHTML = `
        <div class="flex items-center justify-center py-8">
          <svg class="animate-spin h-6 w-6 text-pink-600" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      `;
    }

    // Fetch blogs
    const allPosts = await fetchBlogsData();

    // Get related posts
    const relatedPosts = getRelatedPosts(currentSlug, allPosts, 3);

    // Render
    renderRelatedPosts(relatedPosts, containerSelector);

    console.log(`Loaded ${relatedPosts.length} related posts for: ${currentSlug}`);

  } catch (error) {
    console.error('Error displaying related posts:', error);
    const container = document.querySelector(containerSelector);
    if (container) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-400">
          <p>Unable to load related posts</p>
        </div>
      `;
    }
  }
}

// ============ Initialize Related Posts ============
/**
 * Auto-initialize related posts if on blog page
 */
function initializeRelatedPosts() {
  // Check if this is a blog post page
  const urlParams = new URLSearchParams(window.location.search);
  const postSlug = urlParams.get('post');

  if (postSlug && document.querySelector('#related-posts')) {
    // Wait for page to fully load, then display related posts
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        displayRelatedPosts(postSlug);
      });
    } else {
      // Add small delay to ensure blog content is rendered
      setTimeout(() => {
        displayRelatedPosts(postSlug);
      }, 500);
    }
  }
}

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeRelatedPosts);
} else {
  initializeRelatedPosts();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    fetchBlogsData,
    calculateRelevanceScore,
    getRelatedPosts,
    renderRelatedPosts,
    createRelatedPostCard,
    formatDate,
    trackRelatedPostClick,
    displayRelatedPosts,
    initializeRelatedPosts
  };
}
