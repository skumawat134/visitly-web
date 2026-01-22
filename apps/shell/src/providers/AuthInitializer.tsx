import useFetchEntitlements from "@/shared/hooks/useFetchEntitlements";
import { useFetchUserInfo } from "@/shared/hooks/useFetchUserInfo";
import { useAuthStore } from "@visitly/app-store";
import { useEffect } from "react";

const AuthInitializer = () => {
  const { status, tokens, setAuthenticated, failAuth } = useAuthStore();
  const userQuery = useFetchUserInfo();
  const entitlementsQuery = useFetchEntitlements(userQuery.data?.orgId);
  const isChecking = status === 'checking';
  const hasToken = !!tokens?.accessToken;
  const isReady = userQuery.isSuccess && entitlementsQuery.isSuccess;
  const hasError = userQuery.isError || entitlementsQuery.isError;
  useEffect(() => {
    if (!isChecking) return;
    if (!hasToken) {
      failAuth();
      return;
    }
    if (userQuery.isLoading || entitlementsQuery.isLoading) return;
    if (hasError) {
      failAuth();
      return;
    }
    if (isReady && userQuery.data && entitlementsQuery.data) {
      setAuthenticated({
        user: userQuery.data,
        tokens: tokens!,
        // entitlements: entitlementsQuery.data,
      });
    }
  }, [isChecking, hasToken, isReady, hasError, userQuery.data, entitlementsQuery.data, tokens, failAuth, setAuthenticated, userQuery.isLoading, entitlementsQuery.isLoading]);

  return null;
};

export default AuthInitializer;