import { create } from 'zustand';
import type { ToastStore } from './toast.type';

export const useToastStore = create<ToastStore>((set) => ({
    toast: null,
    showToast: (payload) => set({ toast: payload }),
    clearToast: () => set({ toast: null }),
}));
