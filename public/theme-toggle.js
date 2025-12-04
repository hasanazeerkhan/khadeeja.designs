/**
 * Dark/Light Mode Theme Switcher
 * Toggles between dark and light themes with localStorage persistence
 * 
 * SETUP:
 * 1. Add toggle button to HTML: <button id="theme-toggle" aria-label="Toggle theme">🌙</button>
 * 2. Include this script in <head> or early in <body>
 * 3. CSS will auto-apply based on theme
 */

const THEME_CONFIG = {
  STORAGE_KEY: 'khadeeja-designs-theme',
  DARK_CLASS: 'dark',
  LIGHT_CLASS: 'light',
  DEFAULT_THEME: 'dark' // 'dark' or 'light'
};

// ============ Theme Detection ============
/**
 * Detect user's preferred color scheme
 * @returns {string} 'dark' or 'light'
 */
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

// ============ Get Current Theme ============
/**
 * Get current theme from storage or system preference
 * @returns {string} 'dark' or 'light'
 */
function getCurrentTheme() {
  // Check localStorage
  const stored = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
  if (stored) return stored;

  // Check system preference
  const system = getSystemTheme();
  if (system) return system;

  // Fall back to default
  return THEME_CONFIG.DEFAULT_THEME;
}

// ============ Set Theme ============
/**
 * Set and apply theme
 * @param {string} theme - 'dark' or 'light'
 * @param {boolean} save - Save to localStorage
 */
function setTheme(theme, save = true) {
  if (!['dark', 'light'].includes(theme)) {
    console.warn(`Invalid theme: ${theme}`);
    return;
  }

  // Apply to document
  const html = document.documentElement;
  html.classList.remove(THEME_CONFIG.DARK_CLASS, THEME_CONFIG.LIGHT_CLASS);
  html.classList.add(theme);

  // Set data attribute for CSS targeting
  html.setAttribute('data-theme', theme);

  // Update meta theme-color
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#000000' : '#ffffff');
  }

  // Save preference
  if (save) {
    localStorage.setItem(THEME_CONFIG.STORAGE_KEY, theme);
  }

  // Dispatch custom event
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));

  console.log(`Theme changed to: ${theme}`);
}

// ============ Toggle Theme ============
/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
  const current = getCurrentTheme();
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next, true);
  updateThemeToggleIcon();

  // Track theme change
  if (window.trackEvent) {
    window.trackEvent('theme_toggle', {
      theme_changed_to: next
    });
  }
}

// ============ Update Toggle Icon ============
/**
 * Update theme toggle button icon
 */
function updateThemeToggleIcon() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const theme = getCurrentTheme();
  toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  toggle.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

// ============ Create Theme Toggle Button ============
/**
 * Create theme toggle button HTML
 * @returns {string} HTML string
 */
function createThemeToggleButton() {
  const theme = getCurrentTheme();
  const icon = theme === 'dark' ? '☀️' : '🌙';
  const title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return `
    <button
      id="theme-toggle"
      class="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white transition-all duration-300 hover:scale-110 active:scale-95"
      title="${title}"
      aria-label="Toggle theme"
    >
      ${icon}
    </button>
  `;
}

// ============ Inject Theme Toggle ============
/**
 * Inject theme toggle button into page
 */
function injectThemeToggle() {
  // Check if already exists
  if (document.getElementById('theme-toggle')) return;

  // Don't auto-inject - should be added to HTML manually
  console.log('Theme toggle not found in HTML. Add id="theme-toggle" to a button element.');
}

// ============ Setup Theme Toggle ============
/**
 * Attach event handler to theme toggle button
 */
function setupThemeToggle() {
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  toggle.addEventListener('click', toggleTheme);
  updateThemeToggleIcon();
}

// ============ Apply Theme Styles ============
/**
 * Insert CSS for theme switching
 */
