import React from "react";
import { AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
} from "@visitly/ui";
import { DeliveryLogStatus } from "../api/myDeliveryLogs.types";
import type { DeliveryLogRecord } from "../api/myDeliveryLogs.types";

export interface PickupConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPackage: DeliveryLogRecord | null;
  onConfirm: (payload: {
    id: string;
    status: DeliveryLogStatus;
    pickupD: string;
  }) => void;
}

export const PickupConfirmDialog: React.FC<PickupConfirmDialogProps> = ({
  open,
  onOpenChange,
  selectedPackage,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        // no onClose → removes X button (matches screenshot)
        className="tw:max-w-md tw:py-10 tw:px-8"  // fine-tune padding & force width
        data-testid="pickup-confirmation-modal"
      >
        {/* Warning Icon – large, centered, no extra background circle */}
        <div className="tw:mb-8">
          <AlertTriangle className="tw:mx-auto tw:h-20 tw:w-20 tw:text-yellow-500" />
        </div>

        <DialogHeader className="tw:mb-6 tw:space-y-3">
          <DialogTitle className="tw:text-2xl tw:text-center tw:font-bold tw:text-gray-900">
            Are you sure?
          </DialogTitle>

          <DialogDescription className="tw:text-base tw:text-center tw:font-medium tw:text-gray-600">
            This action will change the status as Picked Up.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="tw:mt-2 tw:flex tw:justify-center tw:gap-2 sm:tw:gap-8">
          <Button
            variant="primary"  // ← should be your purple color
            data-testid="confirm-pickup-button"
            onClick={() => {
              if (!selectedPackage) return;

              onConfirm({
                id: selectedPackage.id,
                status: DeliveryLogStatus.PICKEDUP,
                pickupD: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
              });

              onOpenChange(false);
            }}
          >
            Yes
          </Button>
          <Button
            variant="outline"
            data-testid="cancel-pickup-button"
            onClick={() => onOpenChange(false)}
          >
            No
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};