import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserInfoApi, loginApi } from "../services/auth.api";
import type { LoginPayload, LoginResponse } from "../types/auth.types";
import { useAuthStore } from "@visitly/app-store";
import { useUserInfoQuery } from "./useFetchUserInfo";
import { getProductInfo } from "./entitlement.api";

export function useLoginMutation() {
    const queryClient = useQueryClient();
    const qc = queryClient;
    const setTokens = useAuthStore((s) => s.setTokens);
    const setChecking = useAuthStore((s)=>s.setChecking);
    return useMutation<LoginResponse, Error, LoginPayload>({
        mutationKey: ["auth", "login"],
        mutationFn: loginApi,
        onSuccess: async (data) => {
            setTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            sessionStorage.setItem('accessToken', `Bearer ${data.accessToken}`);
            // // 2. Prefetch user profile → creates/fills cache
            // const user = await qc.fetchQuery({
            //     queryKey: ['auth', 'me'],
            //     queryFn: getUserInfoApi,
            //   });
              
            //   // Now user is available
            //   if (user?.orgId) {
            //     await qc.fetchQuery({
            //       queryKey: ['entitlements', user.orgId],
            //       queryFn: () => getProductInfo(user.orgId),
            //     });
            //   }
            setChecking();
        },
        onError: (error) => {
            console.error("Login failed", error.message);
        },
    });
}
