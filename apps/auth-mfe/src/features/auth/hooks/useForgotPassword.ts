import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/auth.api';
interface SsoCheckResponse {
    enabledSso: boolean;
    ssoRequestUrl: string | null;
}
export const useForgotPassword = () => {
    const navigate = useNavigate();
    const [isSSOLoginEnabled, setIsSSOLoginEnabled] = useState(false);
    const [ssoProviderUrl, setSsoProviderUrl] = useState<string | null>(null);
    const tempEmailRef = useRef<string | null>(null);
    // Google Analytics Tracking
    useEffect(() => {
        if ((window as any).ga) {
            (window as any).ga('set', 'page', 'load forget password page');
            (window as any).ga('send', 'pageview');
        }
    }, []);
    // Mutation for checking SSO
    const ssoMutation = useMutation({
        mutationFn: async (email: string) => {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.visitly.io/v1'}/saml/check-email`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (!response.ok) throw new Error('SSO check failed');
            return response.json() as Promise<SsoCheckResponse>;
        },
        onSuccess: (data) => {
            if (data.ssoRequestUrl) {
                setIsSSOLoginEnabled(data.enabledSso || false);
                setSsoProviderUrl(data.ssoRequestUrl);
            } else {
                setIsSSOLoginEnabled(false);
                setSsoProviderUrl(null);
            }
        },
        onError: () => {
            setIsSSOLoginEnabled(false);
            setSsoProviderUrl(null);
        }
    });
    // Mutation for forgot password
    const forgotPwdMutation = useMutation({
        mutationFn: forgotPassword,
        onSuccess: (_, email) => {
            console.log('Forgot password email sent successfully',email);
            sessionStorage.setItem('resetEmail', email.email);
            navigate('/visitly/mail-inbox');
        }
    });
    const checkIsSSOAvailable = (email: string) => {
        if (!email || email === tempEmailRef.current) return;
        tempEmailRef.current = email;
        ssoMutation.mutate(email);
    };
    const handleSSO = () => {
        if (ssoProviderUrl) {
            window.location.href = ssoProviderUrl;
        }
    };
    const sendEvent = (event: string) => {
        if ((window as any).ga) {
            (window as any).ga('send', 'event', {
                eventCategory: 'Forget-Password',
                eventLabel: event + ' click',
                eventAction: event,
                eventValue: 10
            });
        }
    };
    return {
        isSSOLoginEnabled,
        checkIsSSOAvailable,
        handleSSO,
        sendEvent,
        forgotPwdMutation,
    };
};
