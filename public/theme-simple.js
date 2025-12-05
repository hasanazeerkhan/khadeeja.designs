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
  // Check if on mobile
  const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Force dark theme on mobile, otherwise use saved theme or dark as default
  let theme = isMobile ? 'dark' : (localStorage.getItem('khadeeja-theme') || 'dark');
  
  applyTheme(theme);
  updateThemeIcon(theme);
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
    // Apply inline overrides to elements using Tailwind utilities that are hard to override
    applyInlineThemeStyles('light');
    // Apply enhanced overrides for images, shadows, and WhatsApp button
    enhancedLightModeOverrides('light');
  } else {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    
    const style = document.getElementById('theme-dynamic-styles');
    if (style) {
      style.innerHTML = '';
    }
    // Remove inline overrides and restore dark defaults
    applyInlineThemeStyles('dark');
    // Restore enhanced overrides for images, shadows, and WhatsApp button
    enhancedLightModeOverrides('dark');
  }
}

// Runtime inline style application to override Tailwind utilities when switching themes
function applyInlineThemeStyles(theme) {
  // Map of selectors -> style adjustments for light/dark
  const groups = [
    {
      selectors: ['.bg-neutral-900', '.bg-neutral-800', '.bg-neutral-900\/40', '.bg-neutral-900\/70', '.bg-neutral-900\/80', '.bg-neutral-800\/50', '.bg-neutral-800\/50'],
      prop: 'backgroundColor',
      light: '#f5f5f5',
      dark: ''
    },
    {
      selectors: ['.text-neutral-300', '.text-neutral-400', '.text-gray-300', '.text-gray-400'],
      prop: 'color',
      light: '#666666',
      dark: ''
    },
    {
      selectors: ['.border-neutral-700', '.border-neutral-800'],
      prop: 'borderColor',
      light: '#d0d0d0',
      dark: ''
    },
    {
      selectors: ['.bg-amber-400', '.text-amber-400', '.text-amber-200'],
      prop: 'color',
      light: '#d97706',
      dark: ''
    },
    {
      selectors: ['nav', '.glass'],
      prop: 'background',
      light: 'rgba(245, 245, 245, 0.92)',
      dark: ''
    },
    {
      selectors: ['.whatsapp-btn'],
      prop: 'backgroundColor',
      light: '#25d366',
      dark: ''
    }
  ];

  groups.forEach(group => {
    group.selectors.forEach(sel => {
      let nodes = [];
      try {
        nodes = Array.from(document.querySelectorAll(sel));
      } catch (e) {
        // selector might be invalid due to missing escape - try escaping slashes
        const safe = sel.replace(/\\/g, '\\\\');
        try {
          nodes = Array.from(document.querySelectorAll(safe));
        } catch (_) {
          nodes = [];
        }
      }

      nodes.forEach(el => {
        if (theme === 'light') {
          // store previous inline value so we can restore later
          const key = `data-prev-${group.prop}`;
          if (!el.hasAttribute(key)) {
            el.setAttribute(key, el.style[group.prop] || '');
          }
          el.style[group.prop] = group.light;
        } else {
          // restore previous value
          const key = `data-prev-${group.prop}`;
          if (el.hasAttribute(key)) {
            const prev = el.getAttribute(key);
            el.style[group.prop] = prev || '';
            el.removeAttribute(key);
          } else {
            el.style[group.prop] = '';
          }
        }
      });
    });
  });
}

