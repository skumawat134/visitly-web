import React from 'react';
import { useMutation } from "@tanstack/react-query";
import { LoginPayload, SSOCheckResponse } from '../types/auth.types';
import { ssoCheckApi } from './auth.api';
export const useSsoMutation = () => {
    return useMutation<SSOCheckResponse, Error, Pick<LoginPayload, "email">>({
        mutationKey: ["auth", "login"],
        mutationFn: ssoCheckApi,
        meta :{
            showLoader : false
        }
    });
}
