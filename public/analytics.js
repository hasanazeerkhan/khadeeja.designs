/**
 * Monitoring & Analytics Setup for Khadeeja Designs
 * Includes Sentry error tracking and Google Analytics
 * 
 * Setup Instructions:
 * 1. Sentry: https://sentry.io/ - Get DSN and replace below
 * 2. Google Analytics: https://analytics.google.com/ - Get GA4 ID and replace below
 */

// ============ Sentry Error Monitoring ============
// Include before other scripts

// Get from: https://sentry.io/
const SENTRY_DSN = 'https://YOUR_SENTRY_DSN@sentry.io/PROJECT_ID';

// Initialize Sentry (optional - can include Sentry SDK via CDN instead)
/*
<script src="https://browser.sentry-cdn.com/7.80.0/bundle.min.js"></script>
<script>
Sentry.init({
  dsn: SENTRY_DSN,
  environment: 'production',
  tracesSampleRate: 0.1,
  beforeSend(event) {
    // Don't send 404 errors
    if (event.exception) {
      const error = event.exception.values[0];
      if (error.value && error.value.includes('404')) {
        return null;
      }
    }
    return event;
  }
});
</script>
*/

// ============ Google Analytics 4 ============
// Add this to your HTML <head>:
/*
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-YOUR_GA4_ID"></script>
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-YOUR_GA4_ID', {
  page_path: window.location.pathname,
  anonymize_ip: true
});
</script>
*/

// ============ Custom Event Tracking ============
/**
 * Track custom events with Google Analytics
 * @param {string} eventName - Event name
 * @param {object} eventData - Event data object
 */
function trackEvent(eventName, eventData = {}) {
  if (typeof gtag === 'undefined') {
    console.warn('Google Analytics not initialized');
    return;
  }
  
  gtag('event', eventName, eventData);
  console.log(`Event tracked: ${eventName}`, eventData);
}

// ============ Form Submission Tracking ============
function trackFormSubmission(success = true) {
  trackEvent('form_submission', {
    success: success,
    timestamp: new Date().toISOString(),
    page: window.location.pathname
  });
}

// ============ Blog View Tracking ============
function trackBlogView(slug) {
  trackEvent('blog_view', {
    blog_slug: slug,
    page: window.location.pathname
  });
  
  // Also track in Sentry breadcrumb
  if (typeof Sentry !== 'undefined') {
    Sentry.captureMessage(`Blog viewed: ${slug}`, 'info');
  }
}

// ============ Link Click Tracking ============
function setupLinkTracking() {
  document.querySelectorAll('a[href*="blogs"]').forEach(link => {
    link.addEventListener('click', () => {
      const url = new URL(link.href, window.location.origin);
      const slug = url.searchParams.get('post');
      if (slug) {
        trackBlogView(slug);
      }
    });
  });

  // Track external links
  document.querySelectorAll('a[target="_blank"]').forEach(link => {
    link.addEventListener('click', () => {
      trackEvent('external_link_click', {
        url: link.href
      });
    });
  });
}

// ============ Performance Monitoring ============
function setupPerformanceMonitoring() {
  // Measure Web Vitals
  if ('web-vital' in window || typeof PerformanceObserver === 'function') {
    // Largest Contentful Paint
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        trackEvent('web_vital_lcp', {
          value: lastEntry.renderTime || lastEntry.loadTime,
          unit: 'milliseconds'
        });
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // First Input Delay
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          trackEvent('web_vital_fid', {
            value: entry.processingDuration,
            unit: 'milliseconds'
          });
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      console.warn('FID observer not supported');
    }
  }

  // Measure page load time
  window.addEventListener('load', () => {
    const perfData = performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    
    trackEvent('page_load_time', {
      value: pageLoadTime,
      unit: 'milliseconds'
    });
  });
}

// ============ Error Boundary ============
/**
 * Capture JavaScript errors and send to Sentry
 */
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  
  // Send to Sentry if available
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(event.error);
  }
  
  // Track in Analytics
  trackEvent('javascript_error', {
    message: event.message,
    source: event.filename,
    line: event.lineno,
    column: event.colno
  });
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  if (typeof Sentry !== 'undefined') {
    Sentry.captureException(event.reason);
  }
  
  trackEvent('unhandled_promise_rejection', {
    reason: String(event.reason)
  });
});

// ============ Session Tracking ============
function trackSession() {
  const sessionId = sessionStorage.getItem('session_id') || generateUUID();
  sessionStorage.setItem('session_id', sessionId);
  
  trackEvent('session_start', {
    session_id: sessionId,
    referrer: document.referrer,
    user_agent: navigator.userAgent
  });

  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    trackEvent('session_end', {
      session_id: sessionId,
      duration: Date.now() - sessionStorage.getItem('session_start')
    });
  });
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// ============ Initialize on Page Load ============
document.addEventListener('DOMContentLoaded', () => {
  setupLinkTracking();
  setupPerformanceMonitoring();
  trackSession();
  
  // Track form submissions
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', () => {
      trackFormSubmission(true);
    });
  }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    trackEvent,
    trackFormSubmission,
    trackBlogView,
    trackSession
  };
}
