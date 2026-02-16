import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { getApiClient } from '@visitly/api-client';
import { forgotPassword } from '../services/auth.api';
import { useToastStore } from '@visitly/app-store';
// import { toast } from 'react-hot-toast';
export const useMailInbox = () => {
    const [email, setEmail] = useState<string | null>(null);
     const showToast = useToastStore((s)=>s.showToast)
    useEffect(() => {
        // Tracker for GA
        if ((window as any).ga) {
            (window as any).ga('set', 'page', 'mail inbox page');
            (window as any).ga('send', 'pageview');
        }
        const storedEmail = sessionStorage.getItem('resetEmail');
        setEmail(storedEmail);
        return () => {
            sessionStorage.removeItem('resetEmail');
        };
    }, []);
    const resendMutation = useMutation({
        mutationFn: async (emailToResend: string) => forgotPassword({ email: emailToResend }),
        onSuccess: () => {
            showToast({message : 'Confirmation link resent successfully!'})
        },
        onError: () => {
            showToast({message : 'Failed to resend confirmation link. Please try again.'})
        }
    });
    const handleResend = () => {
        if (email) {
            resendMutation.mutate(email);
        }
    };
    return {
        email,
        handleResend,
        resendMutation,
    };
};