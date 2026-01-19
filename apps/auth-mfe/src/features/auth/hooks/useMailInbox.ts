import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
// import { toast } from 'react-hot-toast';
export const useMailInbox = () => {
    const [email, setEmail] = useState<string | null>(null);
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
        mutationFn: async (emailToResend: string) => {
            const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://api.visitly.io/v1'}/users/password/forgot`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailToResend }),
            });
            if (!response.ok) throw new Error('Resend failed');
            return response.json();
        },
        onSuccess: () => {
          //  toast.success('Confirmation link resent successfully!');
        },
        onError: () => {
          //  toast.error('Failed to resend confirmation link. Please try again.');
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