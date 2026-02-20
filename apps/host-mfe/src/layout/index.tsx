
import { Outlet } from 'react-router-dom';
import { Header, Sidebar } from '@/shared/components';
import { useState } from 'react';
import { HostBanner } from '@/shared/components/HostBanner';

const HostLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <div id="host-layout" >
            {/* banner */}
            <HostBanner />
            {/* Sidebar */}
            <Header onToggle={() => setIsCollapsed(!isCollapsed)}  isCollapsed={isCollapsed}/>
            
            {/* Main content area */}
            <div className="tw:flex">
                {/* Header */}
                <Sidebar isCollapsed={isCollapsed} />
                {/* Routed content */}
                <main className="tw:flex-1 tw:overflow-auto">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default HostLayout;
