import { useMutation } from "@tanstack/react-query";
import { loginApi } from "../services/auth.api";
import type { LoginPayload, LoginResponse } from "../types/auth.types";

export function useLoginMutation() {
    return useMutation<LoginResponse, Error, LoginPayload>({
        mutationKey: ["auth", "login"],
        mutationFn: loginApi,
        onError: (error) => {
            console.error("Login failed", error.message);
        },
    });
}
