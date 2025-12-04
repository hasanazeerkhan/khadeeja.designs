/**
 * Blog Table of Contents Generator
 * Auto-generates TOC from markdown headings with jump links
 * 
 * Usage:
 * 1. Call generateTableOfContents() after rendering markdown
 * 2. It will create TOC from h2-h4 headings
 * 3. Auto-scrolls to sections with smooth animation
 */

// ============ Generate TOC from Headings ============
/**
 * Generate table of contents from existing h2-h4 headings
 * @param {string} contentSelector - Selector of content container
 * @param {string} tocSelector - Selector of TOC container
 */
function generateTableOfContents(contentSelector = '#blog-content', tocSelector = '#toc-container') {
  const contentEl = document.querySelector(contentSelector);
  const tocEl = document.querySelector(tocSelector);

  if (!contentEl || !tocEl) {
    console.warn('Content or TOC container not found');
    return;
  }

  // Get all headings h2-h4
  const headings = contentEl.querySelectorAll('h2, h3, h4');
  
  if (headings.length === 0) {
    tocEl.innerHTML = '<p class="text-sm text-gray-400">No sections available</p>';
    return;
  }

  // Create TOC structure
  const toc = document.createElement('nav');
  toc.className = 'space-y-1';
  toc.setAttribute('aria-label', 'Table of Contents');

  let currentLevel = 0;
  let list = null;
  const lists = {};

  headings.forEach((heading, index) => {
    // Assign ID if not present
    if (!heading.id) {
      heading.id = `section-${index}`;
    }

    const level = parseInt(heading.tagName[1]); // 2, 3, or 4
    const text = heading.textContent;

    // Create link
    const link = document.createElement('a');
    link.href = `#${heading.id}`;
    link.className = 'text-sm transition-colors duration-200 hover:text-pink-400 block py-1';
    link.textContent = text;

    // Add scroll behavior
    link.addEventListener('click', (e) => {
      e.preventDefault();
      scrollToSection(heading.id);
    });

    // Handle nesting (h2 = level 1, h3 = level 2, h4 = level 3)
    const nestLevel = level - 2;

    if (nestLevel > currentLevel) {
      // Create new nested list
      for (let i = currentLevel; i < nestLevel; i++) {
        const newList = document.createElement('ul');
        newList.className = 'ml-4 space-y-1 border-l border-gray-700 pl-2';
        
        if (list) {
          const lastItem = list.lastElementChild;
          if (lastItem) {
            lastItem.appendChild(newList);
          }
        } else {
          toc.appendChild(newList);
        }
        
        list = newList;
        lists[i] = newList;
      }
      currentLevel = nestLevel;
    } else if (nestLevel < currentLevel) {
      // Go up nesting levels
      list = lists[nestLevel];
      currentLevel = nestLevel;
    }

    const item = document.createElement('li');
    item.appendChild(link);
    
    if (list) {
      list.appendChild(item);
    } else {
      toc.appendChild(item);
    }
  });

  // Add collapse/expand toggle for mobile
  const toggle = document.createElement('button');
  toggle.className = 'w-full text-left text-sm font-semibold mb-4 p-3 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors lg:hidden flex items-center justify-between';
  toggle.innerHTML = '📋 Table of Contents <svg class="w-4 h-4 transition-transform" id="toc-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 12 15 18 9"></polyline></svg>';
  
  const tocContainer = document.createElement('div');
  tocContainer.id = 'toc-wrapper';
  tocContainer.className = 'bg-gray-900/50 rounded-lg p-4 mb-8 max-h-96 overflow-y-auto hidden lg:block';
  tocContainer.appendChild(toc);

  // Mobile collapse toggle
  toggle.addEventListener('click', () => {
    tocContainer.classList.toggle('hidden');
    document.getElementById('toc-toggle-icon').style.transform = 
      tocContainer.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
  });

  // Clear and insert
  tocEl.innerHTML = '';
  tocEl.appendChild(toggle);
  tocEl.appendChild(tocContainer);

  console.log(`Generated TOC with ${headings.length} sections`);
}

// ============ Smooth Scroll to Section ============
/**
 * Smooth scroll to heading with highlight
 * @param {string} headingId - ID of heading to scroll to
 */
