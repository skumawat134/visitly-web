
https://3vza0x99ll.execute-api.us-west-2.amazonaws.com/development/v1/visit/preregister


https://3vza0x99ll.execute-api.us-west-2.amazonaws.com/development/v1/visit/preregister





Request URL
https://3vza0x99ll.execute-api.us-west-2.amazonaws.com/development/v1/visit/preregister/b5bb5c44-8ae0-48c0-910f-109891d59b1f?updateType=SELECTED_VISIT


sanjayK@12345

skumawat@visitly.io
sanjayK@12345

created sidebar and header including location select (some css issue needs to be fix)
write custom event for navigation between react and angular.
(remove sidebar and header from angular)

sync/feat




import { Outlet } from 'react-router-dom';
import { AppSidebar, AppHeader, useSidebarStore } from '@/shared/components';
import { useState } from 'react';

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
