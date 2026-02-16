import { useState, useEffect, useRef, useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { forgotPassword, ssoCheckApi } from '../services/auth.api';
import { useToastStore } from '@visitly/app-store';
interface SsoCheckResponse {
    enabledSso: boolean;
    ssoRequestUrl: string | null;
}
export const useForgotPassword = () => {
    const navigate = useNavigate();
    const [isSSOLoginEnabled, setIsSSOLoginEnabled] = useState(false);
    const [ssoProviderUrl, setSsoProviderUrl] = useState<string | null>(null);
    const tempEmailRef = useRef<string | null>(null);
    const showToast = useToastStore((s) => s.showToast)
    // Google Analytics Tracking
    useEffect(() => {
        if ((window as any).ga) {
            (window as any).ga('set', 'page', 'load forget password page');
            (window as any).ga('send', 'pageview');
        }
    }, []);
    // Mutation for checking SSO
    const ssoMutation = useMutation({
        mutationFn: ssoCheckApi,
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
        onSuccess: (result, email) => {
            showToast({ message: 'Forgot password email sent successfully', type: "info" })
            sessionStorage.setItem('resetEmail', email.email);
            navigate('/visitly/mail-inbox');
        }
    });
    const checkIsSSOAvailable = useCallback((email: string) => {
        if (!email || email === tempEmailRef.current) return;
        tempEmailRef.current = email;
        ssoMutation.mutate({ email });
    }, [ssoMutation]);
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
