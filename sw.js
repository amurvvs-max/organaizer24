const CACHE_NAME = 'organizer-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/main.css',
  '/app.js',
  '/firebase-config.js',
  '/db.js',
  '/navigation.js',
  '/savings.js',
  '/car.js',
  '/notes.js'
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
