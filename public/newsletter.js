/**
 * Newsletter Signup Handler
 * Integrates with Mailchimp API for email list management
 * 
 * SETUP INSTRUCTIONS:
 * 1. Create Mailchimp account at https://mailchimp.com
 * 2. Create audience and get API key + list ID
 * 3. Set up backend endpoint at /api/subscribe-newsletter
 * 4. Replace MAILCHIMP_CONFIG values below
 * 5. Add form with id="newsletter-form" to pages
 */

const MAILCHIMP_CONFIG = {
  API_KEY: 'YOUR_MAILCHIMP_API_KEY',
  LIST_ID: 'YOUR_MAILCHIMP_LIST_ID',
  DATA_CENTER: 'us1', // e.g., us1, us2, etc from API key
  BACKEND_ENDPOINT: '/api/subscribe-newsletter'
};

// ============ Newsletter Signup Handler ============
/**
 * Handle newsletter form submission
 * @param {Event} event - Form submission event
 */
async function handleNewsletterSignup(event) {
  event.preventDefault();
  
  const form = event.target;
  const emailInput = form.querySelector('[name="email"]');
  const nameInput = form.querySelector('[name="name"]');
  const submitBtn = form.querySelector('[type="submit"]');
  
  if (!emailInput) {
    console.error('Newsletter form missing email input');
    return;
  }

  const email = emailInput.value.trim();
  const name = nameInput ? nameInput.value.trim() : '';

  // Validate email
  if (!validateEmail(email)) {
    showNewsletterNotification('❌ Please enter a valid email address', 'error');
    emailInput.focus();
    return;
  }

  try {
    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Subscribing...</span>';

    // Submit to backend
    const response = await fetch(MAILCHIMP_CONFIG.BACKEND_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        name: name,
        source: 'website'
      })
    });

    const data = await response.json();

    if (response.ok) {
      showNewsletterNotification(
        '✓ Welcome! Check your email to confirm subscription.',
        'success'
      );
      form.reset();
      emailInput.focus();

      // Track event
      if (window.trackEvent) {
        window.trackEvent('newsletter_signup', {
          email_domain: email.split('@')[1]
        });
      }
    } else {
      throw new Error(data.error || 'Subscription failed');
    }

  } catch (error) {
    console.error('Newsletter signup error:', error);
    
    // Check for specific error types
    if (error.message.includes('already')) {
      showNewsletterNotification(
        '⚠️ This email is already subscribed',
        'info'
      );
    } else if (error.message.includes('invalid')) {
      showNewsletterNotification(
        '❌ Invalid email address',
        'error'
      );
    } else {
      showNewsletterNotification(
        '❌ Subscription failed. Please try again.',
        'error'
      );
    }

    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// ============ Email Validation ============
/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// ============ Newsletter Notification ============
/**
 * Display newsletter subscription notification
 * @param {string} message - Notification text
 * @param {string} type - 'success', 'error', or 'info'
 */
function showNewsletterNotification(message, type = 'info') {
  let noteEl = document.getElementById('newsletter-notification');
  
  if (!noteEl) {
    noteEl = document.createElement('div');
    noteEl.id = 'newsletter-notification';
    document.body.appendChild(noteEl);
  }

  const bgColor = {
    success: 'bg-green-500/90',
    error: 'bg-red-500/90',
    info: 'bg-blue-500/90'
  }[type] || 'bg-blue-500/90';

  noteEl.className = `fixed bottom-4 right-4 p-4 rounded-lg z-50 text-white ${bgColor} max-w-sm`;
  noteEl.textContent = message;
  noteEl.style.display = 'block';

  // Auto-hide after 5 seconds
  setTimeout(() => {
    noteEl.style.display = 'none';
  }, 5000);
}

// ============ Newsletter Form Placeholder ============
/**
 * Create inline newsletter form HTML
 * Useful for injecting newsletter signup anywhere
 * @returns {string} HTML string
 */
function createNewsletterForm() {
  return `
    <form id="newsletter-form" class="space-y-3 bg-gradient-to-r from-pink-900/20 to-purple-900/20 rounded-lg p-6 border border-pink-500/20">
      <div>
        <label for="newsletter-email" class="block text-sm font-semibold mb-2">
          📬 Subscribe to Our Newsletter
        </label>
        <p class="text-xs text-gray-400 mb-3">
          Get tips, trends, and exclusive offers delivered to your inbox weekly.
        </p>
      </div>

      <div class="space-y-2">
        <input
          type="text"
          name="name"
          id="newsletter-name"
          placeholder="Your name (optional)"
          class="w-full px-4 py-2 bg-neutral-900 border border-gray-700 rounded-lg focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 text-white placeholder-gray-500 transition-colors"
        />
      </div>

      <div class="space-y-2">
        <input
          type="email"
          name="email"
          id="newsletter-email"
          placeholder="your@email.com"
          required
          class="w-full px-4 py-2 bg-neutral-900 border border-gray-700 rounded-lg focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 text-white placeholder-gray-500 transition-colors"
        />
      </div>

      <button
        type="submit"
        class="w-full px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-semibold rounded-lg transition-all duration-200 active:scale-95"
      >
        Subscribe
      </button>

      <p class="text-xs text-gray-500 text-center">
        We respect your privacy. Unsubscribe anytime.
      </p>
    </form>
  `;
}

// ============ Inject Newsletter Form ============
/**
 * Inject newsletter form into specified container
 * @param {string} containerSelector - Target container selector
 */
function injectNewsletterForm(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (container) {
    container.innerHTML = createNewsletterForm();
    setupNewsletterForm('#newsletter-form');
  }
}

// ============ Setup Newsletter Form ============
/**
 * Attach event handlers to newsletter form
 * @param {string} formSelector - Form selector
 */
function setupNewsletterForm(formSelector = '#newsletter-form') {
  const form = document.querySelector(formSelector);
  if (!form) return;

  form.addEventListener('submit', handleNewsletterSignup);
  
  console.log('Newsletter form initialized');
}

// ============ Initialize Newsletter Forms ============
/**
 * Auto-setup all newsletter forms on page
 */
function initializeNewsletterForms() {
  // Find all newsletter forms
  const forms = document.querySelectorAll('[data-newsletter-form]');
  
  forms.forEach(form => {
    form.addEventListener('submit', handleNewsletterSignup);
  });

  // Also setup by ID
  const mainForm = document.querySelector('#newsletter-form');
  if (mainForm) {
    mainForm.addEventListener('submit', handleNewsletterSignup);
  }

  if (forms.length > 0 || mainForm) {
    console.log(`Newsletter initialized for ${forms.length} forms`);
  }
}

// ============ Backend Endpoint Example (Node.js/Express) ============
/**
 * Example backend endpoint for newsletter subscription
 * 
 * POST /api/subscribe-newsletter
 * Body: { email, name, source }
 * 
 * const mailchimp = require('@mailchimp/mailchimp_marketing');
 * 
 * app.post('/api/subscribe-newsletter', async (req, res) => {
 *   const { email, name } = req.body;
 *   
 *   mailchimp.setConfig({
 *     apiKey: process.env.MAILCHIMP_API_KEY,
 *     server: 'us1'
 *   });
 *   
 *   try {
 *     await mailchimp.lists.addListMember(
 *       process.env.MAILCHIMP_LIST_ID,
 *       {
 *         email_address: email,
 *         status: 'pending',
 *         merge_fields: {
 *           FNAME: name.split(' ')[0],
 *           LNAME: name.split(' ').slice(1).join(' ')
 *         }
 *       }
 *     );
 *     
 *     res.json({ success: true, message: 'Subscribed successfully' });
 *   } catch (error) {
 *     res.status(400).json({ error: error.message });
 *   }
 * });
 */

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeNewsletterForms);
} else {
  initializeNewsletterForms();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    handleNewsletterSignup,
    validateEmail,
    showNewsletterNotification,
    createNewsletterForm,
    injectNewsletterForm,
    setupNewsletterForm,
    initializeNewsletterForms
  };
}
