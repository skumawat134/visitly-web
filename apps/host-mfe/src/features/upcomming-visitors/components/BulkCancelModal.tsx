import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Checkbox,
} from '@visitly/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bulkCancelPreRegistrations } from '../api/upcomming-visitors.api';

interface BulkCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: string[];
  onSuccess: () => void;
}

export const BulkCancelModal: React.FC<BulkCancelModalProps> = ({
  isOpen,
  onClose,
  selectedIds,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const [notifyVisitFlag, setNotifyVisitFlag] = useState(true);
  const [notifyHostFlag, setNotifyHostFlag] = useState(true);

  const mutation = useMutation({
    mutationFn: bulkCancelPreRegistrations,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['upcomingVisitors'] });
      onSuccess();
      onClose();
    },
  });

  const handleCancel = () => {
    mutation.mutate({
      ids: selectedIds,
      notifyVisitFlag,
      notifyHostFlag,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="
          tw:max-w-md 
          tw:rounded-2xl 
          tw:p-0 
          tw:overflow-hidden 
          tw:shadow-xl 
          tw:border 
          tw:border-gray-200/70 
          tw:bg-white
        "
      >
        {/* Header */}
        <DialogHeader className="tw:px-6 tw:pt-6 tw:pb-4 tw:border-b tw:border-gray-100">
          <DialogTitle className="tw:text-xl tw:font-semibold tw:text-gray-900 tw:tracking-tight">
            Cancel Visits
          </DialogTitle>
        </DialogHeader>

        {/* Body */}
        <div className="tw:px-6 tw:py-6 tw:space-y-6">

          {/* Warning */}
          <div className="
            tw:bg-red-50/80 
            tw:border 
            tw:border-red-200 
            tw:rounded-xl 
            tw:p-4 
            tw:shadow-sm
          ">
            <p className="tw:text-sm tw:text-red-800 tw:leading-relaxed">
              You are about to <span className="tw:font-semibold">cancel {selectedIds.length} visit{selectedIds.length !== 1 ? 's' : ''}</span>.
              <br className="tw:hidden sm:tw:inline" />
              <span className="tw:text-red-700 tw:font-medium">This action cannot be undone.</span>
            </p>
          </div>

          {/* Notification settings */}
          <div className="
            tw:bg-gray-50 
            tw:rounded-xl 
            tw:p-5 
            tw:shadow-sm 
            tw:border 
            tw:border-gray-100
          ">
            <p className="tw:text-sm tw:font-medium tw:text-gray-700 tw:pb-3">
              Notification Preferences
            </p>

            <div className="tw:flex tw:flex-col tw:gap-4">
              <label className="
                tw:flex tw:items-center tw:gap-3 
                tw:text-sm tw:text-gray-700 
                hover:tw:text-gray-900 
                tw:cursor-pointer tw:transition-colors
              ">
                <Checkbox
                  checked={notifyVisitFlag}
                  onChange={(e: any) => setNotifyVisitFlag(e.target.checked)}
                />
                Notify the visitor
              </label>

              <label className="
                tw:flex tw:items-center tw:gap-3 
                tw:text-sm tw:text-gray-700 
                hover:tw:text-gray-900 
                tw:cursor-pointer tw:transition-colors
              ">
                <Checkbox
                  checked={notifyHostFlag}
                  onChange={(e: any) => setNotifyHostFlag(e.target.checked)}
                />
                Notify the host
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="
          tw:px-6 tw:py-5 
          tw:border-t tw:border-gray-100 
          tw:bg-gray-50/70 
          tw:flex tw:justify-end tw:gap-3
        ">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={mutation.isPending}
            className="tw:min-w-[118px] tw:h-10"
          >
            Keep Visits
          </Button>

          <Button
            variant="danger"
            onClick={handleCancel}
            isLoading={mutation.isPending}
            className="tw:min-w-[138px] tw:h-10"
          >
            Cancel Visits
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};