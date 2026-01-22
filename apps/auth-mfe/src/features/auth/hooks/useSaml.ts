import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { samlAuthenticationApi } from '../services/auth.api';
import { useAuthStore } from '@visitly/app-store';

// import json from '../../../package.json';


export interface SamlAuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface UserInfo {
    email: string;
    firstName: string;
    lastName: string;
    orgId: string;
    orgName: string;
    roles: { role: string }[];
}

export const useSaml = () => {
    const setTokens = useAuthStore((s) => s.setTokens);
    const setChecking = useAuthStore((s)=>s.setChecking);
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [failedSaml, setFailedSaml] = useState(false);

    const authenticateMutation = useMutation({
        mutationFn: samlAuthenticationApi,
        onSuccess: async (data) => {
            setTokens({
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
            });
            sessionStorage.setItem('accessToken', `Bearer ${data.accessToken}`);
            setChecking();
        },
        onError : ()=>{

        }
    });


    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const samlResponse = queryParams.get('SAMLResponse');

        if (samlResponse) {
           authenticateMutation.mutate({SAMLResponse : samlResponse})
        }else{
 setLoading(false);
            setFailedSaml(true);
            return;
        }

    }, []);


    return {
        loading,
        failedSaml
    };
};
