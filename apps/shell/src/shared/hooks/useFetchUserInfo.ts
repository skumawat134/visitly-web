import { useAuthStore } from "@visitly/app-store";
import { useQuery } from "@tanstack/react-query";
import { UserResponse } from "../types/auth.types";
import { useEffect } from "react";
import { getUserInfoApi } from "@/shared/services/auth.api";

export function useFetchUserInfo() {
  const auth = useAuthStore();
  const setUser = useAuthStore((s) => s.setUser);
  const enabled = auth.status === 'checking' && !!auth.tokens?.accessToken;
  const query = useQuery<UserResponse, Error>({
    queryKey: ['auth', 'me'],
    queryFn: getUserInfoApi,
    enabled: enabled,
  });
  const { data: user } = query;
  
  useEffect(() => {
    if (!user) return;
    setUser(user);
    sessionStorage.setItem('userinfo', JSON.stringify(user));
    const role = resolveRole(user);
    sessionStorage.setItem('myrole', role);
  }, [user, setUser]);
  return query;
}

function resolveRole(user: UserResponse): string {
  if (user.roles?.some(r => r.role === 'GLOBAL_ORG_ADMIN')) return 'gadmin';
  if (user.roles?.some(r => r.role === 'FRONTDESK_ADMIN')) return 'fdadmin';
  if (user.roles?.some(r => r.role === 'EVAC_MANAGER')) return 'lamadmin';
  if (user.roles?.some(r => r.role === 'SITE_ADMIN')) return 'stadmin';
  if (user.roles?.some(r => r.role === 'DELIVERY_MANAGER')) return 'lamadmin';
  return 'host';
}