import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserInfoApi, loginApi } from "../services/auth.api";
import type { LoginPayload, LoginResponse } from "../types/auth.types";
import { useAuthStore } from "@visitly/app-store";
import { useUserInfoQuery } from "./useFetchUserInfo";
import { getProductInfo } from "./entitlement.api";
import { setCookie } from "@/utils/cookie.utils";
import { useNavigate } from "react-router-dom";

export function useLoginMutation() {
    const queryClient = useQueryClient();
    const qc = queryClient;
    const setTokens = useAuthStore((s) => s.setTokens);
    const setChecking = useAuthStore((s) => s.setChecking);
    const navigate = useNavigate();
    return useMutation<LoginResponse, Error, LoginPayload>({
        mutationKey: ["auth", "login"],
        mutationFn: loginApi,
        onSuccess: async (data) => {
            // 1. Clear ALL queries to prevent stale data from prior user sessions
            queryClient.clear();

            setTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            sessionStorage.setItem('accessToken', `Bearer ${data.accessToken}`);

            // Access token → 8 hours
            const tokenTime = new Date();
            tokenTime.setHours(tokenTime.getHours() + 8);
            const token = `Bearer ${data.accessToken}`;
            setCookie('accessToken', token, {
                expires: tokenTime,
                secure: true,
                sameSite: 'Lax',
            });

            // LocalStorage copy (same as Angular)
            localStorage.setItem('refreshToken', data.refreshToken);

            // Refresh token → 30 days
            setCookie('refreshToken', data.refreshToken, {
                days: 30,
                secure: true,
                sameSite: 'Lax',
            });

            // 2. Set status to checking BEFORE navigation
            // This ensures Shell's NavigationResolver sees the transition immediately
            setChecking();

            // 3. Navigate to root - NavigationResolver will handle the final redirect
            navigate("/");
        }

    });
}
