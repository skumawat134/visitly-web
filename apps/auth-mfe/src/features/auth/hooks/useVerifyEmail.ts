import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { verifyEmailApi } from '../services/auth.api';
export const useVerifyEmail = () => {
    const navigate = useNavigate();
    const [isResendMail, setIsResendMail] = useState(false);
    const [email, setEmail] = useState<string | null>(null);
    useEffect(() => {
        // Tracker for GA if needed (Angular didn't have one specifically here, but following pattern)
        if ((window as any).ga) {
            (window as any).ga('set', 'page', 'verify email page');
            (window as any).ga('send', 'pageview');
        }
        const storedEmail = localStorage.getItem('isEmailVerifcationRequired');
        const isVerified = localStorage.getItem('isEmailVerified');
        if (!storedEmail) {
            navigate('/visitly/login');
            return;
        }
        setEmail(storedEmail);
        if (isVerified === 'true') {
            setIsResendMail(true);
        }
        return () => {
            // Clean up on unmount matching Angular's ngOnDestroy
            localStorage.removeItem('isEmailVerifcationRequired');
            localStorage.removeItem('isEmailVerified');
        };
    }, [navigate]);
    const resendMutation = useMutation({
        mutationFn: verifyEmailApi,
        onSuccess: () => {
            setIsResendMail(true);
            localStorage.setItem('isEmailVerified', 'true');
        }
    });
    const handleResend = () => {
        if (email) {
            resendMutation.mutate({"email" : email});
        }
    };
    return {
        isResendMail,
        email,
        handleResend,
        resendMutation
    };
};