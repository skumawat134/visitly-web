import axios, { AxiosInstance } from "axios";

export interface ApiClientOptions {
  baseURL: string;
  getToken?: () => string | undefined;
  onUnauthorized?: () => void;
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
    return config;
  });

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        options.onUnauthorized?.();
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
