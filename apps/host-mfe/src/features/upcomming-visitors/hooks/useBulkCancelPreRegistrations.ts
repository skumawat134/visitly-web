import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkCancelPreRegistrations } from '../api/upcomming-visitors.api';
import { useToastStore } from '@visitly/app-store';

interface UseBulkCancelParams {
  selectedIds: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const useBulkCancelPreRegistrations = ({
  selectedIds,
  onClose,
  onSuccess,
}: UseBulkCancelParams) => {
  const queryClient = useQueryClient();

  const [notifyVisitFlag, setNotifyVisitFlag] = useState(true);
  const [notifyHostFlag, setNotifyHostFlag] = useState(true);
  const toast = useToastStore((s)=> s.showToast)

const mutation = useMutation({
  mutationFn: bulkCancelPreRegistrations,

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['upcomingVisitors'] });
     queryClient.invalidateQueries({ queryKey: ['upcoming-visitors'] });

    toast({
      message: 'Cancelled Successfully!',
      type: 'success', // if your toast supports type
    });

    onSuccess?.();
    onClose();
  },

  onError: (error: any) => {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong while cancelling visits.';

    toast({
      message: errorMessage,
      type: 'error',
    });
  },
});



  const handleCancel = () => {
    mutation.mutate({
      ids: selectedIds,
      notifyVisitFlag,
      notifyHostFlag,
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
