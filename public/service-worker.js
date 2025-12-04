/**
 * Service Worker
 * Enables offline support, caching, and PWA capabilities
 * 
 * SETUP:
 * 1. Include in main pages: navigator.serviceWorker.register('/public/service-worker.js')
 * 2. Add to index.html <head>: <meta name="theme-color" content="#000000">
 * 3. Test in DevTools > Application > Service Workers
 */

const CACHE_NAME = 'khadeeja-designs-v1';
const RUNTIME_CACHE = 'khadeeja-designs-runtime-v1';
const IMAGE_CACHE = 'khadeeja-designs-images-v1';

// Files to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/public/styles.css',
  '/blogs/blogs.html',
  '/blogs/blogs.json',
  '/public/utils.js',
  '/public/image-optimizer.js',
  '/public/analytics.js',
  '/public/schema-generator.js',
  '/public/table-of-contents.js',
  '/public/related-posts.js',
  '/public/newsletter.js',
  '/public/theme-toggle.js',
  '/public/offline.html' // Fallback offline page
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// ============ Install Event ============
/**
 * Cache static assets when service worker installs
 */
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker installed');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('Install error:', error);
      })
  );
});

// ============ Activate Event ============
/**
 * Clean up old caches when new service worker activates
 */
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME &&
                cacheName !== RUNTIME_CACHE &&
                cacheName !== IMAGE_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// ============ Fetch Event ============
/**
 * Handle all fetch requests with caching strategies
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external APIs
  if (url.origin !== self.location.origin) {
    return;
  }

  // HTML - Network First
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, RUNTIME_CACHE));
    return;
  }

  // Images - Cache First
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // CSS & JS - Cache First
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // JSON - Stale While Revalidate
  if (request.url.includes('.json')) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirst(request, RUNTIME_CACHE));
});

// ============ Cache First Strategy ============
/**
 * Return from cache if available, otherwise fetch from network
 * @param {Request} request
 * @param {string} cacheName
 * @returns {Promise<Response>}
 */
async function cacheFirst(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    const response = await fetch(request);
    
    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;

  } catch (error) {
    console.error('Fetch error:', error);
    return createOfflineResponse();
  }
}

// ============ Network First Strategy ============
/**
 * Try network first, fall back to cache if offline
 * @param {Request} request
 * @param {string} cacheName
 * @returns {Promise<Response>}
 */
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }

    return response;

  } catch (error) {
    console.error('Network error, trying cache:', error);
    
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline page for HTML requests
    if (request.mode === 'navigate') {
      return caches.match('/public/offline.html') ||
             createOfflineResponse();
    }

    return createErrorResponse();
  }
}

// ============ Stale While Revalidate Strategy ============
/**
 * Return cache immediately, update in background
 * @param {Request} request
 * @param {string} cacheName
 * @returns {Promise<Response>}
 */
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const cache = caches.open(cacheName);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => cached || createErrorResponse());

  return cached || fetchPromise;
}

// ============ Response Helpers ============
/**
 * Create offline fallback response
 * @returns {Response}
 */
function createOfflineResponse() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Offline</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #000;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          padding: 20px;
        }
        .container {
          text-align: center;
          max-width: 500px;
        }
        h1 { font-size: 2.5em; margin-bottom: 10px; }
        p { font-size: 1.2em; margin: 20px 0; color: #aaa; }
        button {
          background: #ec4899;
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 1em;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 20px;
        }
        button:hover { background: #db2777; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🌐 You're Offline</h1>
        <p>It looks like you've lost internet connection.</p>
        <p>Some cached content may still be available.</p>
        <button onclick="location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
    status: 503,
    statusText: 'Service Unavailable'
  });
}

/**
 * Create error response
 * @returns {Response}
 */
function createErrorResponse() {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Error</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          background: #000;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        h1 { color: #ec4899; }
      </style>
    </head>
    <body>
      <div style="text-align: center;">
        <h1>⚠️ Error Loading Resource</h1>
        <p>We couldn't load this resource. Please try again.</p>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
    status: 500,
    statusText: 'Server Error'
  });
}

// ============ Background Sync ============
/**
 * Queue failed requests for retry when online
 * Usage: In your fetch error handler, trigger: event.waitUntil(registration.sync.register('retry-requests'))
 */
self.addEventListener('sync', (event) => {
  if (event.tag === 'retry-requests') {
    event.waitUntil(retryFailedRequests());
  }
});

/**
 * Retry failed requests
 */
async function retryFailedRequests() {
  const db = await openFailedRequestsDB();
  const failedRequests = await db.getAll();

  for (const req of failedRequests) {
    try {
      const response = await fetch(req.url, req.options);
      if (response.ok) {
        await db.delete(req.id);
      }
    } catch (error) {
      console.error('Retry failed:', error);
    }
  }
}

/**
 * Open IndexedDB for storing failed requests
 */
function openFailedRequestsDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('khadeeja-failed-requests', 1);
    
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id', autoIncrement: true });
      }
      resolve(db.transaction('requests', 'readwrite').objectStore('requests'));
    };
  });
}

// ============ Message Handlers ============
/**
 * Handle messages from clients
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    const { urls } = event.data;
    caches.open(RUNTIME_CACHE).then((cache) => {
      cache.addAll(urls);
    });
  }
});

// ============ Version Info ============
console.log('Service Worker loaded - Version 1.0');
console.log(`Cache strategy: Cache-First for assets, Network-First for pages`);
