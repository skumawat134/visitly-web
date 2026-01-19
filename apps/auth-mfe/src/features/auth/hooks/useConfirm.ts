import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { useConfirmMutation } from '../services/useConfirmMutation';
import { confirmEmailApi } from "../services/auth.api";

// Interface for API response
interface ConfirmResponse {
    result: string;
    message?: string;
}
// Interface for API payload
interface ConfirmPayload {
    email: string;
    code: string;
}
export const useConfirm = () => {
    const [searchParams] = useSearchParams();
    const [viewState, setViewState] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
    // Extract params
    const code = searchParams.get('code');
    const email = searchParams.get('email');
    // API Call Definition
    const confirmMutation = useMutation({
        mutationFn: confirmEmailApi,
        onSuccess: () => {
            setViewState('success');
            initCalendly(email || '');
        },
        onError: () => {
            setViewState('error');
        }
    });

  //  const confirmMutation = useConfirmMutation();


    useEffect(() => {
        if (code && email) {
             console.log('inside useEffect');
            setViewState('verifying');
            confirmMutation.mutate({ code, email });
        } else {
            // If no params, we show the "Check your email" (idle/registerConfirm) state
            setViewState('idle');
        }
        // Google Analytics Pageview (Legacy support)
        if ((window as any).ga) {
            (window as any).ga('set', 'page', 'load confirmation page');
            (window as any).ga('send', 'pageview');
        }
    }, [code, email]);
    const initCalendly = (userEmail: string) => {
        console.log('Initializing Calendly with email:', userEmail);
        if ((window as any).Calendly) {
            (window as any).Calendly.initInlineWidget({
                "url": 'https://calendly.com/d/cvgv-9vz-88q/book-your-personalized-visitly-demo',
                "parentElement": document.getElementById('calendly-id'),
                "prefill": {
                    "email": userEmail
                },
                "utm": {}
            });
        }
    };
    return {
        viewState,
        email,
        isLoading: confirmMutation.isPending
    };
};
