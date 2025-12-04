/**
 * reCAPTCHA v3 Handler
 * Integrates Google reCAPTCHA v3 for spam protection on forms
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get your Site Key and Secret Key from: https://www.google.com/recaptcha/admin
 * 2. Replace RECAPTCHA_SITE_KEY below with your actual site key
 * 3. Add to <head>: <script src="https://www.google.com/recaptcha/api.js"></script>
 * 4. Backend validation: POST to /verify-recaptcha with token and secret key
 */

const RECAPTCHA_CONFIG = {
  SITE_KEY: 'YOUR_RECAPTCHA_SITE_KEY_HERE', // Replace with actual site key
  ACTION: 'contact_form_submission',
  THRESHOLD: 0.5 // 0-1, higher = stricter
};

// ============ Token Generation ============
/**
 * Get reCAPTCHA token for form submission
 * @returns {Promise<string>} reCAPTCHA token
 */
async function getRecaptchaToken() {
  if (!window.grecaptcha) {
    console.error('reCAPTCHA script not loaded');
    return null;
  }

  try {
    const token = await window.grecaptcha.execute(RECAPTCHA_CONFIG.SITE_KEY, {
      action: RECAPTCHA_CONFIG.ACTION
    });
    return token;
  } catch (error) {
    console.error('Failed to get reCAPTCHA token:', error);
    return null;
  }
}

// ============ Verification on Frontend ============
/**
 * Verify token score on frontend (client-side check only)
 * Note: Always verify on backend for security
 * @param {string} token - reCAPTCHA token
 * @returns {Object} { success, score }
 */
async function verifyTokenLocal(token) {
  // Frontend can't truly verify - always use backend verification
  return { success: !!token, score: null };
}

// ============ Backend Verification Endpoint ============
/**
 * Verify token with Google and backend
 * Make this call to your backend which will:
 * 1. Send token + secret to Google
 * 2. Receive score and action
 * 3. Validate score meets threshold
 */
async function verifyTokenWithBackend(token) {
  try {
    const response = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: token,
        action: RECAPTCHA_CONFIG.ACTION
      })
    });

    if (!response.ok) {
      throw new Error(`Backend verification failed: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: data.success && data.score >= RECAPTCHA_CONFIG.THRESHOLD,
      score: data.score,
      action: data.action
    };
  } catch (error) {
    console.error('reCAPTCHA backend verification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============ Form Submission with reCAPTCHA ============
/**
 * Enhanced form submission handler with reCAPTCHA protection
 * @param {Event} event - Form submission event
 */
async function handleFormWithRecaptcha(event) {
  event.preventDefault();
  
  const form = event.target;
  const submitBtn = form.querySelector('[type="submit"]');
  
  try {
    // Show loading state
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Verifying...</span>';

    // Get reCAPTCHA token
    const token = await getRecaptchaToken();
    if (!token) {
      showNotification('❌ Security verification failed. Please try again.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    // Verify with backend (includes score check)
    const verification = await verifyTokenWithBackend(token);
    
    if (!verification.success) {
      showNotification(
        '⚠️ Submission blocked by spam detection. Please try again or contact support.',
        'error'
      );
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
      return;
    }

    // If verification passed, submit form
    await submitFormData(form, token);
    
  } catch (error) {
    console.error('Form submission error:', error);
    showNotification('❌ Error submitting form. Please try again.', 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

// ============ Form Data Submission ============
/**
 * Submit form data with reCAPTCHA token
 * @param {HTMLFormElement} form - Form element
 * @param {string} token - reCAPTCHA token
 */
async function submitFormData(form, token) {
  const formData = new FormData(form);
  
  // Add reCAPTCHA token to form data
  formData.append('g-recaptcha-response', token);
  
  try {
    const response = await fetch(form.action || '/api/submit-form', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      showNotification(
        '✓ Thanks for reaching out! We received your message and will respond within 24 hours.',
        'success'
      );
      form.reset();
    } else {
      throw new Error(data.error || 'Form submission failed');
    }
  } catch (error) {
    console.error('Form submission error:', error);
    throw error;
  }
}

// ============ Initialize reCAPTCHA ============
/**
 * Attach reCAPTCHA handler to form
 */
function setupRecaptchaForForm(formSelector = '#quoteForm') {
  const form = document.querySelector(formSelector);
  
  if (!form) {
    console.warn(`Form not found: ${formSelector}`);
    return;
  }

  // Check if reCAPTCHA script is loaded
  if (!window.grecaptcha) {
    console.warn('reCAPTCHA script not loaded. Add to <head>: <script src="https://www.google.com/recaptcha/api.js"></script>');
    // Fallback to regular submission without reCAPTCHA
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await submitFormData(form, null);
    });
    return;
  }

  // Attach reCAPTCHA-enabled handler
  form.addEventListener('submit', handleFormWithRecaptcha);
  
  console.log('reCAPTCHA protection enabled for form:', formSelector);
}

// ============ Check reCAPTCHA Availability ============
/**
 * Wait for reCAPTCHA script to load
 */
function waitForRecaptcha(timeout = 5000) {
  return new Promise((resolve) => {
    let elapsed = 0;
    const checkInterval = setInterval(() => {
      if (window.grecaptcha) {
        clearInterval(checkInterval);
        resolve(true);
      }
      elapsed += 100;
      if (elapsed > timeout) {
        clearInterval(checkInterval);
        console.warn('reCAPTCHA took too long to load');
        resolve(false);
      }
    }, 100);
  });
}

// ============ Notification Helper ============
/**
 * Display notification message
 * @param {string} message - Notification text
 * @param {string} type - 'success' or 'error'
 */
function showNotification(message, type = 'info') {
  let noteEl = document.getElementById('notification');
  
  if (!noteEl) {
    noteEl = document.createElement('div');
    noteEl.id = 'notification';
    document.body.appendChild(noteEl);
  }

  noteEl.className = `fixed bottom-4 right-4 p-4 rounded-lg z-50 ${
    type === 'success'
      ? 'bg-green-500/90 text-white'
      : type === 'error'
      ? 'bg-red-500/90 text-white'
      : 'bg-blue-500/90 text-white'
  }`;
  
  noteEl.textContent = message;
  noteEl.style.display = 'block';

  setTimeout(() => {
    noteEl.style.display = 'none';
  }, 5000);
}

// ============ Initialize on DOM Ready ============
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await waitForRecaptcha();
    setupRecaptchaForForm('#quoteForm');
  });
} else {
  (async () => {
    await waitForRecaptcha();
    setupRecaptchaForForm('#quoteForm');
  })();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getRecaptchaToken,
    verifyTokenLocal,
    verifyTokenWithBackend,
    handleFormWithRecaptcha,
    submitFormData,
    setupRecaptchaForForm,
    waitForRecaptcha,
    showNotification
  };
}
