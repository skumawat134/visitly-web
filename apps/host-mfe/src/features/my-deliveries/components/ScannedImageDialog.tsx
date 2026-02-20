import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { Image } from "@visitly/ui";

interface ScannedImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl?: string | null;
}

export function ScannedImageDialog({
  isOpen,
  onClose,
  imageUrl,
}: ScannedImageDialogProps): JSX.Element | null {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="
          tw:fixed tw:inset-0 
          tw:bg-black/50 
          tw:z-[1200]
        "
      />

      {/* Modal Wrapper */}
      <div
        className="
          tw:fixed tw:inset-0 
          tw:z-[1201] 
          tw:flex tw:items-center tw:justify-center 
          tw:p-4
        "
        onClick={onClose}
      >
        {/* Modal */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            tw:w-full
            tw:min-w-[280px]
            tw:max-w-[600px]
            tw:min-h-[220px]
            tw:max-h-[75vh]
            tw:bg-white
            tw:rounded-xl
            tw:shadow-xl
            tw:flex tw:flex-col
            tw:overflow-hidden
          "
        >
          {/* Header */}
          <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-3 tw:border-b tw:border-gray-200 tw:bg-gray-50">
            <h3 className="tw:text-base tw:font-semibold tw:text-gray-900">
              Scanned Image
            </h3>

            <button
              onClick={onClose}
              className="tw:p-1.5 tw:rounded-full tw:hover:bg-gray-200 tw:transition"
              data-testid="scanned-image-close-btn"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div
            className="
              tw:flex-1
              tw:flex tw:items-center tw:justify-center
              tw:p-4
              tw:bg-gray-50
              tw:overflow-auto
            "
          >
            <Image
              src={
                imageUrl ||
                "/assets/images/default-label-placeholder.png"
              }
              alt="Scanned Image"
              className="
                tw:max-h-[60vh]
                tw:min-h-[160px]
                tw:max-w-full
                tw:min-w-[160px]
                tw:object-contain
                tw:rounded-lg
              "
            />
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}