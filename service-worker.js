// Service Worker pro Bulldogo.cz - Caching strategie
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `bulldogo-cache-${CACHE_VERSION}`;

// Statické zdroje k cache (CSS, JS, obrázky)
const STATIC_ASSETS = [
    '/styles.css',
    '/electric-border.css',
    '/script.js',
    '/auth.js',
    '/firebase-init.js',
    '/fotky/bulldogo-logo.png'
];

// Strategie: Cache First (pro statické zdroje)
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        // Fallback na offline stránku, pokud existuje
        return new Response('Offline', { status: 503 });
    }
}

// Strategie: Network First (pro HTML stránky - vždy zkusit síť, pak cache)
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}

// Install event - cache statické zdroje
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((error) => {
                console.log('SW: Některé statické zdroje se nepodařilo cache:', error);
            });
        })
    );
    self.skipWaiting(); // Aktivovat ihned
});

// Activate event - vyčistit staré cache
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
    return self.clients.claim(); // Převzít kontrolu nad stránkami
});

// Fetch event - aplikovat strategie
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    
    // Ignorovat Firebase a externí API
    if (url.hostname.includes('firebase') || 
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('googleusercontent.com') ||
        url.hostname.includes('chimpstatic.com')) {
        return; // Nechat projít bez cache
    }
    
    // HTML stránky - Network First
    if (event.request.destination === 'document' || 
        event.request.headers.get('accept').includes('text/html')) {
        event.respondWith(networkFirst(event.request));
        return;
    }
    
    // CSS, JS, obrázky - Cache First
    if (event.request.destination === 'style' ||
        event.request.destination === 'script' ||
        event.request.destination === 'image' ||
        url.pathname.endsWith('.css') ||
        url.pathname.endsWith('.js')) {
        event.respondWith(cacheFirst(event.request));
        return;
    }
    
    // Ostatní - Network First
    event.respondWith(networkFirst(event.request));
});

