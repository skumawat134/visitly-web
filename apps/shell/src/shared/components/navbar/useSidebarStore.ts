import { create } from 'zustand';

interface SidebarState {
    isLocationMode: boolean;
    isCollapsed: boolean;
    setLocationMode: (mode: boolean) => void;
    toggleCollapse: () => void;
    setCollapsed: (collapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set) => ({
    isLocationMode: false,
    isCollapsed: false,
    setLocationMode: (mode) => set({ isLocationMode: mode }),
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
}));
