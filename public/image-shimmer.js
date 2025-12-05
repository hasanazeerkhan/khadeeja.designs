/**
 * Image Shimmer Loader
 * Adds shimmer effect to images while they load
 */

document.addEventListener('DOMContentLoaded', function() {
  initImageShimmer();
});

function initImageShimmer() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Add loading class initially
    img.classList.add('loading');
    
    // Remove loading class when image loads
    img.addEventListener('load', function() {
      this.classList.remove('loading');
    });
    
    // Also remove on error
    img.addEventListener('error', function() {
      this.classList.remove('loading');
    });
    
    // Handle cached images (check if already loaded)
    if (img.complete) {
      img.classList.remove('loading');
    }
  });

  // For dynamically added images (like in blog posts), use MutationObserver
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          if (node.tagName === 'IMG') {
            node.classList.add('loading');
            node.addEventListener('load', function() {
              this.classList.remove('loading');
            });
            node.addEventListener('error', function() {
              this.classList.remove('loading');
            });
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Look for images within added content
            const childImages = node.querySelectorAll('img');
            childImages.forEach(img => {
              if (!img.complete) {
                img.classList.add('loading');
                img.addEventListener('load', function() {
                  this.classList.remove('loading');
                });
              } else {
                img.classList.remove('loading');
              }
            });
          }
        });
      }
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}
