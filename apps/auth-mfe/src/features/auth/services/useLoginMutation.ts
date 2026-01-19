import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../services/auth.api";
import type { LoginPayload, LoginResponse } from "../types/auth.types";
import { useAuthStore } from "@visitly/app-store";
import { useUserInfoQuery } from "./useFetchUserInfo";

export function useLoginMutation() {
    // const setUser = useAuthStore((s) => s.setUser);
  const setTokens = useAuthStore((s) => s.setTokens);

    return useMutation<LoginResponse, Error, LoginPayload>({
        mutationKey: ["auth", "login"],
        mutationFn: loginApi,
        onSuccess(data) {
            setTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
              });
              sessionStorage.setItem('accessToken', `Bearer ${data.accessToken}`);
        },
        onError: (error) => {
            console.error("Login failed", error.message);
        },
    });
}
