import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar, Truck, Hash, MapPin, Package, Expand } from "lucide-react";
import { Button, Image } from "@visitly/ui";
import { RightSlide } from "@visitly/ui";
import {
  DeliveryLogStatus,
  type DeliveryLogRecord,
} from "../api/myDeliveryLogs.types";
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

  if (!packageItem) return null;

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
    <>
      <RightSlide
        open={isOpen}
        onClose={onClose}
        title="Package Details"
        width={520}
      >
        <div className="tw:flex tw:flex-col tw:gap-6">
          {/* Hero Section */}
          <div className="tw:flex tw:items-center tw:gap-4 tw:p-5 tw:rounded-xl tw:bg-gray-50 tw:border tw:border-gray-200">
            <div className="tw:w-12 tw:h-12 tw:rounded-xl tw:bg-primary/10 tw:flex tw:items-center tw:justify-center">
              <Package size={24} className="tw:text-primary" />
            </div>
            <div className="tw:flex-1 tw:min-w-0">
              <div className="tw:text-base tw:font-semibold tw:text-gray-900">
                {packageItem.carrier || "Unknown Carrier"}
              </div>
              <div className="tw:text-xs tw:text-gray-500 tw:break-all">
                {packageItem.trackingId || "-"}
              </div>
            </div>
            <div
              className={`tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-medium tw:border ${getStatusBadgeClass(
                packageItem.status,
              )}`}
            >
              {packageItem.status}
            </div>
          </div>

          {/* Detail Grid */}
          <div className="tw:grid tw:grid-cols-2 tw:rounded-xl tw:border tw:border-gray-200 tw:overflow-hidden">
            {[
              {
                label: "Received",
                value: formatDate(packageItem.receiveD),
                icon: Calendar,
              },
              {
                label: "Carrier",
                value: packageItem.carrier || "-",
                icon: Truck,
              },
              {
                label: "Pickup Date",
                value: formatDate(packageItem.pickupD),
                icon: Calendar,
              },
              {
                label: "Tracking ID",
                value: packageItem.trackingId || "-",
                icon: Hash,
              },
              {
                label: "Location",
                value: packageItem.siteName || "-",
                icon: MapPin,
              },
              {
                label: "Delivery Area",
                value: packageItem.siteDeliveryAreaName || "-",
                icon: Package,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="tw:p-4 tw:border-b tw:border-r tw:border-gray-200 even:tw:border-r-0 last:tw:border-b-0"
              >
                <div className="tw:flex tw:items-center tw:gap-2 tw:text-xs tw:text-gray-500 tw:uppercase tw:mb-1">
                  <item.icon size={14} />
                  {item.label}
                </div>
                <div className="tw:text-sm tw:font-medium tw:text-gray-900 tw:break-all">
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Label Image */}
          <div className="tw:relative tw:rounded-xl tw:border tw:border-gray-200 tw:overflow-hidden tw:bg-gray-50">
            <button
              onClick={() => setIsImageOpen(true)}
              className="tw:absolute tw:top-2 tw:right-2 tw:z-10 tw:bg-black/60 tw:text-white tw:p-2 tw:rounded-full"
              data-testid="delivery-log-expand-image-btn"
            >
              <Expand size={16} />
            </button>

            <Image
              src={
                packageItem.labelUri ||
                "/assets/images/default-label-placeholder.png"
              }
              alt="Package Label"
              className="tw:w-full tw:max-h-[240px] tw:object-contain"
            />
          </div>

          {/* Recipient */}
          <div className="tw:text-sm">
            <span className="tw:text-gray-500">Recipient:</span>{" "}
            <span className="tw:font-semibold">
              {packageItem.recipientFirstName}{" "}
              {packageItem.recipientLastName || ""}
            </span>
          </div>

          {/* Pickup Note */}
          <div>
            <div className="tw:text-xs tw:font-medium tw:text-gray-500 tw:uppercase tw:mb-1">
              Pickup Note
            </div>
            <textarea
              disabled
              value={packageItem.pickupNote || ""}
              onChange={(e) => setPickupNote(e.target.value)}
              className="tw:w-full tw:p-3 tw:rounded-lg tw:border tw:border-gray-200 tw:bg-gray-50 tw:text-sm"
            />
          </div>

          {/* Actions */}
          <div className="tw:flex tw:flex-wrap tw:gap-3">
            {packageItem.status === DeliveryLogStatus.PENDING && (
              <Button
                onClick={() =>
                  onUpdateStatus(
                    packageItem.id,
                    DeliveryLogStatus.PICKEDUP,
                    format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                  )
                }
                variant="primary"
                data-testid="delivery-log-picked-up-btn"
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
                    data-testid="delivery-log-not-my-delivery-btn"
                  >
                    Not My Delivery
                  </Button>

                  <Button
                    onClick={() =>
                      onUpdateStatus(
                        packageItem.id,
                        DeliveryLogStatus.DISCARD,
                      )
                    }
                    variant="outline"
                    data-testid="delivery-log-discard-btn"
                  >
                    Discard
                  </Button>
                </>
              )}
          </div>

          {/* Bottom Save / Cancel */}
          {/* <div className="tw:flex tw:justify-end tw:gap-3 tw:pt-4 tw:border-t tw:border-gray-200">
            <Button onClick={onClose} variant="outline" data-testid="delivery-log-cancel-btn">
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary" data-testid="delivery-log-save-btn">
              Save
            </Button>
          </div> */}
        </div>
      </RightSlide>

      <ScannedImageDialog
        isOpen={isImageOpen}
        onClose={() => setIsImageOpen(false)}
        imageUrl={packageItem.labelUri}
      />
    </>
  );
};
