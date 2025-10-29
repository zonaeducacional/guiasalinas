const CACHE_NAME = 'salinas-guia-v1';
const assetsToCache = [
    './',
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                const cachePromises = assetsToCache.map(asset => {
                    return cache.add(new Request(asset, { mode: 'no-cors' })).catch(err => {
                        console.warn('Falha ao cachear asset: ', asset, err);
                    });
                });
                return Promise.all(cachePromises);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request).then(
                    networkResponse => {
                        if(!networkResponse || networkResponse.status !== 200) {}
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });
                        return networkResponse;
                    }
                ).catch(error => {
                    console.error('Fetch falhou (offline e sem cache): ', error, event.request.url);
                });
            })
    );
});