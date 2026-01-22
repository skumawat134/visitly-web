import { AuthState, useAuthStore } from '@visitly/app-store';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import { canAccessRoute } from './routeAccess';
// import { resolveLanding } from './resolveLanding';

export function NavigationResolver() {
    const auth = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // 1️⃣ Still resolving auth → do nothing
        if (auth.status === 'checking') return;

        const currentPath = location.pathname + location.search;

        // 2️⃣ Not authenticated → go to login
        if (auth.status === 'unauthenticated') {
            if (!location.pathname.startsWith('/visitly')) {
                sessionStorage.setItem(
                    'redirect_after_login',
                    currentPath
                );

                navigate('/visitly', { replace: true });
            }
            return;
        }

        // 3️⃣ Authenticated → resolve redirect or landing
        if (auth.status === 'authenticated') {
            const redirect =
                new URLSearchParams(location.search).get('redirect') ||
                sessionStorage.getItem('redirect_after_login');

            let target: string;

            //   if (
            //     redirect &&
            //     canAccessRoute(redirect, auth.can)
            //   ) {
            //     target = redirect;
            //   } else {
            target = resolveLanding(auth);
            //   }

            sessionStorage.removeItem('redirect_after_login');

            if (location.pathname !== target) {
                navigate(target, { replace: true });
            }
        }
    }, [auth.status]);

    return null;
}

function resolveLanding(auth: AuthState) {
    // if (auth.capabilities.includes('ADMIN_DASHBOARD'))
    //   return '/admin/dashboard';
    // if (auth.capabilities.includes('VISITOR_DASHBOARD'))
    //   return '/visitors';
    // return '/unauthorized';
    const roles = auth.user?.roles;
    if (roles) {
        if (roles.find(x => (x.role === 'GLOBAL_INTERNAL_ADMIN'))) {
            return '/internalAdmin/org-list';
        }
        else if (roles.find(x => (x.role === 'GLOBAL_ORG_ADMIN' || x.role === 'FRONTDESK_ADMIN' || x.role === 'SITE_ADMIN'))) {

            // if (productDetails?.products?.length > 0) {
            // this.utilsService.redirectTo('/admin/work_area/dashboard');
            // } else {
            // this.utilsService.redirectTo('/admin/work_area/settings/upgrade-plan');
            // }
            // return true;
            return '/admin/work_area/dashboard';
        } else if (roles.find(x => x.role === 'DELIVERY_MANAGER')) {
            return "/admin/work_area/delivery-manager/dashboard'"
        }
        else if (roles.find(x => (x.role === 'HOST' || x.role === 'EVAC_MANAGER'))) {
            return '/admin/work_area/evacuation/past-visitors';
        }
    }
    return "/admin";
}
