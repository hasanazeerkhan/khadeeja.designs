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
  const phone = document.getElementById('q-phone')?.value.trim();
  const occasionDate = document.getElementById('q-occasion-date')?.value;
  const productType = document.getElementById('q-product-type')?.value;
  const budget = document.getElementById('q-budget')?.value;
  const location = document.getElementById('q-location')?.value;
  const details = document.getElementById('q-details')?.value.trim();
  const submitBtn = document.getElementById('q-submit');
  const noteEl = document.getElementById('q-note');

  // Validation
  if (!name || !email || !phone || !occasionDate || !productType || !location || !details) {
    showNotification('❌ Please fill in all required fields', 'error', noteEl);
    return;
  }

  if (!validateEmail(email)) {
    showNotification('❌ Please enter a valid email address', 'error', noteEl);
    return;
  }

  // Show loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="inline-flex items-center gap-2"><svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Sending...</span>';
  }

  // Prepare form data for Formspree
  const formData = new FormData();
  formData.append('name', name);
  formData.append('email', email);
  formData.append('phone', phone);
  formData.append('event_date', occasionDate);
  formData.append('product_type', productType);
  formData.append('budget_range', budget || 'Not specified');
  formData.append('delivery_location', location);
  formData.append('project_description', details);
  formData.append('_captcha', 'false'); // Optional: Formspree CAPTCHA
  formData.append('_replyto', email); // Formspree reply-to
  formData.append('_subject', `New Enquiry from ${name}`); // Email subject

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
    showNotification('✓ Thank you! We received your enquiry. We\'ll contact you within 48 hours with availability and an estimate.', 'success', noteEl);
    form.reset();
    
    // Reset button
    setTimeout(() => {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Send Enquiry';
      }
    }, 2000);
  })
  .catch(err => {
    console.error('Form submission error:', err);
    showNotification('❌ Error sending enquiry. Please try contacting us on WhatsApp or email instead.', 'error', noteEl);
    
    // Reset button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Send Enquiry';
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
  noteEl.className = `text-sm font-medium ${type === 'success' ? 'text-amber-300' : 'text-red-300'}`;
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
