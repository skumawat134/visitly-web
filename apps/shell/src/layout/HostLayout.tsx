
import { Outlet } from 'react-router-dom';
import { Header, Sidebar } from '@/shared/components';
import { useState } from 'react';

const HostLayout = () => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <div id="host-layout" className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64">
                <Sidebar isCollapsed={isCollapsed} />
            </aside>
            {/* Main content area */}
            <div className="flex flex-col flex-1">
                {/* Header */}
                <header>
                    <Header onToggle={() => setIsCollapsed(!isCollapsed)}  isCollapsed={isCollapsed}/>
                </header>
                {/* Routed content */}
                <main className="flex-1 overflow-auto">
                    <Outlet />
                </main>

            </div>
        </div>
    );
};

export default HostLayout;
