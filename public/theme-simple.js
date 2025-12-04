/**
 * Simple Dark/Light Mode Theme Switcher
 * Lightweight theme toggle that actually works
 */

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  setupThemeToggle();
});

// Initialize immediately if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initTheme);
} else {
  initTheme();
}

function initTheme() {
  // Get saved theme or use dark as default
  const savedTheme = localStorage.getItem('khadeeja-theme') || 'dark';
  applyTheme(savedTheme);
  updateThemeIcon(savedTheme);
}

function applyTheme(theme) {
  const html = document.documentElement;
  
  if (theme === 'light') {
    html.classList.add('light-mode');
    html.classList.remove('dark-mode');
    document.documentElement.style.background = '#ffffff';
    document.body.style.background = '#ffffff';
    document.body.style.color = '#000000';
  } else {
    html.classList.add('dark-mode');
    html.classList.remove('light-mode');
    document.documentElement.style.background = 'linear-gradient(180deg, #050505, #0a0a0a)';
    document.body.style.background = 'linear-gradient(180deg, #050505, #0a0a0a)';
    document.body.style.color = '#ffffff';
  }
  
  localStorage.setItem('khadeeja-theme', theme);
  applyThemeStyles(theme);
}

function applyThemeStyles(theme) {
  if (theme === 'light') {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    
    // Update all neutral colors
    const style = document.getElementById('theme-dynamic-styles') || document.createElement('style');
    style.id = 'theme-dynamic-styles';
    style.innerHTML = `
      body.light-theme {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
      
      body.light-theme nav {
        background: rgba(245, 245, 245, 0.9) !important;
      }
      
      /* include Tailwind opacity variants (slashes must be escaped) */
      body.light-theme .bg-neutral-900,
      body.light-theme .bg-neutral-800,
      body.light-theme .bg-neutral-900\/40,
      body.light-theme .bg-neutral-900\/70,
      body.light-theme .bg-neutral-900\/80,
      body.light-theme .bg-neutral-800\/50,
      body.light-theme .bg-neutral-800\/50 {
        background-color: #f5f5f5 !important;
        color: #000000 !important;
      }
      
      body.light-theme section {
        background-color: #ffffff !important;
      }
      
      body.light-theme h1, body.light-theme h2, body.light-theme h3,
      body.light-theme h4, body.light-theme h5, body.light-theme h6 {
        color: #000000 !important;
      }
      
      body.light-theme p, body.light-theme span, body.light-theme a {
        color: #333333 !important;
      }
      
      body.light-theme .text-neutral-300,
      body.light-theme .text-neutral-400,
      body.light-theme .text-gray-300,
      body.light-theme .text-gray-400 {
        color: #666666 !important;
      }
      
      body.light-theme .text-amber-400,
      body.light-theme .text-amber-200 {
        color: #d97706 !important;
      }
      
      body.light-theme .border-neutral-700,
      body.light-theme .border-neutral-800 {
        border-color: #d0d0d0 !important;
      }
      
      body.light-theme input,
      body.light-theme textarea {
        background-color: #f5f5f5 !important;
        color: #000000 !important;
        border-color: #d0d0d0 !important;
      }
      
      body.light-theme article,
      body.light-theme .qa-block,
      body.light-theme .blog-card,
      body.light-theme .aspect-video,
      body.light-theme .whatsapp-btn {
        background-color: #f5f5f5 !important;
        color: #000000 !important;
      }
      
      body.light-theme footer {
        background-color: #f5f5f5 !important;
        color: #666666 !important;
        border-color: #e0e0e0 !important;
      }
      
      body.light-theme nav a {
        color: #1a1a1a !important;
      }
      
      body.light-theme nav a:hover {
        background-color: #e0e0e0 !important;
      }
    `;
    
    if (!document.getElementById('theme-dynamic-styles')) {
      document.head.appendChild(style);
    }
  } else {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    
    const style = document.getElementById('theme-dynamic-styles');
    if (style) {
      style.innerHTML = '';
    }
  }
}

function updateThemeIcon(theme) {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  toggle.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
}

function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;
  
  toggle.addEventListener('click', function(e) {
    e.preventDefault();
    
    const currentTheme = localStorage.getItem('khadeeja-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    updateThemeIcon(newTheme);
    
    // Track theme change
    if (window.trackEvent) {
      window.trackEvent('theme_toggle', { theme: newTheme });
    }
  });
}
