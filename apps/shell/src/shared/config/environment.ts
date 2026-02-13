// Detect if running locally (localhost or 127.0.0.1)
const isLocalDevelopment = (): boolean => {
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        return hostname === 'localhost' || hostname === '127.0.0.1';
    }
    return false;
};

// Detect environment from URL
const getEnvironment = (): 'dev' | 'stage' | 'prod' => {
    if (typeof window === 'undefined') return 'dev';
    const hostname = window.location.hostname;
    if (hostname.includes('app.visitly.io')) return 'prod';
    if (hostname.includes('stage.visitly.io')) return 'stage';
    return 'dev';
};

// Get Middleware target URL based on environment
const getMiddlewareTarget = (): string => {
    const env = getEnvironment();
    if (env === 'prod') return 'https://sryce.middleware.io';
    if (env === 'stage') return 'https://sryce-lvs.middleware.io';
    return 'https://sryce-ufg.middleware.io'; // dev
};

// Check if Middleware should be enabled
const isMiddlewareEnabled = (): boolean => {
    const env = getEnvironment();
    return (env === 'prod' || env === 'stage' || env === 'dev') && !isLocalDevelopment();
};

// Get API origin for CORS trace propagation
const getApiOrigin = (): string => {
    const env = getEnvironment();
    if (env === 'prod') return 'https://api.visitly.io';
    if (env === 'stage') return 'https://stage.visitly.io';
    return 'https://dev.visitly.io';
};

export const environment = {
    env: getEnvironment(),
    apiOrigin: getApiOrigin(),
    middleware: {
        // Middleware is DISABLED for local development to avoid noise
        enabled: isMiddlewareEnabled(),
        accountKey: process.env.VITE_MW_ACCOUNT_KEY || '',
        target: getMiddlewareTarget(),
        // serviceName: 'portal-web',
        serviceName:"visitly-mfe",
        projectName:"visitly-mfe",
        // projectName: `visitly-${getEnvironment()}`,
        env: getEnvironment(),
        version: process.env.VITE_APP_VERSION || '1.0.0',
        // RUM/Session recording disabled by default - only traces are captured
        // Call middlewareService.enableSessionRecording() to enable on demand
        sessionRecording: false,
    },
};
