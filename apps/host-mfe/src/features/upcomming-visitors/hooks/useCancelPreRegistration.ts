import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cancelPreRegistration } from '../api/upcomming-visitors.api';
import { useToastStore } from '@visitly/app-store';

interface UseCancelParams {
    id: string;
    onClose: () => void;
    onSuccess?: () => void;
    updateType?: 'SELECTED_VISIT' | 'FUTURE_VISITS_ONLY' | 'ALL_VISITS';
}

export const useCancelPreRegistration = ({
    id,
    onClose,
    onSuccess,
    updateType,
}: UseCancelParams) => {
    const queryClient = useQueryClient();

    const [notifyVisitFlag, setNotifyVisitFlag] = useState(true);
    const [notifyHostFlag, setNotifyHostFlag] = useState(true);
    const toast = useToastStore((s) => s.showToast)

    const mutation = useMutation({
        mutationFn: (params: any) => cancelPreRegistration(id, params),

        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['upcomingVisitors'] });
            queryClient.invalidateQueries({ queryKey: ['upcoming-visitors'] });

            toast({
                message: 'Cancelled Successfully!',
                type: 'success',
            });

            onSuccess?.();
            onClose();
        },

        onError: (error: any) => {
            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Something went wrong while cancelling the visit.';

            toast({
                message: errorMessage,
                type: 'error',
            });
        },
    });

    const handleCancel = () => {
        mutation.mutate({
            notifyVisitFlag,
            notifyHostFlag,
            updateType,
        });
    };

    return {
        notifyVisitFlag,
        notifyHostFlag,
        setNotifyVisitFlag,
        setNotifyHostFlag,
        handleCancel,
        isLoading: mutation.isPending,
    };
};