// Aggressive sweep: strip Tailwind color utility classes and apply neutral inline styles
function aggressiveClassSweep(theme) {
  const selector = '[class*="bg-"] ,[class*="text-"] ,[class*="border-"]';
  const nodes = Array.from(document.querySelectorAll(selector));

  nodes.forEach(el => {
    // skip if this is the theme script element itself
    if (el.id === 'theme-dynamic-styles' || el.id === 'theme-toggle') return;

    if (theme === 'light') {
      // store original classes and inline styles
      if (!el.hasAttribute('data-original-classes')) {
        el.setAttribute('data-original-classes', el.className);
      }
      if (!el.hasAttribute('data-original-inline')) {
        const prev = {
          background: el.style.background || '',
          backgroundColor: el.style.backgroundColor || '',
          color: el.style.color || '',
          borderColor: el.style.borderColor || ''
        };
        el.setAttribute('data-original-inline', JSON.stringify(prev));
      }

      // remove Tailwind color utility classes
      const original = el.className;
      const cleaned = original.split(/\s+/).filter(c => !/^(?:bg-|text-|border-)/.test(c)).join(' ');
      el.className = cleaned;

      // Apply neutral inline styles where appropriate
      // If element previously had a bg- class, set a light bg
      if (/\bbg-[^\s]+\b/.test(original)) {
        el.style.background = '#f5f5f5';
      }
      // If element had text- class, set dark text
      if (/\btext-[^\s]+\b/.test(original)) {
        el.style.color = '#111111';
      }
      // If element had border- class, set light border
      if (/\bborder-[^\s]+\b/.test(original)) {
        el.style.borderColor = '#d0d0d0';
      }
    } else {
      // restore original classes and inline styles
      if (el.hasAttribute('data-original-classes')) {
        el.className = el.getAttribute('data-original-classes');
        el.removeAttribute('data-original-classes');
      }
      if (el.hasAttribute('data-original-inline')) {
        try {
          const prev = JSON.parse(el.getAttribute('data-original-inline'));
          el.style.background = prev.background || '';
          el.style.backgroundColor = prev.backgroundColor || '';
          el.style.color = prev.color || '';
          el.style.borderColor = prev.borderColor || '';
        } catch (e) {
          // ignore parse errors
        }
        el.removeAttribute('data-original-inline');
      } else {
        // clear styles applied by light mode
        el.style.background = '';
        el.style.color = '';
        el.style.borderColor = '';
      }
    }
  });
}

// Enhanced light mode: handle additional elements like images, shadows, and WhatsApp button
function enhancedLightModeOverrides(theme) {
  if (theme === 'light') {
    // Remove box-shadow from images and figures
    document.querySelectorAll('img, figure, .portfolio-img').forEach(el => {
      if (!el.hasAttribute('data-prev-shadow')) {
        el.setAttribute('data-prev-shadow', el.style.boxShadow || '');
      }
      el.style.setProperty('box-shadow', 'none', 'important');
    });

    // Make WhatsApp button visible in light mode
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn) {
      if (!whatsappBtn.hasAttribute('data-prev-whatsapp')) {
        whatsappBtn.setAttribute('data-prev-whatsapp', whatsappBtn.style.cssText || '');
      }
      whatsappBtn.style.setProperty('background-color', '#25d366', 'important');
      whatsappBtn.style.setProperty('box-shadow', '0 4px 12px rgba(37, 211, 102, 0.3)', 'important');
    }
  } else {
    // Restore shadows on dark mode
    document.querySelectorAll('img, figure, .portfolio-img').forEach(el => {
      if (el.hasAttribute('data-prev-shadow')) {
        el.style.boxShadow = el.getAttribute('data-prev-shadow');
        el.removeAttribute('data-prev-shadow');
      }
    });

    // Restore WhatsApp button styling
    const whatsappBtn = document.querySelector('.whatsapp-btn');
    if (whatsappBtn && whatsappBtn.hasAttribute('data-prev-whatsapp')) {
      const prev = whatsappBtn.getAttribute('data-prev-whatsapp');
      whatsappBtn.style.cssText = prev;
      whatsappBtn.removeAttribute('data-prev-whatsapp');
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
  
  // Check if on mobile
  const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  // Hide toggle on mobile
  if (isMobile) {
    toggle.style.display = 'none';
    return;
  }
  
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