function insertThemeStyles() {
  if (document.getElementById('theme-styles')) return; // Already inserted

  const style = document.createElement('style');
  style.id = 'theme-styles';
  style.textContent = `
    /* Root variables for themes */
    :root {
      --bg-primary: #000000;
      --bg-secondary: #1a1a1a;
      --bg-tertiary: #2d2d2d;
      --text-primary: #ffffff;
      --text-secondary: #a0a0a0;
      --border-color: #333333;
    }

    html.light {
      --bg-primary: #ffffff;
      --bg-secondary: #f5f5f5;
      --bg-tertiary: #eeeeee;
      --text-primary: #000000;
      --text-secondary: #666666;
      --border-color: #e0e0e0;
    }

    /* Light mode full page styling */
    html.light body {
      background-color: #ffffff !important;
      color: #000000 !important;
    }

    html.light {
      background-color: #ffffff;
      color: #000000;
    }

    /* Light mode - Navigation */
    html.light nav,
    html.light .fixed.top-5 {
      background: rgba(245, 245, 245, 0.9) !important;
    }

    html.light .nav-link {
      color: #1a1a1a !important;
    }

    html.light .nav-link:hover {
      background-color: #e0e0e0 !important;
    }

    /* Light mode - Sections and cards */
    html.light section {
      background-color: #ffffff !important;
      color: #000000 !important;
    }

    html.light .qa-block,
    html.light .bg-neutral-900,
    html.light .bg-neutral-800 {
      background-color: #f5f5f5 !important;
      border-color: #e0e0e0 !important;
      color: #000000 !important;
    }

    html.light h1,
    html.light h2,
    html.light h3,
    html.light h4,
    html.light h5,
    html.light h6 {
      color: #000000 !important;
    }

    html.light p,
    html.light span,
    html.light li,
    html.light a {
      color: #333333 !important;
    }

    html.light .text-neutral-300,
    html.light .text-neutral-400 {
      color: #666666 !important;
    }

    html.light .text-amber-400,
    html.light .text-amber-200 {
      color: #d97706 !important;
    }

    html.light .border-neutral-700,
    html.light .border-neutral-800 {
      border-color: #d0d0d0 !important;
    }

    html.light .bg-neutral-900\/40,
    html.light .bg-neutral-900\/80 {
      background-color: rgba(245, 245, 245, 0.5) !important;
    }

    html.light input,
    html.light textarea {
      background-color: #f5f5f5 !important;
      color: #000000 !important;
      border-color: #d0d0d0 !important;
    }

    html.light input::placeholder,
    html.light textarea::placeholder {
      color: #999999 !important;
    }

    html.light button {
      color: #000000 !important;
    }

    html.light article {
      background-color: #f5f5f5 !important;
      color: #000000 !important;
    }

    html.light .portfolio-img {
      background-color: #eeeeee !important;
    }

    html.light footer {
      border-color: #e0e0e0 !important;
      background-color: #f5f5f5 !important;
      color: #666666 !important;
    }

    /* Smooth transitions */
    * {
      transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
    }
  `;
  
  document.head.appendChild(style);
}

// ============ Listen for System Theme Changes ============
/**
 * Detect and respond to system theme preference changes
 */
function setupSystemThemeListener() {
  if (!window.matchMedia) return;

  const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  darkModeQuery.addEventListener('change', (e) => {
    // Only change if user hasn't set manual preference
    const stored = localStorage.getItem(THEME_CONFIG.STORAGE_KEY);
    if (!stored) {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme, false);
      updateThemeToggleIcon();
    }
  });
}

// ============ Initialize Theme System ============
/**
 * Complete theme setup and initialization
 */
function initializeThemeSystem() {
  // Insert theme styles
  insertThemeStyles();

  // Set initial theme
  const theme = getCurrentTheme();
  setTheme(theme, false);

  // Setup system listener
  setupSystemThemeListener();

  // Setup toggle if it exists
  const toggle = document.getElementById('theme-toggle');
  if (toggle) {
    setupThemeToggle();
  }

  console.log(`Theme system initialized with theme: ${theme}`);
}

// ============ Listen for Theme Changes ============
/**
 * Custom event listener for theme changes
 * Usage: window.addEventListener('themechange', (e) => { console.log(e.detail.theme); })
 */

// Initialize immediately (before DOMContentLoaded)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeThemeSystem);
} else {
  initializeThemeSystem();
}

// Also run immediately to prevent flash
initializeThemeSystem();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getSystemTheme,
    getCurrentTheme,
    setTheme,
    toggleTheme,
    updateThemeToggleIcon,
    createThemeToggleButton,
    injectThemeToggle,
    setupThemeToggle,
    insertThemeStyles,
    setupSystemThemeListener,
    initializeThemeSystem
  };
}
