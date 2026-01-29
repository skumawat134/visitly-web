import { create } from 'zustand';
import type { LoaderState } from './loader.types';

export const useLoaderStore = create<LoaderState>((set) => ({
  isLoading: false,

  showLoader: () => set({ isLoading: true }),

  stopLoader: () => set({ isLoading: false }),
}));
