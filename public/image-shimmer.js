/**
 * Image Shimmer Loader
 * Adds shimmer effect to images while they load
 * The image itself is hidden during loading, showing only the shimmer placeholder
 */

document.addEventListener('DOMContentLoaded', function() {
  initImageShimmer();
});

function initImageShimmer() {
  const images = document.querySelectorAll('img');
  
  images.forEach(img => {
    // Skip images that are already complete (cached)
    if (img.complete) {
      return;
    }
    
    // Create shimmer placeholder
    const shimmerDiv = createShimmerPlaceholder(img);
    
    // Insert shimmer div before the image
    img.parentNode.insertBefore(shimmerDiv, img);
    
    // Hide the actual image while loading
    img.style.display = 'none';
    img.classList.add('loading');
    
    // When image loads, show it and remove shimmer
    img.addEventListener('load', function() {
      this.style.display = '';
      this.classList.remove('loading');
      if (shimmerDiv.parentNode) {
        shimmerDiv.remove();
      }
    });
    
    // On error, show error state
    img.addEventListener('error', function() {
      this.style.display = '';
      this.classList.remove('loading');
      if (shimmerDiv.parentNode) {
        shimmerDiv.remove();
      }
    });
  });

  // For dynamically added images (like in blog posts), use MutationObserver
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach(function(node) {
          if (node.tagName === 'IMG') {
            processImage(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Look for images within added content
            const childImages = node.querySelectorAll('img');
            childImages.forEach(processImage);
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

function processImage(img) {
  // Skip if already complete
  if (img.complete) {
    return;
  }
  
  // Create shimmer placeholder
  const shimmerDiv = createShimmerPlaceholder(img);
  
  // Insert shimmer div before the image
  img.parentNode.insertBefore(shimmerDiv, img);
  
  // Hide the actual image while loading
  img.style.display = 'none';
  img.classList.add('loading');
  
  // When image loads, show it and remove shimmer
  img.addEventListener('load', function() {
    this.style.display = '';
    this.classList.remove('loading');
    if (shimmerDiv.parentNode) {
      shimmerDiv.remove();
    }
  });
  
  // On error, show error state
  img.addEventListener('error', function() {
    this.style.display = '';
    this.classList.remove('loading');
    if (shimmerDiv.parentNode) {
      shimmerDiv.remove();
    }
  });
}

function createShimmerPlaceholder(img) {
  const shimmerDiv = document.createElement('div');
  shimmerDiv.className = 'shimmer-placeholder';
  
  // Use image dimensions if available, otherwise use defaults
  const width = img.width || img.dataset.width || '100%';
  const height = img.height || img.dataset.height || '200px';
  
  shimmerDiv.style.width = typeof width === 'number' ? width + 'px' : width;
  shimmerDiv.style.height = typeof height === 'number' ? height + 'px' : height;
  shimmerDiv.style.display = 'block';
  
  return shimmerDiv;
}
