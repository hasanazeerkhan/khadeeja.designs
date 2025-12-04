/**
 * Formspree Form Handler for Khadeeja Designs
 * Handles form submission with validation and error handling
 * 
 * Setup: Replace FORMSPREE_ID with your Formspree endpoint ID
 * Get it from: https://formspree.io/
 */

const FORMSPREE_ENDPOINT = 'https://formspree.io/f/YOUR_FORM_ID'; // Replace with your Formspree ID

/**
 * Enhanced form handler with Formspree integration
 */
function handleFormSubmission(event) {
  event.preventDefault();
  
  const form = event.target;
  const name = document.getElementById('q-name')?.value.trim();
  const email = document.getElementById('q-email')?.value.trim();
  const details = document.getElementById('q-details')?.value.trim();
  const submitBtn = document.getElementById('q-submit');
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

  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Sending...</span>';
  }

  // Prepare form data
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('project_details', details);
  formData.append('_captcha', 'false'); // Optional: Formspree CAPTCHA
  formData.append('_replyto', email); // Formspree reply-to

  // Submit to Formspree
  fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    body: formData,
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  })
  .then(data => {
    console.log('Form submitted successfully:', data);
    showNotification('✓ Thanks! We received your request. We\'ll contact you within 48 hours.', 'success', noteEl);
    form.reset();
    
    // Reset button
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Request';
      }
    }, 2000);
  })
  .catch(err => {
    console.error('Form submission error:', err);
    showNotification('❌ Error sending request. Please try again or contact us on WhatsApp.', 'error', noteEl);
    
    // Reset button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Request';
    }
  });
}

/**
 * Validates email format
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Shows notification message
 */
function showNotification(message, type = 'success', element = null) {
  const noteEl = element || document.getElementById('q-note');
  if (!noteEl) return;

  noteEl.innerHTML = message;
  noteEl.className = `text-sm font-medium ${type === 'success' ? 'text-green-300' : 'text-red-300'}`;
  noteEl.classList.remove('hidden');
  
  if (type === 'success') {
    setTimeout(() => {
      noteEl.classList.add('hidden');
      noteEl.innerHTML = '';
    }, 5000);
  }
}

// Setup form handler on page load
document.addEventListener('DOMContentLoaded', () => {
  const quoteForm = document.getElementById('quoteForm');
  if (quoteForm) {
    quoteForm.addEventListener('submit', handleFormSubmission);
  }
});
