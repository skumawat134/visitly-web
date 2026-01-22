import { useAuthStore } from '@visitly/app-store';
import { Navigate } from 'react-router-dom';

interface Props {
  cap: string;
  children: React.ReactNode;
}

export function RequireCapability({ cap, children }: Props) {
  const auth = useAuthStore();

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
