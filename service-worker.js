/**
 * KrishiUrja | BioRefinery Dashboard
 * Service Worker for Offline PWA Functionality in Rural India
 * Network-First with Cache Fallback for offline resilience
 */

const CACHE_NAME = 'biorefinery-dashboard-v1';

// Core static assets required for complete offline functionality
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './config.js',
  './apiClient.js',
  './translations.js',
  './app.js',
  './manifest.json',
  './icon.svg',
  './icon-192.png',
  './icon-512.png'
];

const EXTERNAL_CDN_ASSETS = [
  'https://cdn.jsdelivr.net/npm/chart.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// Install Event: Pre-cache local static assets first, then attempt CDN assets gracefully
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Pre-caching local static assets');
        // Pre-cache mandatory local shell first
        return cache.addAll(STATIC_ASSETS).then(() => {
          // Attempt external CDN caching gracefully without failing install
          return Promise.allSettled(
            EXTERNAL_CDN_ASSETS.map((url) =>
              fetch(url)
                .then((res) => {
                  if (res.ok) return cache.put(url, res);
                })
                .catch((err) => console.warn('[ServiceWorker] CDN pre-cache deferred:', err))
            )
          );
        });
      })
      .then(() => {
        // Activate worker immediately without waiting for page reload
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('[ServiceWorker] Critical pre-cache failure:', err);
      })
  );
});

// Activate Event: Clean up outdated caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log('[ServiceWorker] Removing obsolete cache:', name);
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => {
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch Event: Network-first strategy with offline cache fallback
self.addEventListener('fetch', (event) => {
  // Only intercept GET requests and valid HTTP/HTTPS schemes
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return; // Filter out chrome-extension://, data:, etc.

  event.respondWith(
    // Attempt to fetch from network first
    fetch(event.request)
      .then((networkResponse) => {
        // If network fetch succeeded, clone response and update cache dynamically
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network fetch failed -> User is offline
        // Intercept request and serve the cached asset
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // If navigation request and offline, fallback to root index.html
          if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }

          return new Response('Offline: Resource not cached.', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({ 'Content-Type': 'text/plain' })
          });
        });
      })
  );
});

