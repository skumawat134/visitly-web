import { datadogLogs } from '@datadog/browser-logs';
import { datadogRum } from '@datadog/browser-rum';
import { useAuthStore } from '@visitly/app-store';
import { create } from 'zustand';

export interface DataDogState {
    initialized: boolean;
}
export const useDataDogStatus = create<DataDogState>()(() => ({
    initialized: false,
}));

const dataDogConfig = {
    // Datadog is DISABLED for local development to avoid noise
    // Will only be enabled when running on deployed dev environment (not localhost)
    enabled: (process.env.DATA_DOG_ENABLED == "true" ? true : false) || false,
    applicationId: process.env['DATA_DOG_APP_APPLICATION_ID'] || '',
    clientToken: process.env['DATA_DOG_APP_CLIENT_TOKEN'] || '',
    site: 'us3.datadoghq.com',
    service: 'visitly-web',
    env: 'dev',
    version: '1.0.0',
    sessionSampleRate: 100,
    sessionReplaySampleRate: 100, // Set to 100% for dev to capture all sessions
    trackBfcacheViews: true,
    defaultPrivacyLevel: 'mask-user-input',
    // APM Configuration
    traceSampleRate: 100,
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,
    trackFrustrations: true,
    traceUrlConfig: [
        { match: /https:\/\/.*\.execute-api\.us-west-2\.amazonaws\.com/, propagatorTypes: ["tracecontext", "datadog"] },
        { match: "https://dev.visitly.io", propagatorTypes: ["tracecontext", "datadog"] }
    ]


}
export class DatadogService {

    initialize(): void {
        if (!dataDogConfig.enabled || useDataDogStatus.getState().initialized) return;
        datadogRum.init({
            applicationId: dataDogConfig.applicationId,
            clientToken: dataDogConfig.clientToken,
            site: dataDogConfig.site,
            service: dataDogConfig.service,
            env: dataDogConfig.env,
            sessionSampleRate: dataDogConfig.sessionSampleRate,
            sessionReplaySampleRate: dataDogConfig.sessionReplaySampleRate,
            trackBfcacheViews: dataDogConfig.trackBfcacheViews,
            defaultPrivacyLevel: 'mask-user-input',
            // APM Tracing Configuration
            trackUserInteractions: true,
            trackResources: true,
            trackLongTasks: true,
            enableExperimentalFeatures: ['clickmap', 'frustration-tracking', 'rage-clicks', 'error-collecting', 'session-replay', 'sourcemaps', 'custom-link-tracking', 'performance-timeline'],
            // APM Tracing Configuration
            allowedTracingUrls: dataDogConfig.traceUrlConfig as any[],
            traceSampleRate: 100,
            // Performance tracking
            trackViewsManually: false,
            version: dataDogConfig.version || '1.0.0',
        });

        // Initialize Logs
        datadogLogs.init({
            clientToken: dataDogConfig.clientToken,
            site: dataDogConfig.site,
            service: dataDogConfig.service,
            env: dataDogConfig.env,
            forwardErrorsToLogs: true,
            forwardConsoleLogs: ['log', 'error', 'warn', 'info', 'debug'],
            forwardReports: 'all',
            sessionSampleRate: 100,
        });

        // Start session replay recording
        datadogRum.startSessionReplayRecording();

        useDataDogStatus.setState({ initialized: true });
        const user = useAuthStore.getState().user;
        if (user) {
            this.setUser({
                id: user.email,
                name: user.firstName + ' ' + user.lastName,
                email: user.email,
                orgId: user.orgId,
                env: this.getEnvShortCode(),
            });
        }
    }

    // Optional: Add custom method to track user actions
    trackAction(name: string, context?: object): void {
        datadogRum.addAction(name, context);
    }

    // Start a custom timing to measure performance
    startTiming(name: string): void {
        if (useDataDogStatus.getState().initialized) {
            datadogRum.addTiming(name);
        }
    }

    // Add custom error tracking
    addError(error: Error, context?: object): void {
        if (useDataDogStatus.getState().initialized) {
            datadogRum.addError(error, context);
        }
    }

    // Track feature flags
    addFeatureFlag(name: string, value: any): void {
        if (useDataDogStatus.getState().initialized) {
            datadogRum.addFeatureFlagEvaluation(name, value);
        }
    }

    // Set user context for RUM
    setUser(user: { id: string; name?: string; email?: string;[key: string]: any }): void {
        if (useDataDogStatus.getState().initialized) {
            datadogRum.setUser(user);
        }
    }

    // Set additional user properties
    setUserProperty(key: string, value: any): void {
        if (useDataDogStatus.getState().initialized) {
            datadogRum.setUserProperty(key, value);
        }
    }

    // Clear user context (useful for logout)
    clearUser(): void {
        if (useDataDogStatus.getState().initialized) {
            datadogRum.clearUser();
        }
    }

    // Optional: Add custom method to log errors
    logError(error: Error, context?: object): void {
        datadogLogs.logger.error(error.message, context, error);
    }

    // Optional: Add custom method to log info
    logInfo(message: string, context?: object): void {
        datadogLogs.logger.info(message, context);
    }

    /**
   * Start session replay
   */
    startSessionReplay(): void {
        if (datadogRum && datadogRum.startSessionReplayRecording) {
            datadogRum.startSessionReplayRecording();
        }
    }

    /**
     * Stop session replay
     */
    stopSessionReplay(): void {
        if (datadogRum && datadogRum.stopSessionReplayRecording) {
            datadogRum.stopSessionReplayRecording();
        }
    }
    getEnvShortCode() {
        let val = null;
        const currentPath = window.location.hostname;
        switch (currentPath) {
            case 'localhost':
                val = 'localhost';
                break;
            case 'dev.visitly.io':
                val = 'dev';
                break;
            case 'stage.visitly.io':
                val = 'stage';
                break;
            case 'app.visitly.io':
                val = 'app';
                break;
            default:
                break;

        }
        return val;

    }
}