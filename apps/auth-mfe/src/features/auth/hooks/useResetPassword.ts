import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { resetPasswordApi } from '../services/auth.api';
import { useToastStore } from '@visitly/app-store';

export const useResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToastStore();
    const email = searchParams.get('email');
    const code = searchParams.get('code');
    // Google Analytics Tracking
    useEffect(() => {
        if ((window as any).ga) {
            (window as any).ga('set', 'page', 'reset password page');
            (window as any).ga('send', 'pageview');
        }
    }, []);
    const resetMutation = useMutation({
        mutationFn: resetPasswordApi,
        onSuccess: () => {
            showToast({ message: 'You have successfully reset your Visitly password.', type: 'info' });
            navigate('/visitly/login');
        },
        onError: (error: any) => {
            if (error.status === 400 || error.status === 401) {
                showToast({ message: 'Your code is invalid or expired, please send the email to help@visitly.io for assistance.', type: 'error' });
            } else {
                showToast({ message: 'We have encountered an error. If the problem persists, please contact Visitly Support at support@visitly.io', type: 'error' });
            }
        }
    });
    return {
        email,
        resetMutation,
        code
    };
};