function scrollToSection(headingId) {
  const heading = document.getElementById(headingId);
  if (!heading) return;

  // Scroll into view
  heading.scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Highlight section
  highlightSection(heading);
}

// ============ Highlight Section ============
/**
 * Flash highlight effect on section
 * @param {HTMLElement} element - Element to highlight
 */
function highlightSection(element) {
  // Remove existing highlight
  document.querySelectorAll('.toc-highlight').forEach(el => {
    el.classList.remove('toc-highlight');
  });

  // Add highlight
  element.classList.add('toc-highlight');
  
  // Remove after animation
  setTimeout(() => {
    element.classList.remove('toc-highlight');
  }, 2000);
}

// ============ Active Section Tracking ============
/**
 * Track which section is currently visible and update TOC
 * @param {string} tocSelector - Selector of TOC container
 */
function trackActiveSection(tocSelector = '#toc-container') {
  const tocContainer = document.querySelector(tocSelector);
  if (!tocContainer) return;

  const headings = document.querySelectorAll('#blog-content h2, #blog-content h3, #blog-content h4');
  if (headings.length === 0) return;

  // Use Intersection Observer for performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = tocContainer.querySelector(`a[href="#${entry.target.id}"]`);
      if (!link) return;

      if (entry.isIntersecting) {
        // Remove active from all
        tocContainer.querySelectorAll('a').forEach(a => {
          a.classList.remove('text-pink-400', 'font-semibold');
          a.classList.add('text-gray-400');
        });
        
        // Add active to current
        link.classList.add('text-pink-400', 'font-semibold');
        link.classList.remove('text-gray-400');

        // Scroll TOC to visible area
        link.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    });
  }, {
    rootMargin: '0px 0px -66% 0px',
    threshold: 0
  });

  headings.forEach(heading => observer.observe(heading));
}

// ============ Insert Styles for TOC ============
/**
 * Add CSS for table of contents
 */
function insertTocStyles() {
  if (document.getElementById('toc-styles')) return; // Already inserted

  const style = document.createElement('style');
  style.id = 'toc-styles';
  style.textContent = `
    /* TOC Styles */
    .toc-highlight {
      animation: tocHighlight 0.5s ease-in-out;
      background-color: rgba(236, 72, 153, 0.1) !important;
    }

    @keyframes tocHighlight {
      0% {
        background-color: rgba(236, 72, 153, 0.3);
      }
      50% {
        background-color: rgba(236, 72, 153, 0.2);
      }
      100% {
        background-color: rgba(236, 72, 153, 0.1);
      }
    }

    #toc-wrapper a:active {
      transform: scale(0.98);
    }

    @media (max-width: 1024px) {
      #toc-wrapper {
        max-height: 300px;
        margin-bottom: 1rem;
      }
    }

    #toc-toggle-icon {
      transition: transform 0.3s ease;
    }

    /* Smooth scrolling */
    html {
      scroll-behavior: smooth;
    }
  `;
  
  document.head.appendChild(style);
}

// ============ Full TOC Setup ============
/**
 * Complete TOC setup: generate, style, and track
 * @param {string} contentSelector - Selector of content container
 * @param {string} tocSelector - Selector of TOC container
 */
function setupTableOfContents(contentSelector = '#blog-content', tocSelector = '#toc-container') {
  // Insert styles
  insertTocStyles();

  // Generate TOC
  generateTableOfContents(contentSelector, tocSelector);

  // Track active section
  trackActiveSection(tocSelector);

  // Regenerate on window resize (for responsive changes)
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      generateTableOfContents(contentSelector, tocSelector);
      trackActiveSection(tocSelector);
    }, 250);
  });

  console.log('Table of Contents initialized');
}

// ============ Initialize on DOM Ready ============
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    // Check if on blog page and TOC container exists
    if (document.querySelector('#toc-container') && document.querySelector('#blog-content')) {
      setupTableOfContents();
    }
  });
} else {
  if (document.querySelector('#toc-container') && document.querySelector('#blog-content')) {
    setupTableOfContents();
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    generateTableOfContents,
    scrollToSection,
    highlightSection,
    trackActiveSection,
    insertTocStyles,
    setupTableOfContents
  };
}
