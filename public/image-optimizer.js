/**
 * Image Optimization Component
 * Handles WebP support, lazy loading, and responsive images
 * 
 * Usage:
 * <picture>
 *   <source srcset="image.webp" type="image/webp" />
 *   <source srcset="image.jpg" type="image/jpeg" />
 *   <img src="image.jpg" alt="Description" loading="lazy" class="responsive-img" />
 * </picture>
 */

// ============ Detect WebP Support ============
function supportsWebP() {
  let webpSupport = false;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    webpSupport = canvas.toDataURL('image/webp').indexOf('image/webp') === 5;
  } catch (err) {
    webpSupport = false;
  }
  return webpSupport;
}

// Store WebP support result
const HAS_WEBP_SUPPORT = supportsWebP();

// ============ Optimize Images on Load ============
function setupImageOptimization() {
  // Add WebP class to document for CSS hooks
  if (HAS_WEBP_SUPPORT) {
    document.documentElement.classList.add('webp');
  } else {
    document.documentElement.classList.add('no-webp');
  }

  // Setup lazy loading for browsers that don't support it natively
  if (!('loading' in HTMLImageElement.prototype)) {
    setupLazyLoadFallback();
  }

  // Add responsive image observer
  setupResponsiveImages();
}

// ============ Lazy Load Fallback ============
function setupLazyLoadFallback() {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        
        // Use data-src if available, otherwise keep src
        if (img.dataset.src) {
          img.src = img.dataset.src;
        }
        
        // Mark as loaded
        img.classList.add('loaded');
        observer.unobserve(img);
      }
    });
  }, {
    rootMargin: '50px'
  });

  // Observe all lazy images
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    imageObserver.observe(img);
  });
}

// ============ Responsive Images ============
function setupResponsiveImages() {
  // This can be extended for dynamic srcset handling
  const resizeObserver = new ResizeObserver(() => {
    // Update image srcset based on container width if needed
  });

  document.querySelectorAll('img.responsive-img').forEach(img => {
    resizeObserver.observe(img);
  });
}

// ============ Image Format Helper ============
function getOptimalImageFormat(imagePath) {
  if (!imagePath) return imagePath;

  // Replace extension based on WebP support
  if (HAS_WEBP_SUPPORT && !imagePath.includes('.webp')) {
    const withoutExt = imagePath.substring(0, imagePath.lastIndexOf('.'));
    return withoutExt + '.webp';
  }
  
  return imagePath;
}

// ============ Generate Responsive Srcset ============
function generateResponsiveSrcset(imagePath, sizes = [320, 768, 1200]) {
  if (!imagePath) return '';

  const withoutExt = imagePath.substring(0, imagePath.lastIndexOf('.'));
  const ext = imagePath.substring(imagePath.lastIndexOf('.'));
  
  return sizes
    .map(size => {
      const optimized = getOptimalImageFormat(`${withoutExt}-${size}w${ext}`);
      return `${optimized} ${size}w`;
    })
    .join(', ');
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupImageOptimization);
} else {
  setupImageOptimization();
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    supportsWebP: supportsWebP,
    getOptimalImageFormat: getOptimalImageFormat,
    generateResponsiveSrcset: generateResponsiveSrcset
  };
}
