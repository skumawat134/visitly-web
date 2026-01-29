import axios from "axios";
import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
declare module 'axios' {
  export interface AxiosRequestConfig {
    _skipGlobalError?: boolean;
  }
}
export interface ApiClientOptions {
  baseURL: string;
  refreshTokenUrl?: string,
  getToken?: () => string | undefined;
  onUnauthorized?: () => void;
  onError?: (message: string, status?: number) => void;
  getRefreshToken?: () => string | undefined;
  onTokenRefresh?: ({ accessToken }: { accessToken: string }) => void
}

let apiClient: AxiosInstance | null = null;
let isRefreshing = false;
let pendingRequests: Array<(token: string) => void> = [];


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
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
      // let calling code handle it
      if (originalRequest.url?.includes('/login')) {
        return Promise.reject(error);
      }
      const status = error.response?.status;
      const shouldRefresh =
        (status === 401 || status === 403) &&
        !originalRequest._retry &&
        options.getRefreshToken &&
        options.refreshTokenUrl;

      if (!shouldRefresh) {
        // ⬇️ normal global error handling
        const skipGlobal = originalRequest?._skipGlobalError;
        if (!skipGlobal) {
          if (!error.response || status === 0) {
            options.onError?.(
              'Network error. Please contact support@visitly.io',
              0
            );
          } else if (status === 400) {
            options.onError?.(
              error.response.data?.message || 'Bad Request',
              400
            );
          } else if (status === 401) {
            options.onUnauthorized?.();
          } else if (status && status >= 500) {
            options.onError?.('Server error. Please try again later.', status);
          }
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((token: string) => {
            if (!originalRequest.headers) return reject(error);
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient!(originalRequest));
          });
        });
      }
      isRefreshing = true;
      try {
        const refreshToken = options.getRefreshToken!();
        if (!refreshToken) {
          options.onUnauthorized?.();
          pendingRequests = [];
          return Promise.reject(error);
        }

        const refreshResponse = await axios.post(
          options.refreshTokenUrl!,
          { refreshToken }
        );

        const accessToken = refreshResponse.data?.accessToken;
        if (!accessToken) {
          throw new Error('No access token returned');
        }

        options.onTokenRefresh?.({ accessToken });

        pendingRequests.forEach((cb) => cb(accessToken));
        pendingRequests = [];

        originalRequest.headers!.Authorization = `Bearer ${accessToken}`;
        return apiClient!(originalRequest);
      } catch (refreshError) {
        pendingRequests = [];
        options.onUnauthorized?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
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
