import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar, AppHeader, useSidebarStore } from '@/shared/components';

const AppLayout = () => {
    const { isCollapsed, setCollapsed, isSidbarExcluded, isHeaderExcluded } = useSidebarStore();
    const location = useLocation();
    const hideSidbar = isSidbarExcluded(location.pathname);
    const hideHeader = isHeaderExcluded(location.pathname);
    if (hideSidbar && hideHeader) {
        return <Outlet />;
    }
    if (hideSidbar && !hideHeader) {
        return (
            <div id="app-layout" className='tw:bg-[#E5E9FF]'>
                <AppHeader onToggle={() => setCollapsed(!isCollapsed)} isCollapsed={isCollapsed} />
                <main className="tw:overflow-auto">
                    <Outlet />
                </main>
            </div>
        );
    }
    return (
        <div id="app-layout-full" className='tw:bg-[#E5E9FF] tw:flex tw:flex-col tw:h-screen'>
            {/* Header */}
            <AppHeader onToggle={() => setCollapsed(!isCollapsed)} isCollapsed={isCollapsed} />

            {/* Main content area */}
            <div className="tw:flex tw:flex-1 tw:min-h-0 tw:overflow-hidden">
                {/* Sidebar */}
                <AppSidebar />
                {/* Routed content */}
                <main className="tw:bg-[#f8fafc] tw:flex-1 tw:min-w-0 tw:min-h-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
