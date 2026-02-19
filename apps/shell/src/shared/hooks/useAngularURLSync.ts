import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook to synchronize internal Angular MFE route changes back to the Shell's URL.
 */
export const useAngularURLSync = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const lastSyncedPath = useRef<string | null>(null);

    useEffect(() => {
        const handleAngularNavigation = (event: any) => {
            let angularPath = event.detail.pathname;
            if (!angularPath) return;

            // Ensure it starts with /admin (exactly one /admin)
            // If Angular says '/admin/work_area/dashboard', we leave it as is.
            // If Angular says '/work_area/dashboard', we prepend '/admin'.

            let targetShellPath = angularPath;
            if (!targetShellPath.startsWith('/admin')) {
                targetShellPath = `/admin${targetShellPath.startsWith('/') ? '' : '/'}${targetShellPath}`;
            }

            // Guard against the double prefix if Angular somehow sends '/admin/admin/...'
            if (targetShellPath.startsWith('/admin/admin')) {
                targetShellPath = targetShellPath.replace('/admin/admin', '/admin');
            }

            // Only navigate if different from current shell URL
            if (location.pathname !== targetShellPath && lastSyncedPath.current !== targetShellPath) {
                lastSyncedPath.current = targetShellPath;
                navigate(targetShellPath, { replace: true });
            }
        };

        window.addEventListener('angular:navigation', handleAngularNavigation);
        return () => {
            window.removeEventListener('angular:navigation', handleAngularNavigation);
        };
    }, [navigate, location.pathname]);
};
