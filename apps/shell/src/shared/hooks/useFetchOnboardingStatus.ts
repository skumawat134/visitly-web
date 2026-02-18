import { useAuthStore } from "@visitly/app-store";
import { useQuery } from "@tanstack/react-query";
import { getOnboardingStatusApi } from "../services/onboarding.api";
import { useNavigate, useLocation } from "react-router-dom";


export function useFetchOnboardingStatus() {
    const auth = useAuthStore();
     const navigate = useNavigate();
     const location = useLocation();
    const isHostPresent = location.pathname.includes("host");


    // Only enable if authenticated
    const enabled = auth.status === 'authenticated';

    const query = useQuery({
        queryKey: ['auth', 'onboarding'],
        queryFn: getOnboardingStatusApi,
        enabled: enabled && !isHostPresent,
        staleTime: 1000 * 10, // 10 seconds
    });

    return query;
}
