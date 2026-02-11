
import { Outlet } from 'react-router-dom';
import { HostHeader,HostSidebar } from '@/shared/components';
import { useState } from 'react';

const HostLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <div id="host-layout"  >
            {/* Sidebar */}
            <HostHeader onToggle={() => setIsCollapsed(!isCollapsed)}  isCollapsed={isCollapsed}/>
            
            {/* Main content area */}
            <div className="tw:flex">
                {/* Header */}
                <HostSidebar isCollapsed={isCollapsed} />
                {/* Routed content */}
                <main className="tw:flex-1 tw:overflow-auto">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default HostLayout;
