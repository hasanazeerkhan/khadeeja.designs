/**
 * Shared JavaScript utilities for Khadeeja Designs
 * Handles common functionality across all pages
 */

// ============ Image Fallback ============
/**
 * Adds error handling to images
 * Falls back to placeholder if image fails to load
 */
function setupImageFallback() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      console.warn(`Image failed to load: ${img.src}`);
      img.src = '/public/placeholder.webp';
      img.alt = 'Image unavailable';
    }, { once: true });
  });
}

// ============ Navigation ============
/**
 * Setup navigation keyboard accessibility
 */
function setupNavigation() {
  const navLinks = document.querySelectorAll('nav a');
  
  navLinks.forEach(link => {
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        link.click();
      }
    });
  });
}

// ============ Progress Bar ============
/**
 * Updates reading progress bar as user scrolls
 */
function setupProgressBar() {
  const progressBar = document.getElementById('progressBar');
  if (!progressBar) return;

  window.addEventListener('scroll', () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = scrollHeight > 0 ? (window.scrollY / scrollHeight) * 100 : 0;
    progressBar.style.width = scrollProgress + '%';
  });
}

// ============ Form Handling ============
/**
 * Validates form input
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Handles quote form submission
 */
function setupQuoteForm() {
  const form = document.getElementById('quoteForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('q-name')?.value.trim();
    const email = document.getElementById('q-email')?.value.trim();
    const details = document.getElementById('q-details')?.value.trim();
    const noteEl = document.getElementById('q-note');

    // Validation
    if (!name || !email || !details) {
      showNotification('Please fill in all fields', 'error', noteEl);
      return;
    }

    if (!validateEmail(email)) {
      showNotification('Please enter a valid email', 'error', noteEl);
      return;
    }

    // Create mailto link
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nProject details:\n${details}`);
    const subject = encodeURIComponent(`Quote request from ${name}`);
    
    window.location.href = `mailto:hello@khadeejadesigns.com?subject=${subject}&body=${body}`;
    
    if (noteEl) {
      showNotification("Thanks — we'll follow up via email within 48 hours.", 'success', noteEl);
      setTimeout(() => {
        form.reset();
        noteEl.classList.add('hidden');
      }, 2000);
    }
  });
}

/**
 * Shows notification message
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 * @param {Element} element - Element to show in
 */
function showNotification(message, type = 'success', element = null) {
  const noteEl = element || document.getElementById('q-note');
  if (!noteEl) return;

  noteEl.textContent = message;
  noteEl.className = `text-sm font-medium ${type === 'success' ? 'text-amber-200' : 'text-red-300'}`;
  noteEl.classList.remove('hidden');
  
  if (type === 'success') {
    setTimeout(() => noteEl.classList.add('hidden'), 4000);
  }
}

// ============ Initialize All ============
/**
 * Initialize all utilities on page load
 */
function initializeUtilities() {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
}

function initAll() {
  setupImageFallback();
  setupNavigation();
  setupProgressBar();
  setupQuoteForm();
}

// Auto-initialize on script load
initializeUtilities();
