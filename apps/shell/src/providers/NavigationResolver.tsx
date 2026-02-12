import { AuthState, useAuthStore } from '@visitly/app-store';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import { canAccessRoute } from './routeAccess';
// import { resolveLanding } from './resolveLanding';

const SKIP_AUTH_PATHS = [
  '/permaVisits',
  '/admin/permaVisits',
  '/impersonate/user',
  '/admin/impersonate/user',
];

export function NavigationResolver() {
  const status = useAuthStore(s => s.status);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('host:navigation', {
        detail: { pathname: location.pathname },
      })
    );
  }, [location.pathname]);
  useEffect(() => {
    if (SKIP_AUTH_PATHS.some(path => location.pathname.startsWith(path))) {
      return;
    }

    if (status === 'checking') return;
    const currentPath = location.pathname + location.search;
    if (status === 'unauthenticated') {
      if (!location.pathname.startsWith('/visitly')) {
        sessionStorage.setItem('redirect_after_login', currentPath);
        navigate('/visitly', { replace: true });
      }
      return;
    }

    if (status === 'authenticated') {
      // Already inside app → don't fight navigation
      if (
        location.pathname.startsWith('/admin') ||
        location.pathname.startsWith('/internalAdmin')
      ) {
        return;
      }
      const redirect =
        new URLSearchParams(location.search).get('redirect') ||
        sessionStorage.getItem('redirect_after_login');

      const target = redirect || resolveLanding({ user } as AuthState);

      sessionStorage.removeItem('redirect_after_login');

      if (location.pathname !== target) {
        navigate(target, { replace: true });
      }
    }
  }, [status, user, location.pathname, location.search, navigate]);

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
      return '/admin/internalAdmin/org-list';
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
