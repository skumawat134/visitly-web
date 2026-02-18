import { useFetchOnboardingStatus } from '@/shared/hooks/useFetchOnboardingStatus';
import React, { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export default function RootLayout() {
    const location = useLocation();
    const navigate = useNavigate();
    const onboardingQuery = useFetchOnboardingStatus();

    // Handle global events (formerly in NavigationResolver)
    useEffect(() => {
        const handleOnboardingComplete = () => {
            console.log('[RootLayout] Onboarding complete event received. Refetching...');
            onboardingQuery.refetch();
        };

        window.addEventListener('onboarding:complete', handleOnboardingComplete);
        return () => window.removeEventListener('onboarding:complete', handleOnboardingComplete);
    }, [onboardingQuery]);

    useEffect(() => {
        window.dispatchEvent(
            new CustomEvent('host:navigation', {
                detail: { pathname: location.pathname },
            })
        );
    }, [location.pathname]);

    return (
        <>
            <Outlet />
        </>
    );
}
