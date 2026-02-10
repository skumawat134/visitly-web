
import { Outlet } from 'react-router-dom';
import { AppSidebar, Header } from '@/shared/components';
import { useState } from 'react';

const AppLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <div id="app-layout"  className='tw:bg-[#E5E9FF]'>
            {/* Sidebar */}
            <Header onToggle={() => setIsCollapsed(!isCollapsed)}  isCollapsed={isCollapsed}/>
            
            {/* Main content area */}
            <div className="tw:flex ">
                {/* Header */}
                <AppSidebar />
                {/* Routed content */}
                <main className="tw:flex-1 tw:overflow-auto">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default AppLayout;
