import React, { useState } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";
import {
  DeliveryLogStatus,
  type DeliveryLogRecord,
} from "../api/myDeliveryLogs.types";
import { Button, Image } from "@visitly/ui";
import { Expand } from "lucide-react";
import { ScannedImageDialog } from "./ScannedImageDialog";

interface MyDeliveryLogsModalProps {
  isOpen: boolean;
  packageItem: DeliveryLogRecord | null;
  onClose: () => void;
  onUpdate: (id: string, payload: Partial<DeliveryLogRecord>) => void;
  onUpdateStatus: (
    id: string,
    status: DeliveryLogStatus,
    pickupD?: string,
  ) => void;
}

export const MyDeliveryLogsModal: React.FC<MyDeliveryLogsModalProps> = ({
  isOpen,
  packageItem,
  onClose,
  onUpdate,
  onUpdateStatus,
}) => {
  const [pickupNote, setPickupNote] = useState(packageItem?.pickupNote || "");
  const [isImageOpen, setIsImageOpen] = useState(false);

  if (!isOpen || !packageItem) return null;

  console.log("packageItem", packageItem);

  const formatDate = (date: string | null, withTime = true) => {
    if (!date) return "-";
    try {
      return format(
        new Date(date),
        withTime ? "dd MMM yy h:mm a" : "dd MMM yy",
      );
    } catch {
      return "-";
    }
  };

  const handleSave = () => {
    onUpdate(packageItem.id, { pickupNote });
    // onClose();
  };

  const getStatusBadgeClass = (status: DeliveryLogStatus) => {
    switch (status) {
      case DeliveryLogStatus.PENDING:
        return "tw:bg-yellow-100 tw:text-yellow-800 tw:border-yellow-300";
      case DeliveryLogStatus.PICKEDUP:
        return "tw:bg-green-100 tw:text-green-800 tw:border-green-300";
      case DeliveryLogStatus.UNIDENTIFIED:
        return "tw:bg-gray-100 tw:text-gray-800 tw:border-gray-300";
      case DeliveryLogStatus.DISCARD:
      case DeliveryLogStatus.DISPOSED:
        return "tw:bg-red-100 tw:text-red-800 tw:border-red-300";
      default:
        return "tw:bg-blue-100 tw:text-blue-800 tw:border-blue-300";
    }
  };

  return (
    <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:bg-black/60 tw:p-4">
      <div className="tw:bg-white tw:rounded-xl tw:shadow-2xl tw:w-full tw:max-w-5xl tw:max-h-[92vh] tw:flex tw:flex-col tw:overflow-hidden">
        {/* Header */}
        <div className="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-4 tw:border-b tw:border-gray-200 tw:bg-gray-50">
          <h3 className="tw:text-lg tw:font-semibold tw:text-gray-900">
            Package Details
          </h3>
          <button
            onClick={onClose}
            className="tw:p-1.5 tw:rounded-full hover:tw:bg-gray-200 tw:transition-colors"
          >
            <X size={20} className="tw:text-gray-600" />
          </button>
        </div>

        {/* Main Content */}
        <div className="tw:flex-1 tw:p-6 tw:overflow-y-auto tw:flex tw:flex-col tw:lg:flex-row tw:gap-8">
          {/* Left - Info */}
          <div className="tw:flex-1 tw:space-y-5 tw:min-w-0">
            <div className="tw:grid tw:grid-cols-2 tw:gap-x-6 tw:gap-y-4 tw:text-sm">
              <div>
                <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:uppercase">
                  Received Date
                </div>
                <div className="tw:font-medium tw:text-gray-900">
                  {formatDate(packageItem.receiveD)}
                </div>
              </div>
              <div>
                <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:uppercase">
                  Carrier Name
                </div>
                <div className="tw:font-medium tw:text-gray-900">
                  {packageItem.carrier || "-"}
                </div>
              </div>

              <div>
                <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:uppercase">
                  Pickup Date
                </div>
                <div className="tw:font-medium tw:text-gray-900">
                  {formatDate(packageItem.pickupD)}
                </div>
              </div>
              <div>
                <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:uppercase">
                  Tracking Number
                </div>
                <div className="tw:font-medium tw:text-gray-900 tw:break-all">
                  {packageItem.trackingId || "-"}
                </div>
              </div>

              <div>
                <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:uppercase">
                  Location *
                </div>
                <div className="tw:font-medium tw:text-gray-900">
                  {packageItem.siteName || "-"}
                </div>
              </div>
              <div>
                <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:uppercase">
                  Delivery Area *
                </div>
                <div className="tw:font-medium tw:text-gray-900">
                  {packageItem.siteDeliveryAreaName || "-"}
                </div>
              </div>
            </div>

            {/* Pickup Note */}
            <div className="tw:pt-2">
              <label className="tw:block tw:text-xs tw:font-medium tw:text-gray-500 tw:uppercase tw:mb-1.5">
                Pickup Note
              </label>
              <textarea
                disabled
                className="tw:w-full tw:p-3 tw:border tw:border-gray-300 tw:rounded-lg tw:focus:outline-none tw:focus:ring-1 tw:bg-[#e9ecef] tw:min-h-[51px] tw:text-sm"
                placeholder="Add Pick Up Note"
                value={packageItem?.pickupNote || ""}
                onChange={(e) => setPickupNote(e.target.value)}
              />
            </div>
          </div>

          {/* Right - Label Image */}
          <div className="tw:flex-1 tw:flex tw:flex-col tw:gap-4 tw:min-w-0">
            <div
              className="tw:relative tw:rounded-lg tw:overflow-hidden tw:border tw:border-gray-300 tw:bg-white tw:shadow-sm 
                tw:h-[220px] md:tw:h-[280px] lg:tw:h-[320px]"
            >
              {/* Expand Icon */}
              <button
                onClick={() => setIsImageOpen(true)}
                className="tw:absolute tw:top-2 tw:right-2 tw:z-10 tw:bg-black/60 tw:text-white tw:p-2 tw:rounded-full hover:tw:bg-black/80"
              >
                <Expand size={18} />
              </button>

              <Image
                src={
                  packageItem.labelUri ||
                  "/assets/images/default-label-placeholder.png"
                }
                alt="Package Label"
                className="tw:w-full tw:h-full tw:object-contain"
              />
            </div>

            {/* Recipient Name */}
            <div className="tw:text-sm">
              <span className="tw:font-medium tw:text-gray-700">
                Recipient Name:
              </span>{" "}
              <span className="tw:font-semibold">
                {packageItem.recipientFirstName}{" "}
                {packageItem.recipientLastName || ""}
              </span>
            </div>

            {/* FIXED HERE */}
            <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-4">
              <div
                className={`tw:px-4 tw:py-1.5 tw:rounded-full tw:text-sm tw:font-medium tw:border ${getStatusBadgeClass(packageItem.status)}`}
                data-testid="modal-status"
              >
                {packageItem.status}
              </div>

              {packageItem.status === DeliveryLogStatus.PENDING && (
                <Button
                  onClick={() =>
                    onUpdateStatus(
                      packageItem.id,
                      DeliveryLogStatus.PICKEDUP,
                      format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                    )
                  }
                  data-testid="mark-pickedup-modal-button"
                  variant="outline"
                  className="tw:text-[#5E2CED] tw:border tw:border-[#5E2CED]!"
                >
                  Picked Up
                </Button>
              )}

              {(packageItem.status === DeliveryLogStatus.UNIDENTIFIED ||
                packageItem.status === DeliveryLogStatus.PENDING) && (
                <>
                  <Button
                    onClick={() =>
                      onUpdateStatus(
                        packageItem.id,
                        DeliveryLogStatus.UNIDENTIFIED,
                      )
                    }
                    variant="outline"
                    className="tw:text-[#5E2CED] tw:border tw:border-[#5E2CED]!"
                    data-testid="not-my-delivery-button"
                  >
                    Not My Delivery
                  </Button>

                  <Button
                    onClick={() =>
                      onUpdateStatus(packageItem.id, DeliveryLogStatus.DISCARD)
                    }
                    variant="outline"
                    className="tw:text-[#5E2CED] tw:border tw:border-[#5E2CED]!"
                    data-testid="discard-button"
                  >
                    Discard
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        <ScannedImageDialog
          isOpen={isImageOpen}
          onClose={() => setIsImageOpen(false)}
          imageUrl={packageItem.labelUri}
        />

        {/* Bottom Actions */}
        <div className="tw:px-6 tw:py-5 tw:border-t tw:border-gray-200 tw:bg-gray-50 tw:flex tw:flex-col sm:tw:flex-row tw:items-center tw:justify-between tw:gap-4">
          <div className="tw:flex tw:gap-3 tw:ml-auto">
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary">
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
