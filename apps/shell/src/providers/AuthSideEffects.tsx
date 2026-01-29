import { useAuthStore } from '@visitly/app-store';


export function AuthSideEffects() {
  const { status, user } = useAuthStore();
  return null;
}
