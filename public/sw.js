/* KK Nyilvántartó — Service Worker
 *
 * Cache-stratégia: WHITELIST-elvű. Kizárólag a hash-elt statikus assetek
 * (/build/*) és a Google Fonts kerülnek cache-be — MINDEN más kérést a SW
 * nem fog meg (session, CSRF, /api/*, /ai/* SSE stream, /broadcasting/*
 * WebSocket auth), így az autentikáció nem tud cache miatt elromlani.
 */

const VERSION = 'v2';
const STATIC_CACHE = `kk-static-${VERSION}`;
const FONT_CACHE = `kk-fonts-${VERSION}`;

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((k) => k.startsWith('kk-') && k !== STATIC_CACHE && k !== FONT_CACHE)
                    .map((k) => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const { request } = event;
    if (request.method !== 'GET') return;

    const url = new URL(request.url);

    // 1) Vite build assetek: hash-elt fájlnevek → cache-first (immutable)
    if (url.origin === self.location.origin && url.pathname.startsWith('/build/')) {
        event.respondWith(cacheFirst(request, STATIC_CACHE));
        return;
    }

    // 2) PWA ikonok + manifest → stale-while-revalidate
    if (url.origin === self.location.origin &&
        (url.pathname.startsWith('/icons/') || url.pathname === '/manifest.webmanifest')) {
        event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
        return;
    }

    // 3) Google Fonts → stale-while-revalidate
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
        return;
    }

    // 4) MINDEN MÁS (HTML, session, CSRF, /api/*, /ai/*, /broadcasting/*):
    //    a SW nem avatkozik be — natív hálózati kérés megy.
});

async function cacheFirst(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    const network = fetch(request)
        .then((response) => {
            if (response.ok) cache.put(request, response.clone());
            return response;
        })
        .catch(() => cached);
    return cached || network;
}

/* ── Web Push ──────────────────────────────────────────────── */

self.addEventListener('push', (event) => {
    if (!event.data) return;

    let payload = {};
    try {
        payload = event.data.json();
    } catch {
        payload = { title: 'KK Nyilvántartó', body: event.data.text() };
    }

    const title = payload.title || 'KK Nyilvántartó';
    const options = {
        body: payload.body || '',
        icon: payload.icon || '/icons/icon-192.png',
        badge: payload.badge || '/icons/badge-72.png',
        tag: payload.tag || 'kk-notification',
        renotify: true,
        data: { url: (payload.data && payload.data.url) || '/' },
        lang: 'hu',
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    const targetUrl = (event.notification.data && event.notification.data.url) || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Ha már nyitva van az app, fókuszáljuk és navigáljunk
            for (const client of windowClients) {
                if (client.url.startsWith(self.location.origin) && 'focus' in client) {
                    client.focus();
                    if ('navigate' in client && client.url !== targetUrl) {
                        return client.navigate(targetUrl).catch(() => {});
                    }
                    return;
                }
            }
            return clients.openWindow(targetUrl);
        })
    );
});
