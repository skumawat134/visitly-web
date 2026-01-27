
export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastPayload {
  message: string;
  type?: ToastType;
  options?: Record<string, any>;
}

export interface ToastStore {
  toast: ToastPayload | null;
  showToast: (payload: ToastPayload) => void;
  clearToast: () => void;
}

