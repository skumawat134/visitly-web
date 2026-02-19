import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkUpdatePreRegistrations } from '../api/upcomming-visitors.api';
import { useToastStore } from '@visitly/app-store';

interface BulkUpdateParams {
  selectedIds: string[];
  onClose: () => void;
  onSuccess?: () => void;
}

export const useBulkUpdatePreRegistrations = ({
  selectedIds,
  onClose,
  onSuccess,
}: BulkUpdateParams) => {
  const queryClient = useQueryClient();
  const toast = useToastStore((s) => s.showToast);

  const mutation = useMutation({
    mutationFn: bulkUpdatePreRegistrations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingVisitors'] });

      toast({
        message: 'Updated Successfully!',
      });

      onSuccess?.();
      onClose();
    },
  });

  const formatWithSeconds = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.length === 16 ? `${dateStr}:00` : dateStr;
  };

  const submitBulkUpdate = (values: any) => {
    const payload: any = { ids: selectedIds };

    if (values.siteId) payload.siteId = values.siteId;
    if (values.visitorTypeId) payload.visitorTypeId = values.visitorTypeId;
    if (values.groupName) payload.groupName = values.groupName;
    if (values.hostUserId) payload.hostUserId = values.hostUserId;
    if (values.cohostUserIds?.length > 0)
      payload.cohostUserIds = values.cohostUserIds;

    if (values.scheduleCheckinDate)
      payload.scheduleCheckinDate = formatWithSeconds(
        values.scheduleCheckinDate
      );

    if (values.scheduleCheckoutDate)
      payload.scheduleCheckoutDate = formatWithSeconds(
        values.scheduleCheckoutDate
      );

    mutation.mutate(payload);
  };

  return {
    submitBulkUpdate,
    isLoading: mutation.isPending,
  };
};
