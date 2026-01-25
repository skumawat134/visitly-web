import { environment } from '../config/environment';

declare global {
    interface Window {
        Middleware: any;
    }
}

class MiddlewareService {
    private initialized = false;
    private middleware: any = null;

    initialize(): void {
        if (!environment.middleware.enabled || this.initialized) return;

        // Check if Middleware SDK is loaded via CDN script in index.html
        if (typeof window.Middleware === 'undefined') {
            console.warn('Middleware SDK not loaded. Make sure the CDN script is added to index.html');
            return;
        }

        // Initialize Middleware RUM
        this.middleware = window.Middleware;
        this.middleware.track({
            serviceName: environment.middleware.serviceName,
            projectName: environment.middleware.projectName,
            accountKey: environment.middleware.accountKey,
            target: environment.middleware.target,
            sessionRecording: environment.middleware.sessionRecording,
            tracePropagationTargets: [/.*/],
            defaultAttributes: {
                'app.environment': environment.middleware.env,
                'app.version': environment.middleware.version,
            },
        });

        this.initialized = true;
        console.info('Middleware RUM initialized for portal-web');
    }

    // Track custom actions
    trackAction(name: string, context?: object): void {
        if (this.initialized && this.middleware) {
            this.middleware.sendCustomEvent(name, context);
        }
    }

    // Add custom error tracking
    addError(error: Error, context?: object): void {
        if (this.initialized && this.middleware) {
            this.middleware.sendError(error, context);
        }
    }

    // Set user context for RUM
    setUser(user: { id: string; name?: string; email?: string; [key: string]: unknown }): void {
        if (this.initialized && this.middleware) {
            this.middleware.setUser(user);
        }
    }

    // Set additional user properties
    setUserProperty(key: string, value: unknown): void {
        if (this.initialized && this.middleware) {
            this.middleware.setAttribute(key, value);
        }
    }

    // Clear user context (useful for logout)
    clearUser(): void {
        if (this.initialized && this.middleware) {
            this.middleware.setUser(null);
        }
    }

    // Log error
    logError(message: string, context?: object, error?: Error): void {
        if (this.initialized && this.middleware) {
            this.middleware.error(message, { ...context, error });
        }
    }

    // Log info
    logInfo(message: string, context?: object): void {
        if (this.initialized && this.middleware) {
            this.middleware.info(message, context);
        }
    }

    // Log warning
    logWarn(message: string, context?: object): void {
        if (this.initialized && this.middleware) {
            this.middleware.warn(message, context);
        }
    }

    /**
     * Enable session recording on demand.
     * Call this method when you need to start capturing session replay.
     */
    enableSessionRecording(): void {
        if (!this.initialized || !this.middleware) {
            console.warn('Middleware not initialized. Cannot enable session recording.');
            return;
        }

        this.middleware.track({
            serviceName: environment.middleware.serviceName,
            projectName: environment.middleware.projectName,
            accountKey: environment.middleware.accountKey,
            target: environment.middleware.target,
            sessionRecording: true,
            tracePropagationTargets: [/.*/],
            defaultAttributes: {
                'app.environment': environment.middleware.env,
                'app.version': environment.middleware.version,
            },
        });

        console.info('Middleware session recording enabled');
    }

    /**
     * Disable session recording.
     * Call this method when you want to stop capturing session replay.
     */
    disableSessionRecording(): void {
        if (!this.initialized || !this.middleware) {
            console.warn('Middleware not initialized. Cannot disable session recording.');
            return;
        }

        this.middleware.track({
            serviceName: environment.middleware.serviceName,
            projectName: environment.middleware.projectName,
            accountKey: environment.middleware.accountKey,
            target: environment.middleware.target,
            sessionRecording: false,
            tracePropagationTargets: [/.*/],
            defaultAttributes: {
                'app.environment': environment.middleware.env,
                'app.version': environment.middleware.version,
            },
        });

        console.info('Middleware session recording disabled');
    }
}

export const middlewareService = new MiddlewareService();
