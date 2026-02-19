import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@visitly/ui";
import { useCancelPreRegistration } from "../hooks/useCancelPreRegistration";
import { RoundedToggleButton } from "@visitly/ui";

interface CancelVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  visitorId: string;
  onSuccess?: () => void;
  updateType?: "SELECTED_VISIT" | "FUTURE_VISITS_ONLY" | "ALL_VISITS";
}

export const CancelVisitModal: React.FC<CancelVisitModalProps> = ({
  isOpen,
  onClose,
  visitorId,
  onSuccess,
  updateType,
}) => {
  const {
    notifyVisitFlag,
    notifyHostFlag,
    setNotifyVisitFlag,
    setNotifyHostFlag,
    handleCancel,
    isLoading,
  } = useCancelPreRegistration({
    id: visitorId,
    onClose,
    onSuccess,
    updateType,
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="tw:max-w-md tw:py-10 tw:px-8"
        data-testid="cancel-visit-modal"
      >
        {/* Warning Icon */}
        <div className="tw:mb-8">
          <AlertTriangle className="tw:mx-auto tw:h-20 tw:w-20 tw:text-red-500" />
        </div>

        {/* Header */}
        <DialogHeader className="tw:mb-6 tw:space-y-3">
          <DialogTitle className="tw:text-2xl tw:text-center tw:font-bold tw:text-gray-900">
            Cancel Visit?
          </DialogTitle>

          <DialogDescription className="tw:text-base tw:text-center tw:font-medium tw:text-gray-600">
            This action will permanently cancel this visit.
          </DialogDescription>
        </DialogHeader>

        {/* Notification Toggles */}
        <div className="tw:mb-8 tw:flex tw:flex-col tw:items-center tw:gap-4">
          <span className="tw:text-sm tw:font-medium tw:text-gray-700">
            Email Notifications
          </span>

          <div className="tw:flex tw:items-center tw:gap-3 tw:flex-wrap tw:justify-center">
            <RoundedToggleButton
              label="Notify Visitor"
              isActive={notifyVisitFlag}
              onClick={() => setNotifyVisitFlag((prev) => !prev)}
            />

            <RoundedToggleButton
              label="Notify Host"
              isActive={notifyHostFlag}
              onClick={() => setNotifyHostFlag((prev) => !prev)}
            />
          </div>
        </div>

        {/* Footer Buttons */}
        <DialogFooter className="tw:flex tw:justify-center tw:gap-4">
          <Button
            variant="primary"
            onClick={handleCancel}
            isLoading={isLoading}
            data-testid="confirm-cancel-button"
          >
            Yes
          </Button>

          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            data-testid="cancel-button"
          >
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
