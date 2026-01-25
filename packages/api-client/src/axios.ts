import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
declare module 'axios' {
  export interface AxiosRequestConfig {
    _skipGlobalError?: boolean;
  }
}
export interface ApiClientOptions {
  baseURL: string;
  getToken?: () => string | undefined;
  onUnauthorized?: () => void;
  onError?: (message: string, status?: number) => void;
}

let apiClient: AxiosInstance | null = null;

export function initApiClient(options: ApiClientOptions): AxiosInstance {
  if (apiClient) {
    return apiClient;
  }

  apiClient = axios.create({
    baseURL: options.baseURL,
    headers: {
      "Content-Type": "application/json"
    }
  });

  apiClient.interceptors.request.use((config) => {
    const token = options.getToken?.();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add tracing headers for end-to-end observability
    try {
      // Get user info from session storage for tracing context
      const authSessionStr = sessionStorage.getItem('auth-session');
      if (authSessionStr && config.headers) {
        const authSession = JSON.parse(authSessionStr);
        const user = authSession?.state?.user;
        if (user?.orgId) {
          config.headers['orgid'] = user.orgId.toString();
        }
        if (user?.id) {
          config.headers['userid'] = user.id.toString();
        }
      }

      // Add device ID if available
      const deviceId = sessionStorage.getItem('deviceId');
      if (deviceId && config.headers) {
        config.headers['deviceid'] = deviceId;
      }
    } catch {
      // Ignore parsing errors
    }

    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Check if the specific request asked to skip global error handling
      const skipGlobal = error.config?._skipGlobalError;
      
      if (!skipGlobal) {
        const { response } = error;
        const status = response?.status;

        if (!response || status === 0) {
          options.onError?.('Network error. Please contact support@visitly.io', 0);
        } else if (status === 400) {
          options.onError?.(response.data?.message || 'Bad Request', 400);
        } else if (status === 401) {
          options.onUnauthorized?.();
        } else if (status >= 500) {
          options.onError?.('Server error. Please try again later.', status);
        }
      }

      return Promise.reject(error);
    }
  );

  return apiClient;
}

export function getApiClient(): AxiosInstance {
  if (!apiClient) {
    throw new Error(
      "ApiClient not initialized. Call initApiClient() in the shell first."
    );
  }
  return apiClient;
}
