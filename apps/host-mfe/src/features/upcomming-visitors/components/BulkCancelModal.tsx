import React from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Checkbox,
} from "@visitly/ui";
import { useBulkCancelPreRegistrations } from "../hooks/useBulkCancelPreRegistrations";

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
  const {
    notifyVisitFlag,
    notifyHostFlag,
    setNotifyVisitFlag,
    setNotifyHostFlag,
    handleCancel,
    isLoading,
  } = useBulkCancelPreRegistrations({
    selectedIds,
    onClose,
    onSuccess,
  });

  const visitCount = selectedIds.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="tw:max-w-lg tw:rounded-2xl tw:p-0 tw:overflow-hidden tw:shadow-2xl tw:border tw:border-gray-200 tw:bg-white">

        {/* Header */}
        <DialogHeader className="tw:px-8 tw:pt-8 tw:pb-4">
          <div className="tw:flex tw:flex-col tw:gap-2">
            <DialogTitle className="tw:text-2xl tw:font-semibold tw:text-gray-900">
              Cancel Visits
            </DialogTitle>

            <p className="tw:text-sm tw:text-gray-500">
              This action will permanently cancel the selected visit
              {visitCount !== 1 ? "s" : ""}.
            </p>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="tw:px-8 tw:pb-8 tw:space-y-8">

          {/* Highlighted Danger Section */}
          <div className="tw:flex tw:items-start tw:gap-4 tw:p-5 tw:rounded-xl tw:bg-red-50 tw:border tw:border-red-100">
            
            <div className="tw:flex tw:flex-col">
              <span className="tw:text-sm tw:text-gray-700">
                You are cancelling
              </span>

              <span className="tw:text-lg tw:font-semibold tw:text-red-600">
                {visitCount} visit{visitCount !== 1 ? "s" : ""}
              </span>

              <span className="tw:text-xs tw:text-red-500 tw:mt-1">
                This action cannot be undone.
              </span>
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="tw:space-y-4">
            <h4 className="tw:text-sm tw:font-medium tw:text-gray-800">
              Notification Preferences
            </h4>

            <div className="tw:flex tw:flex-col tw:gap-4 tw:bg-gray-50 tw:p-5 tw:rounded-xl tw:border tw:border-gray-100">

              <label className="tw:flex tw:items-center tw:justify-between tw:cursor-pointer tw:text-sm tw:text-gray-700">
                <span>Notify the visitor</span>
                <Checkbox
                  checked={notifyVisitFlag}
                  onChange={(checked: boolean) =>
                    setNotifyVisitFlag(checked)
                  }
                />
              </label>

              <div className="tw:border-t tw:border-gray-200" />

              <label className="tw:flex tw:items-center tw:justify-between tw:cursor-pointer tw:text-sm tw:text-gray-700">
                <span>Notify the host</span>
                <Checkbox
                  checked={notifyHostFlag}
                  onChange={(checked: boolean) =>
                    setNotifyHostFlag(checked)
                  }
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="tw:px-8 tw:py-6 tw:border-t tw:border-gray-100 tw:bg-gray-50 tw:flex tw:justify-between tw:items-center">

          <span className="tw:text-xs tw:text-gray-500">
            {visitCount} selected
          </span>

          <div className="tw:flex tw:gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="tw:min-w-[110px] tw:h-10"
            >
              Keep Visits
            </Button>

            <Button
              variant="danger"
              onClick={handleCancel}
              isLoading={isLoading}
              className="tw:min-w-[150px] tw:h-10"
            >
              Cancel {visitCount !== 1 ? "Visits" : "Visit"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
