/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
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

// ─── Runtime Caching: MFE Remote Entries (Manifests) ───
// These must be NetworkFirst to ensure we always point to the latest chunks
// even if the Shell hasn't been redeployed.
registerRoute(
    ({ url }) => url.pathname.endsWith('remoteEntry.js'),
    new NetworkFirst({
        cacheName: 'mfe-remote-entries',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
    })
);

// ─── Runtime Caching: ONLY Shell-owned CSS/JS ───
// Never cache any JS coming from remote MFEs
registerRoute(
    ({ request, url }) => {

        // Only handle scripts/styles
        if (request.destination !== 'script' && request.destination !== 'style')
            return false;

        // ❌ Never cache remoteEntry
        if (url.pathname.endsWith('remoteEntry.js'))
            return false;

        // ❌ Never cache federated chunks
        if (/\.chunk\..*\.js$/.test(url.pathname))
            return false;

        // ❌ Never cache any script coming from another origin (MFEs)
        if (url.origin !== self.location.origin)
            return false;

        // ✅ Cache only shell-owned static JS/CSS
        return true;
    },
    new StaleWhileRevalidate({
        cacheName: 'shell-static-resources',
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
