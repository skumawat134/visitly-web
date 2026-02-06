import { type AuthState, useAuthStore } from '@visitly/app-store';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
// import { canAccessRoute } from './routeAccess';
// import { resolveLanding } from './resolveLanding';

const SKIP_AUTH_PATHS = [
  '/permaVisits',
  '/admin/permaVisits',
  '/impersonate/user',
  '/admin/impersonate/user',
  '/switch'
];
const APP_ROOTS = ['/', '/visitly'];

export function NavigationResolver() {
  const status = useAuthStore(s => s.status);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const { pathname, search } = location;
    // 1️⃣ Skip auth resolution for special routes
    if (SKIP_AUTH_PATHS.some(p => pathname.startsWith(p))) {
      return;
    }
    // 2️⃣ Wait until auth is resolved
    if (status === 'checking') {
      return;
    }

    const currentPath = pathname + search;

    // 3️⃣ Unauthenticated → redirect to login
    if (status === 'unauthenticated') {
      if (!pathname.startsWith('/visitly')) {
        // sessionStorage.setItem('redirect_after_login', currentPath);
        navigate('/visitly', { replace: true });
      }
      return;
    }

    // 4️⃣ Authenticated but already inside app → DO NOTHING
    // const isAtAppRoot = APP_ROOTS.includes(pathname);
    // if (!isAtAppRoot) {
    //   return;
    // }
    // 5️⃣ Resolve post-login or landing redirect
    // ────────────────────────────────────────────────
    // Case B: Already authenticated
    // ────────────────────────────────────────────────
    // We only want to redirect when:
    //   • coming from login page, or
    //   • there's a stored redirect (from before login), or
    //   • there's ?redirect=xxx in current URL
    const fromLogin = pathname.startsWith('/visitly');
    const storedRedirect = sessionStorage.getItem('redirect_after_login');
    const urlRedirect = new URLSearchParams(search).get('redirect');

    const hasRedirectIntent = fromLogin || !!storedRedirect || !!urlRedirect;
    if (hasRedirectIntent) {
      const target =
        urlRedirect ||
        storedRedirect ||
        resolveLanding({ user } as AuthState);   // fallback only if nothing else
      sessionStorage.removeItem('redirect_after_login');
      // Prevent redirect loop / noop
      if (target && target !== pathname) {
        navigate(target, { replace: true });
      }
    }
  }, [status, user, location.pathname, location.search, navigate, location]);

  return null;
}


function resolveLanding(auth: AuthState): string {
  const roles = auth.user?.roles ?? [];

  if (roles.some(r => r.role === 'GLOBAL_INTERNAL_ADMIN')) {
    return '/admin/internalAdmin/org-list';
  }

  if (
    roles.some(r =>
      ['GLOBAL_ORG_ADMIN', 'FRONTDESK_ADMIN', 'SITE_ADMIN'].includes(r.role)
    )
  ) {
    return '/admin/work_area/dashboard';
  }

  if (roles.some(r => r.role === 'DELIVERY_MANAGER')) {
    return '/admin/work_area/delivery-manager/dashboard';
  }

    if (roles.some(r => r.role === 'EVAC_MANAGER')) {
    return '/admin/work_area/evacuation/main';
  }
  if (roles.some(r => ['HOST'].includes(r.role))) {
    return '/host/upcoming-visitors';
  }

  return '/admin';
}
