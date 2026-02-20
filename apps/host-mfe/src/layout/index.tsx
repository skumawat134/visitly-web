
import { Outlet } from 'react-router-dom';
import { Header, Sidebar } from '@/shared/components';
import { useState } from 'react';
import { HostBanner } from '@/shared/components/HostBanner';

const HostLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <div id="host-layout" className="tw:flex tw:flex-col tw:h-screen">
            {/* banner + header - fixed */}
            <div className="tw:flex-shrink-0 tw:sticky tw:top-0 tw:z-50">
                <HostBanner />
            </div>
             <div className="tw:flex-shrink-0 tw:sticky tw:top-0 tw:z-40">
                        <Header onToggle={() => setIsCollapsed(!isCollapsed)} isCollapsed={isCollapsed}/>
            </div>
            
            {/* Header + Sidebar + Main content */}
            <div className="tw:flex tw:flex-1 tw:overflow-hidden">
                {/* Sidebar - resizable */}
                <div className="tw:sticky tw:top-0 tw:transition-all tw:duration-300">
                    <Sidebar isCollapsed={isCollapsed}/>
                </div>
                
                {/* Main content - scrollable */}
                <div className="tw:flex tw:flex-col tw:flex-1 tw:overflow-hidden">
                   
                    
                    {/* Routed content - scrollable */}
                    <main className="tw:flex-1 tw:overflow-auto">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default HostLayout;
