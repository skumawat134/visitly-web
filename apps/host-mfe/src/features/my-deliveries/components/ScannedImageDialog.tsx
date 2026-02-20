import React from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@visitly/ui";
import { Image } from "@visitly/ui";

interface ScannedImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
}

export const ScannedImageDialog: React.FC<ScannedImageDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="tw:max-w-2xl tw:p-0 tw:overflow-hidden">
        {/* Header */}
        <div className="tw:flex tw:items-center tw:justify-between tw:px-5 tw:py-3 tw:border-b tw:bg-gray-50">
          <h3 className="tw:text-lg tw:font-semibold">Scanned Image</h3>
          <button
            onClick={onClose}
            className="tw:p-1.5 tw:rounded-full hover:tw:bg-gray-200"
            data-testid="scanned-image-close-btn"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="tw:p-4 tw:flex tw:justify-center tw:bg-white">
          <Image
            src={imageUrl || "/assets/images/default-label-placeholder.png"}
            alt="Scanned Image"
            className="tw:max-h-[60vh] tw:w-auto tw:object-contain tw:rounded-lg"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
