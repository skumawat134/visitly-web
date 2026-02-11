
import { Outlet } from 'react-router-dom';
import { AppSidebar, AppHeader, useSidebarStore } from '@/shared/components';

const AppLayout = () => {
    const {isCollapsed, setCollapsed} = useSidebarStore();
    return (
        <div id="app-layout"  className='tw:bg-[#E5E9FF]'>
            {/* Sidebar */}
            <AppHeader onToggle={() => setCollapsed(!isCollapsed)}  isCollapsed={isCollapsed}/>
            
            {/* Main content area */}
            <div className="tw:flex ">
                {/* Header */}
                <AppSidebar  />
                {/* Routed content */}
                <main className="tw:flex-1 tw:overflow-auto">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default AppLayout;
