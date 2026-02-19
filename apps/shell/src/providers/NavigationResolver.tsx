import { type AuthState, useAuthStore } from '@visitly/app-store';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSidebarPermissions } from '../shared/components/navbar/useSidebarPermissions';
import { type SidebarContext } from '../shared/components/navbar/SidebarConfig';
import { useFetchOnboardingStatus } from '../shared/hooks/useFetchOnboardingStatus';

const SKIP_AUTH_PATHS = [
  '/permaVisits',
  '/admin/permaVisits',
  '/impersonate/user',
  '/admin/impersonate/user',
  '/visitly/login',
  '/visitly/signup',
  '/visitly/forgot-password',
  '/switch'
];
const APP_ROOTS = ['/', '/visitly'];

/**
 * @unused this logic has been move to loaders in router.
 */
export function NavigationResolver() {
  const status = useAuthStore(s => s.status);
  const permissions = useSidebarPermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const onboardingQuery = useFetchOnboardingStatus();

  useEffect(() => {
    const handleOnboardingComplete = () => {
      console.log('[NavResolver] Onboarding complete event received. Refetching...');
      onboardingQuery.refetch();
    };

    window.addEventListener('onboarding:complete', handleOnboardingComplete);
    return () => window.removeEventListener('onboarding:complete', handleOnboardingComplete);
  }, [onboardingQuery]);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('host:navigation', {
        detail: { pathname: location.pathname },
      })
    );
  }, [location.pathname]);

  useEffect(() => {
    if (status === 'checking') return;

    const isAuthPath = location.pathname.startsWith('/visitly');
    const isRoot = location.pathname === '/' || location.pathname === '';

    // Auth paths we should skip if UNAUTHENTICATED (don't force redirect to login)
    const AUTH_LOGIN_PATHS = ['/visitly/login', '/visitly/signup', '/visitly/forgot-password'];
    const isLoginPath = AUTH_LOGIN_PATHS.some(path => location.pathname.startsWith(path));

    // 1. Authenticated Logic
    if (status === 'authenticated') {
      const queryRedirect = new URLSearchParams(location.search).get('redirect');
      const explicitRedirect = queryRedirect;

      // Wait for onboarding status to be known before making navigation decisions
      if (onboardingQuery.isLoading && !onboardingQuery.data) {
        return; // Only wait on initial load, not refetches
      }

      // Onboarding Check (Only if we have the data)
      if (onboardingQuery.isSuccess) {
        const isOnboarded = onboardingQuery.data?.onboarded;
        const isOnboardingRoute = location.pathname.startsWith('/admin/onboarding');
        if (isOnboarded === false && !isOnboardingRoute) {
          console.log('[NavResolver] Not onboarded. Redirecting to onboarding');
          navigate('/admin/onboarding', { replace: true });
          return;
        }

        if (isOnboarded === true && isOnboardingRoute) {
          console.log('[NavResolver] Already onboarded. Redirecting to landing');
          const target = resolveLanding(permissions);
          navigate(target, { replace: true });
          return;
        }
      }

      if (onboardingQuery.isError) {
        const isOnboardingRoute = location.pathname.startsWith('/admin/onboarding');
        if (!isOnboardingRoute) {
          console.log('[NavResolver] Onboarding query failed (new user). Redirecting to onboarding');
          navigate('/admin/onboarding', { replace: true });
          return;
        }
      }

      const target = resolveLanding(permissions);
      const isDefaultDashboard = location.pathname === '/admin/work_area/dashboard';

      // Handle Redirection from login/root to app, OR if on default dashboard but should be elsewhere (like Internal Admin)
      if (isAuthPath || isRoot || (isDefaultDashboard && target !== location.pathname)) {
        console.log('[NavResolver] Authenticated. Current:', location.pathname, '| Target:', target);

        if (explicitRedirect && !explicitRedirect.startsWith('/visitly') && explicitRedirect !== '/') {
          if (location.pathname !== explicitRedirect) {
            console.log('[NavResolver] Deep linking to:', explicitRedirect);
            navigate(explicitRedirect, { replace: true });
          }
          return;
        }

        if (location.pathname !== target) {
          console.log('[NavResolver] Navigating to target landing:', target);
          navigate(target, { replace: true });
        }
        return;
      }
      return;
    }

    // 2. Unauthenticated Logic
    if (status === 'unauthenticated') {
      // If we are on a public "skip" path or login path, stay there
      
      const isPublicPath = SKIP_AUTH_PATHS.some(path => location.pathname.startsWith(path));
      if (isPublicPath || isLoginPath || isAuthPath) {
        return;
      }

      // If on root or internal path, save current as redirect and go to login
      const currentPath = location.pathname + location.search;
      if (!isRoot) {
        console.log('[NavResolver] Saving redirect path:', currentPath);
        sessionStorage.setItem('redirect_after_login', currentPath);
      }

      console.log('[NavResolver] Redirecting unauthenticated user to login');
      navigate('/visitly/login', { replace: true });
    }
  }, [status, permissions, location.pathname, location.search, navigate, onboardingQuery.isLoading, onboardingQuery.data, onboardingQuery.isError]);

  return null;
}

function resolveLanding(permissions: SidebarContext) {
  if (permissions.isGlobalInternalAdmin) {
    return '/admin/internalAdmin/org-list';
  }

  if (permissions.isGlobalAdmin || permissions.isSiteAdmin || permissions.isFrontDeskManager) {
    return '/admin/work_area/dashboard';
  }

  // Delivery Manager but NOT Global Admin (handled above)
  if (permissions.isDeliveryManager) {
    return '/admin/work_area/delivery-manager/dashboard';
  }
  
  if (permissions.isEvacManager) {
    return '/admin/work_area/evacuation/main';
  }

    if (permissions.isHost) {
    return '/host/dashboard';
  }

  // Fallback
  return '/admin/work_area/dashboard';
}
