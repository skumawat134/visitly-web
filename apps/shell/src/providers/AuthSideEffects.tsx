import { useEffect } from 'react';
import { useAuthStore } from '@visitly/app-store';
import { DatadogService } from '@/services/datadog';

const datadog = new DatadogService();

export function AuthSideEffects() {
  const { status, user } = useAuthStore();

  useEffect(() => {
    datadog.initialize();
  }, []);

  // 2️⃣ Sync user with Datadog
  useEffect(() => {
    if (status === 'authenticated' && user) {
      datadog.setUser({
        id: user.email,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        orgId: user.orgId,
        env: datadog.getEnvShortCode(),
      });
    }

    if (status === 'unauthenticated') {
      datadog.clearUser();
    }
  }, [status, user]);

  return null;
}
