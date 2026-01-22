import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { samlAuthenticationApi } from '../services/auth.api';
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
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [failedSaml, setFailedSaml] = useState(false);

    const authenticateMutation = useMutation({
        mutationFn: samlAuthenticationApi,
        onSuccess : ()=>{

        },
        onError : ()=>{

        }
    });

    const userInfoMutation = useMutation({
        mutationFn: async () => {
            const token = sessionStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.visitly.io/v1'}/users/me`, {
                headers: { 'Authorization': token || '' },
            });
            if (!response.ok) throw new Error('Failed to fetch user info');
            return response.json() as Promise<UserInfo>;
        }
    });

    const productMutation = useMutation({
        mutationFn: async (orgId: string) => {
            const token = sessionStorage.getItem('accessToken');
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.visitly.io/v1'}/organizations/${orgId}/products`, {
                headers: { 'Authorization': token || '' },
            });
            if (!response.ok) throw new Error('Failed to fetch products');
            return response.json();
        }
    });

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const samlResponse = queryParams.get('SAMLResponse');

        if (!samlResponse) {
            setLoading(false);
            setFailedSaml(true);
            return;
        }

        const runAuthFlow = async () => {
            try {
                // 1. Authenticate
               // const authData = await authenticateMutation.mutateAsync(samlResponse);
               // handleTokenStorage(authData);

                // 2. Get User Info
                const userData = await userInfoMutation.mutateAsync();
                sessionStorage.setItem('userinfo', JSON.stringify(userData));

                // 3. Set Datadog Context
             // setDatadogUser(userData, 'prod', json.version);

                // 4. Get Products
                await productMutation.mutateAsync(userData.orgId);

                // 5. Redirect
                const redirectPath = getRedirectPath(userData);
                navigate(redirectPath);

            } catch (error) {
                console.error('SAML Auth Error:', error);
                setFailedSaml(true);
            } finally {
                setLoading(false);
            }
        };

        runAuthFlow();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleTokenStorage =  (response: SamlAuthResponse) => {
        const token = `Bearer ${response.accessToken}`;
        sessionStorage.setItem('accessToken', token);

        const tokenTime = new Date();
        tokenTime.setHours(tokenTime.getHours() + 8);

        // Setting cookies matching Angular's cookie service logic
        document.cookie = `accessToken=${encodeURIComponent(token)}; expires=${tokenTime.toUTCString()}; path=/; domain=visitly.io; Secure`;
        document.cookie = `refreshToken=${encodeURIComponent(response.refreshToken)}; expires=${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString()}; path=/; domain=visitly.io; Secure`;

        localStorage.setItem('refreshToken', response.refreshToken);
        sessionStorage.setItem('flagForMenu', JSON.stringify(false));
    }

  const  setDatadogUser =  (user: UserInfo, env: string, version: string) => {
        if (typeof (window as any).DD_RUM !== 'undefined') {
            (window as any).DD_RUM.setUser({
                id: user.email,
                name: `${user.firstName} ${user.lastName}`,
                email: user.email,
                orgId: user.orgId,
                orgName: user.orgName,
                env: env,
                roles: user.roles.map((val : any) => val.role).join(','),
                version: version
            });
        }
    }

   const getRedirectPath = (user: UserInfo): string => {
        if (!user.roles) return '/visitly/login';

        const hasAdminRole = user.roles.find(x =>
            ['GLOBAL_ORG_ADMIN', 'FRONTDESK_ADMIN', 'SITE_ADMIN'].includes(x.role)
        );

        if (hasAdminRole) {
            return '/admin/work_area/dashboard';
        }

        const hasHostRole = user.roles.find(x =>
            ['HOST', 'EVAC_MANAGER'].includes(x.role)
        );

        if (hasHostRole) {
            return '/admin/work_area/evacuation/past-visitors';
        }

        return '/visitly/login';
    }

    return {
        loading,
        failedSaml

    };
};
