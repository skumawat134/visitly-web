import { create } from 'zustand';

interface SidebarState {
    isLocationMode: boolean;
    isCollapsed: boolean;
    excludedRoutes: string[];
    setLocationMode: (mode: boolean) => void;
    toggleCollapse: () => void;
    setCollapsed: (collapsed: boolean) => void;
    setExcludedRoutes: (routes: string[]) => void;
    isExcluded: (route: string) => boolean;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
    isLocationMode: false,
    isCollapsed: false,
    excludedRoutes: ['/onboarding', '/admin/onboarding'],
    setLocationMode: (mode) => set({ isLocationMode: mode }),
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    setExcludedRoutes: (routes) => set({ excludedRoutes: routes }),
    isExcluded: (route) => {
        const { excludedRoutes } = get();
        return excludedRoutes.some(excluded => route.startsWith(excluded));
    },
}));
