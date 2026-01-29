import { useAuthStore } from '@visitly/app-store';
import { Navigate, useLocation } from 'react-router-dom';

interface Props {
  cap: string;
  children: React.ReactNode;
}

export function RequireCapability({ cap, children }: Props) {
  const auth = useAuthStore();
  const path = useLocation();

  const ADMIN_SPECIAL_ROUTES = [
  '/admin/permaVisits',
  '/admin/dashboard/wallboard',
  '/admin/impersonate/user'
];

const isAdminSpecialRoute = (): boolean => {
  const path = window.location.pathname;
  return ADMIN_SPECIAL_ROUTES.some(route =>
    path.startsWith(route)
  );
};

  if(auth.canAccess(isAdminSpecialRoute)) return <>{children}</>
  // Auth not ready yet → render nothing
  if (auth.status !== 'authenticated') {
    return null;
  }

  // Forbidden
  if (!auth.can(cap)) {
    return <Navigate to="/visitly/login" replace />;
  }

  return <>{children}</>;
}
