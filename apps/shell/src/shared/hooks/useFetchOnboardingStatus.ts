import { useAuthStore } from "@visitly/app-store";
import { useQuery } from "@tanstack/react-query";
import { getOnboardingStatusApi } from "../services/onboarding.api";

export function useFetchOnboardingStatus() {
    const auth = useAuthStore();

    // Only enable if authenticated
    const enabled = auth.status === 'authenticated';

    const query = useQuery({
        queryKey: ['auth', 'onboarding'],
        queryFn: getOnboardingStatusApi,
        enabled: enabled,
        staleTime: 1000 * 10, // 10 seconds
    });

    return query;
}
