/**
 * Registers the service worker in production.
 * Mirrors the Angular ngsw registrationStrategy: 'registerWhenStable:30000'
 * — registers either when the page is idle or after 30s, whichever comes first.
 */
export function registerServiceWorker() {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        // Wait for page load to avoid competing with critical resources
        window.addEventListener('load', () => {
            const swUrl = '/service-worker.js';
            const TIMEOUT_MS = 30_000;

            let registered = false;

            const doRegister = () => {
                if (registered) return;
                registered = true;

                navigator.serviceWorker
                    .register(swUrl)
                    .then((registration) => {
                        console.log('[SW] Registered:', registration.scope);

                        // Listen for updates
                        registration.onupdatefound = () => {
                            const installingWorker = registration.installing;
                            if (!installingWorker) return;

                            installingWorker.onstatechange = () => {
                                if (installingWorker.state === 'installed') {
                                    if (navigator.serviceWorker.controller) {
                                        // New content available — prompt user or auto-activate
                                        console.log('[SW] New content available; will be used on next reload.');
                                        installingWorker.postMessage({ type: 'SKIP_WAITING' });
                                    } else {
                                        console.log('[SW] Content is cached for offline use.');
                                    }
                                }
                            };
                        };
                    })
                    .catch((error) => {
                        console.error('[SW] Registration failed:', error);
                    });
            };

            // Strategy: register when stable or after 30s (matching Angular's registerWhenStable:30000)
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(doRegister, { timeout: TIMEOUT_MS });
            } else {
                setTimeout(doRegister, TIMEOUT_MS);
            }
        });
    }
}
