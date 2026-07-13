const CACHE_NAME = 'organizer-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles/main.css',
  '/js/app.js',
  '/js/firebase-config.js',
  '/js/db.js',
  '/js/navigation.js',
  '/js/savings.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});