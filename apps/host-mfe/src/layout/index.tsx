import { Outlet } from 'react-router-dom';
import { Header, Sidebar } from '@/shared/components';
import { useState } from 'react';
import { HostBanner } from '@/shared/components/HostBanner';

const HostLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div id="host-layout" className="tw:flex tw:flex-col tw:h-screen tw:overflow-hidden">

            {/* Banner — fixed strip at top */}
            <div className="tw:flex-shrink-0">
                <HostBanner />
            </div>

            {/* Header — fixed strip below banner */}
            <div className="tw:flex-shrink-0">
                <Header
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                    isCollapsed={isCollapsed}
                    onMobileMenuToggle={() => setIsMobileOpen(true)}
                />
            </div>

            {/* Body: sidebar + main — takes remaining height, NO overflow here */}
            <div className="tw:flex tw:flex-1 tw:min-h-0">
                {/* Sidebar — scrolls internally via its own styles */}
                <Sidebar
                    isCollapsed={isCollapsed}
                    isMobileOpen={isMobileOpen}
                    onMobileClose={() => setIsMobileOpen(false)}
                />

                {/* Main content — only scroll zone */}
                <main className="tw:flex-1 tw:overflow-y-auto tw:min-h-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default HostLayout;
