
import { Outlet } from 'react-router-dom';
import { Header, Sidebar } from '@/shared/components';
import { useState } from 'react';

const IntegrationLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <div id="integration-layout"  className='tw:bg-[#E5E9FF]'>
            {/* Sidebar */}
            <Header onToggle={() => setIsCollapsed(!isCollapsed)}  isCollapsed={isCollapsed}/>
            
            {/* Main content area */}
            <div className="tw:flex ">
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

export default IntegrationLayout;
