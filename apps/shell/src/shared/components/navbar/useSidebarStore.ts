import { create } from 'zustand';

interface SidebarState {
    isLocationMode: boolean;
    isCollapsed: boolean;
    isMobileOpen: boolean;
    excludedSidbarRoutes: string[];
    excludedHeaderRoutes: string[];
    setLocationMode: (mode: boolean) => void;
    toggleCollapse: () => void;
    setCollapsed: (collapsed: boolean) => void;
    toggleMobileOpen: () => void;
    setMobileOpen: (open: boolean) => void;
    setSidebarExcludedRoutes: (routes: string[]) => void;
    isHeaderExcluded: (route: string) => boolean;
    isSidbarExcluded: (route: string) => boolean;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
    isLocationMode: false,
    isCollapsed: false,
    isMobileOpen: false,
    excludedHeaderRoutes: ['/onboarding', '/admin/onboarding', '/admin/internalAdmin/org-list', '/admin/dashboard/wallboard', '/dashboard/wallboard', '/admin/permaVisits'],
    excludedSidbarRoutes: ['/onboarding', '/admin/onboarding', '/admin/internalAdmin/org-list', '/admin/dashboard/wallboard', '/dashboard/wallboard', '/admin/permaVisits'],
    setLocationMode: (mode) => set({ isLocationMode: mode }),
    toggleCollapse: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
    setCollapsed: (collapsed) => set({ isCollapsed: collapsed }),
    toggleMobileOpen: () => set((state) => ({ isMobileOpen: !state.isMobileOpen })),
    setMobileOpen: (open) => set({ isMobileOpen: open }),
    setSidebarExcludedRoutes: (routes) => set({ excludedSidbarRoutes: routes }),
    isHeaderExcluded: (route) => {
        const { excludedHeaderRoutes } = get();
        return excludedHeaderRoutes.some(excluded => route.startsWith(excluded));
    },
    isSidbarExcluded: (route) => {
        const { excludedSidbarRoutes } = get();
        return excludedSidbarRoutes.some(excluded => route.startsWith(excluded));
    }
}));
