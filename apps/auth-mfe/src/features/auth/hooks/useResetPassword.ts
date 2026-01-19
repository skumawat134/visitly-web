import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { resetPasswordApi } from '../services/auth.api';
// import { toast } from 'react-hot-toast'; // Assuming toast is available, otherwise can use a local state or custom toast

export const useResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
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
            // Using a generic success message matching the original
          //  toast.success('You have successfully reset visitly password.');
            navigate('/visitly/login');
        },
        onError: (error: any) => {
            if (error.status === 400 || error.status === 401) {
               // toast.error('Your code is invalid or expired, please send the email to help@visitly.io for assistance.');
            } else {
              //  toast.error('We have encountered an error. If the problem persists, please contact Visitly Support at support@visitly.io');
            }
        }
    });
    return {
        email,
        resetMutation,
        code
    };
};
