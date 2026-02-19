import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  RoundedToggleButton,
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
      <DialogContent
        className="tw:max-w-md tw:py-10 tw:px-8"
        data-testid="bulk-cancel-modal"
      >
        {/* Warning Icon */}
        <div className="tw:mb-8">
          <AlertTriangle className="tw:mx-auto tw:h-20 tw:w-20 tw:text-red-500" />
        </div>

        {/* Header */}
        <DialogHeader className="tw:mb-6 tw:space-y-3">
          <DialogTitle className="tw:text-2xl tw:text-center tw:font-bold tw:text-gray-900">
            Cancel {visitCount !== 1 ? "Visits" : "Visit"}?
          </DialogTitle>

          <DialogDescription className="tw:text-base tw:text-center tw:font-medium tw:text-gray-600">
            You are about to cancel {visitCount} visit
            {visitCount !== 1 ? "s" : ""}. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {/* Notification Toggles */}
        <div className="tw:mb-8 tw:flex tw:flex-col tw:items-center tw:gap-4">
          <span className="tw:text-sm tw:font-medium tw:text-gray-700">
            Notification
          </span>

          <div className="tw:flex tw:flex-wrap tw:justify-center tw:gap-3">
            <RoundedToggleButton
              label="Notify Visitor"
              isActive={notifyVisitFlag}
              onClick={() => setNotifyVisitFlag((prev) => !prev)}
              data-testid="bulk-cancel-notify-visitor-toggle"
            />

            <RoundedToggleButton
              label="Notify Host"
              isActive={notifyHostFlag}
              onClick={() => setNotifyHostFlag((prev) => !prev)}
              data-testid="bulk-cancel-notify-host-toggle"
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <DialogFooter className="tw:flex tw:justify-center tw:gap-4">
          <Button
            variant="primary"
            onClick={handleCancel}
            isLoading={isLoading}
            data-testid="bulk-cancel-confirm-btn"
          >
            Yes, Cancel {visitCount !== 1 ? "Visits" : "Visit"}
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            data-testid="bulk-cancel-no-btn"
          >
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

