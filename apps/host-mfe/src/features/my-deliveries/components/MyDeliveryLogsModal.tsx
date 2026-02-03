import React, { useState } from 'react';
import { X, Maximize2, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { DeliveryLogStatus, type DeliveryLogRecord } from "../api/myDeliveryLogs.types"
interface MyDeliveryLogsModalProps {
    isOpen: boolean;
    packageItem: DeliveryLogRecord | null;
    onClose: () => void;
    onUpdate: (id: string, payload: Partial<DeliveryLogRecord>) => void;
    onUpdateStatus: (id: string, status: DeliveryLogStatus, pickupD?: string) => void;
}

export const MyDeliveryLogsModal: React.FC<MyDeliveryLogsModalProps> = ({
    isOpen,
    packageItem,
    onClose,
    onUpdate,
    onUpdateStatus,
}) => {
    const [isZoomed, setIsZoomed] = useState(false);
    const [pickupNote, setPickupNote] = useState(packageItem?.pickupNote || '');

    if (!isOpen || !packageItem) return null;

    const formatDate = (date: string | null) => {
        if (!date) return '-';
        try {
            return format(new Date(date), 'dd MMM yy h:mm a');
        } catch {
            return '-';
        }
    };

    const handleSave = () => {
        onUpdate(packageItem.id, { pickupNote });
    };

    const getStatusClass = (status: DeliveryLogStatus) => {
        switch (status) {
            case DeliveryLogStatus.PENDING: return 'tw:bg-yellow-100 tw:text-yellow-700';
            case DeliveryLogStatus.PICKEDUP: return 'tw:bg-green-100 tw:text-green-700';
            case DeliveryLogStatus.UNIDENTIFIED: return 'tw:bg-gray-100 tw:text-gray-700';
            case DeliveryLogStatus.DISCARD:
            case DeliveryLogStatus.DISPOSED: return 'tw:bg-red-100 tw:text-red-700';
            default: return 'tw:bg-blue-100 tw:text-blue-700';
        }
    };

    return (
        <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:bg-black/60 tw:p-4" data-testid="package-details-modal">
            <div className="tw:bg-white tw:rounded-xl tw:shadow-2xl tw:w-full tw:max-w-4xl tw:max-h-[90vh] tw:flex tw:flex-col tw:overflow-hidden">
                {/* Header */}
                <div className="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-4 tw:border-b tw:border-gray-100">
                    <h3 className="tw:text-xl tw:font-bold tw:text-gray-900">Package Details</h3>
                    <button onClick={onClose} className="tw:p-1.5 tw:rounded-full hover:tw:bg-gray-100 tw:transition-colors" data-testid="close-package-details">
                        <X size={20} className="tw:text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="tw:flex-1 tw:overflow-y-auto tw:p-6">
                    <div className="tw:grid tw:grid-cols-1 lg:tw:grid-cols-2 tw:gap-8">
                        {/* Form Side */}
                        <div className="tw:space-y-6">
                            <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                                <div>
                                    <label className="tw:block tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wider tw:mb-1">Received Date</label>
                                    <div className="tw:text-gray-900 tw:font-medium" data-testid="modal-received-date">{formatDate(packageItem.receiveD)}</div>
                                </div>
                                <div>
                                    <label className="tw:block tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wider tw:mb-1">Carrier Name</label>
                                    <div className="tw:text-gray-900 tw:font-medium" data-testid="modal-carrier-name">{packageItem.carrier || 'Unknown'}</div>
                                </div>
                            </div>

                            <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                                <div>
                                    <label className="tw:block tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wider tw:mb-1">Pickup Date</label>
                                    <div className="tw:text-gray-900 tw:font-medium" data-testid="modal-pickup-date">{formatDate(packageItem.pickupD)}</div>
                                </div>
                                <div>
                                    <label className="tw:block tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wider tw:mb-1">Tracking Number</label>
                                    <div className="tw:text-gray-900 tw:font-medium" data-testid="modal-tracking-number">{packageItem.trackingId || '-'}</div>
                                </div>
                            </div>

                            <div className="tw:space-y-4">
                                <div>
                                    <label className="tw:block tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wider tw:mb-1">Location</label>
                                    <div className="tw:text-gray-900 tw:font-medium" data-testid="modal-location">{packageItem.siteName}</div>
                                </div>
                                <div>
                                    <label className="tw:block tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wider tw:mb-1">Delivery Area</label>
                                    <div className="tw:text-gray-900 tw:font-medium" data-testid="modal-delivery-area">{packageItem.siteDeliveryAreaName}</div>
                                </div>
                            </div>

                            <div>
                                <label className="tw:block tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wider tw:mb-1">Pickup Note</label>
                                <textarea
                                    className="tw:w-full tw:p-3 tw:border tw:border-gray-200 tw:rounded-lg tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-blue-500/20 tw:focus:border-blue-500 tw:transition-all tw:min-h-[100px]"
                                    placeholder="Add Pickup Note"
                                    value={pickupNote}
                                    onChange={(e) => setPickupNote(e.target.value)}
                                    data-testid="pickup-note-input"
                                />
                            </div>
                        </div>

                        {/* Image & Status Side */}
                        <div className="tw:space-y-6">
                            <div className="tw:relative tw:group tw:rounded-xl tw:overflow-hidden tw:border tw:border-gray-200 tw:aspect-video tw:bg-gray-50 tw:flex tw:items-center tw:justify-center">
                                <img
                                    src={packageItem.labelUri || "/assets/images/defaultuser.jpg"}
                                    alt="Scanned Label"
                                    className="tw:w-full tw:h-full tw:object-contain"
                                    data-testid="modal-package-image"
                                />
                                <button
                                    onClick={() => setIsZoomed(true)}
                                    className="tw:absolute tw:bottom-4 tw:right-4 tw:p-2 tw:bg-white/90 tw:rounded-lg tw:shadow-lg tw:text-gray-700 hover:tw:bg-white tw:transition-colors tw:opacity-0 group-hover:tw:opacity-100"
                                    data-testid="expand-image-button"
                                >
                                    <Maximize2 size={18} />
                                </button>
                            </div>

                            <div className="tw:space-y-4">
                                <div>
                                    <label className="tw:block tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wider tw:mb-2">Recipient Name</label>
                                    <div className="tw:text-lg tw:font-bold tw:text-gray-900" data-testid="modal-recipient-name">
                                        {packageItem.recipientFirstName} {packageItem.recipientLastName}
                                    </div>
                                </div>

                                <div className="tw:flex tw:items-center tw:gap-3 tw:pt-2">
                                    <div className={`tw:px-4 tw:py-1.5 tw:rounded-full tw:text-sm tw:font-bold tw:uppercase tw:tracking-wider ${getStatusClass(packageItem.status)}`} data-testid="modal-status">
                                        {packageItem.status}
                                    </div>

                                    {packageItem.status === DeliveryLogStatus.PENDING && (
                                        <button
                                            onClick={() => onUpdateStatus(packageItem.id, DeliveryLogStatus.PICKEDUP, format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"))}
                                            className="tw:px-4 tw:py-1.5 tw:bg-blue-50 tw:text-blue-600 tw:border tw:border-blue-100 tw:rounded-full tw:text-sm tw:font-bold hover:tw:bg-blue-100 tw:transition-colors"
                                            data-testid="mark-pickedup-modal-button"
                                        >
                                            Picked Up
                                        </button>
                                    )}
                                </div>

                                <div className="tw:flex tw:flex-wrap tw:gap-3 tw:pt-4">
                                    {(packageItem.status === DeliveryLogStatus.UNIDENTIFIED || packageItem.status === DeliveryLogStatus.PENDING) && (
                                        <>
                                            <button
                                                onClick={() => onUpdateStatus(packageItem.id, DeliveryLogStatus.UNIDENTIFIED)}
                                                className="tw:px-4 tw:py-2 tw:border tw:border-gray-200 tw:rounded-lg tw:text-sm tw:font-semibold tw:text-gray-600 hover:tw:bg-gray-50 tw:transition-colors"
                                                data-testid="not-my-delivery-button"
                                            >
                                                Not My Delivery
                                            </button>
                                            <button
                                                onClick={() => onUpdateStatus(packageItem.id, DeliveryLogStatus.DISCARD)}
                                                className="tw:px-4 tw:py-2 tw:border tw:border-gray-200 tw:rounded-lg tw:text-sm tw:font-semibold tw:text-gray-600 hover:tw:bg-gray-50 tw:transition-colors"
                                                data-testid="discard-button"
                                            >
                                                Discard
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="tw:flex tw:items-center tw:justify-end tw:gap-3 tw:px-6 tw:py-4 tw:bg-gray-50 tw:border-t tw:border-gray-100">
                    <button
                        onClick={onClose}
                        className="tw:px-5 tw:py-2 tw:text-sm tw:font-semibold tw:text-gray-600 hover:tw:text-gray-800 tw:transition-colors"
                        data-testid="cancel-save-button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="tw:px-6 tw:py-2 tw:bg-blue-600 tw:text-white tw:rounded-lg tw:text-sm tw:font-semibold hover:tw:bg-blue-700 tw:shadow-sm tw:transition-all"
                        data-testid="save-package-button"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* Zoom Modal */}
            {isZoomed && (
                <div className="tw:fixed tw:inset-0 tw:z-[60] tw:bg-black/90 tw:flex tw:items-center tw:justify-center tw:p-4" data-testid="image-viewer-modal">
                    <button onClick={() => setIsZoomed(false)} className="tw:absolute tw:top-6 tw:right-6 tw:p-2 tw:bg-white/10 tw:hover:bg-white/20 tw:rounded-full tw:text-white tw:transition-colors" data-testid="close-image-viewer">
                        <X size={24} />
                    </button>
                    <img
                        src={packageItem.labelUri || "/assets/images/defaultuser.jpg"}
                        alt="Full size scanned label"
                        className="tw:max-w-full tw:max-h-full tw:object-contain"
                        data-testid="full-size-image"
                    />
                </div>
            )}
        </div>
    );
};
