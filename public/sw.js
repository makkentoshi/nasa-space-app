// Service Worker for ResQ PWA
const CACHE_NAME = 'resq-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
];

// Install service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Activate service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch handler - network first, then cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and other schemes
  if (!event.request.url.startsWith('http')) return;

  // Skip external API calls that may have CORS issues
  // Let the browser handle these directly without SW intervention
  const url = event.request.url;
  if (url.includes('nominatim.openstreetmap.org') || 
      url.includes('wttr.in') ||
      url.includes('earthquake.usgs.gov')) {
    // Don't intercept - let browser handle CORS
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache API calls or streaming responses
        if (event.request.url.includes('/api/') || 
            event.request.url.includes('_next/static/')) {
          return response;
        }

        // Validate response before caching
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response before caching
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        }).catch(() => {
          // Ignore cache errors
        });

        return response;
      })
      .catch(() => {
        // If network fails, try cache
        return caches.match(event.request);
      })
  );
});
