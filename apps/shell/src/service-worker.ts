/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// ─── Precache App Shell ───
// Workbox injects the manifest at build time via InjectManifest plugin
// This caches index.html, JS bundles, CSS — equivalent to Angular ngsw "app" assetGroup
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ─── Runtime Caching: Assets (images, fonts) ───
registerRoute(
    ({ request }) =>
        request.destination === 'image' ||
        request.destination === 'font' ||
        request.url.includes('/assets/'),
    new StaleWhileRevalidate({
        cacheName: 'assets-cache',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
            }),
        ],
    })
);

// ─── Runtime Caching: CSS/JS not in precache (e.g. MFE remotes) ───
registerRoute(
    ({ request }) =>
        request.destination === 'script' || request.destination === 'style',
    new StaleWhileRevalidate({
        cacheName: 'static-resources',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
    })
);

// ─── Force Refresh on Deploy ───
// When the Shell posts SKIP_WAITING, activate immediately so the new
// precache manifest takes effect. The registration code then reloads the page.
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Claim all open tabs immediately after activation so cached resources
// from the new version are served right away
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});
