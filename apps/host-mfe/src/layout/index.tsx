
import { Outlet } from 'react-router-dom';
import { Header, Sidebar } from '@/shared/components';

const HostLayout = () => {
    return (
        <div id="host-layout" className="flex h-screen">
            {/* Sidebar */}
            <aside className="w-64">
                <Sidebar />
            </aside>
            {/* Main content area */}
            <div className="flex flex-col flex-1">
                {/* Header */}
                <header>
                    <Header />
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
