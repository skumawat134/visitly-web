import { useMutation } from "@tanstack/react-query";
import { confirmEmailApi } from "../services/auth.api";
import type { ConfirmEmailPayload, ConfirmEmailResponse } from "../types/auth.types";

export function useConfirmMutation() {
    console.log("useConfirmMutation called");
    return useMutation<ConfirmEmailResponse, Error, ConfirmEmailPayload>({
        mutationKey: ["auth", "confirmEmail"],

        mutationFn: confirmEmailApi,

        onSuccess: (data) => {
                
        },

        onError: (error) => {
            console.error("Login failed", error.message);
        },
    });
}


