/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

declare const self: ServiceWorkerGlobalScope;

// ─── Precache (equivalent to Angular ngsw "app" assetGroup with installMode: prefetch) ───
// Workbox injects the manifest here at build time via InjectManifest plugin
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ─── Runtime Caching: Assets (equivalent to Angular ngsw "assets" assetGroup) ───
// installMode: lazy, updateMode: prefetch → StaleWhileRevalidate is the closest match
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

// ─── Skip waiting & claim clients immediately on update ───
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

self.addEventListener('activate', () => {
    self.clients.claim();
});
