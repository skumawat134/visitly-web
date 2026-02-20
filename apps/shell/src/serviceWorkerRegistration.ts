/**
 * Service Worker Registration for the Shell.
 *
 * Mirrors the Angular UpdateService behavior:
 * - Registers when stable or after 30s (registerWhenStable:30000)
 * - Checks for updates every 5 minutes
 * - On update: activates immediately → force reloads the page
 * - Retries up to 3 times on failure
 */

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes (same as Angular)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5_000;

let retryCount = 0;
let checkIntervalId: ReturnType<typeof setInterval> | null = null;

export function registerServiceWorker(): void {
    if (!('serviceWorker' in navigator)) return;
    // Only register in production
    if (process.env.NODE_ENV !== 'production') return;

    window.addEventListener('load', () => {
        const swUrl = '/service-worker.js';
        const REGISTER_TIMEOUT_MS = 30_000;

        let registered = false;

        const doRegister = () => {
            if (registered) return;
            registered = true;

            navigator.serviceWorker
                .register(swUrl)
                .then((registration) => {
                    console.log('[SW] Registered:', registration.scope);
                    setupUpdateDetection(registration);
                    startPeriodicChecks(registration);
                    setupOnlineRecheck(registration);
                })
                .catch((error) => {
                    console.error('[SW] Registration failed:', error);
                });
        };

        // Match Angular's registerWhenStable:30000
        if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(doRegister, { timeout: REGISTER_TIMEOUT_MS });
        } else {
            setTimeout(doRegister, REGISTER_TIMEOUT_MS);
        }
    });
}

/**
 * Detect when a new service worker is installed (= new deploy)
 * and force-refresh the page immediately.
 */
function setupUpdateDetection(registration: ServiceWorkerRegistration): void {
    // 1. Check for a worker that is already waiting (e.g. from a previous tab/load)
    if (registration.waiting) {
        console.log('[SW] Waiting worker found. Activating...');
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }

    // 2. Check for a worker that is currently installing
    if (registration.installing) {
        console.log('[SW] Installing worker found. Watching state...');
        trackInstallation(registration.installing);
    }

    // 3. Listen for future updates discovered during this session
    registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        console.log('[SW] Update found. State:', newWorker.state);
        trackInstallation(newWorker);
    });

    function trackInstallation(worker: ServiceWorker) {
        worker.addEventListener('statechange', () => {
            console.log('[SW] Worker state changed to:', worker.state);
            if (worker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                    // A new version was deployed — force activation
                    console.log('[SW] New version ready. Skipping waiting...');
                    worker.postMessage({ type: 'SKIP_WAITING' });
                } else {
                    console.log('[SW] Content cached for first time.');
                }
            }
        });
    }

    // When the new SW takes over via skipWaiting → clients.claim(),
    // reload the page so the user gets the latest version
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        console.log('[SW] Controller changed. Reloading page...');
        // Small delay to ensure activation completes fully across all tabs if needed
        setTimeout(() => {
            window.location.reload();
        }, 100);
    });
}

/**
 * Check for updates every 5 minutes (same as Angular UpdateService).
 */
function startPeriodicChecks(registration: ServiceWorkerRegistration): void {
    checkIntervalId = setInterval(() => {
        registration.update().catch((err) => {
            handleCheckError(err, registration);
        });
    }, CHECK_INTERVAL_MS);
}

/**
 * Re-check for updates when coming back online.
 */
function setupOnlineRecheck(registration: ServiceWorkerRegistration): void {
    window.addEventListener('online', () => {
        console.log('[SW] Back online — checking for updates.');
        registration.update().catch((err) => {
            handleCheckError(err, registration);
        });
    });
}

/**
 * Retry logic matching Angular's maxRetryAttempts: 3.
 */
function handleCheckError(error: Error, registration: ServiceWorkerRegistration): void {
    console.warn('[SW] Update check failed:', error.message);

    if (retryCount < MAX_RETRIES) {
        retryCount++;
        console.log(`[SW] Retrying (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY_MS}ms...`);
        setTimeout(() => {
            registration.update().catch(() => {
                // Silently fail on retry exhaustion
            });
        }, RETRY_DELAY_MS);
    } else {
        console.warn('[SW] Max retries reached. Will try again at next interval.');
        retryCount = 0;
    }
}
