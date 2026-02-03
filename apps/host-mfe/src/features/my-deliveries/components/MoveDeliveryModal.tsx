import React, { useState, useEffect } from 'react';
import { X, MapPin, Box } from 'lucide-react';
import type { Site, DeliveryArea } from "../api/myDeliveryLogs.types"

interface MoveDeliveryModalProps {
    isOpen: boolean;
    onClose: () => void;
    sites: Site[];
    deliveryAreas: DeliveryArea[];
    onSiteChange: (siteId: string) => void;
    onConfirm: (siteId: string, areaId: string) => void;
    selectedCount: number;
}

export const MoveDeliveryModal: React.FC<MoveDeliveryModalProps> = ({
    isOpen,
    onClose,
    sites,
    deliveryAreas,
    onSiteChange,
    onConfirm,
    selectedCount,
}) => {
    const [targetSiteId, setTargetSiteId] = useState('');
    const [targetAreaId, setTargetAreaId] = useState('');

    if (!isOpen) return null;

    return (
        <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:bg-black/60 tw:p-4" data-testid="move-delivery-modal">
            <div className="tw:bg-white tw:rounded-xl tw:shadow-2xl tw:w-full tw:max-w-md tw:flex tw:flex-col tw:overflow-hidden">
                {/* Header */}
                <div className="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-4 tw:border-b tw:border-gray-100">
                    <h3 className="tw:text-lg tw:font-bold tw:text-gray-900">Move {selectedCount} Delivery{selectedCount > 1 ? 'ies' : ''}</h3>
                    <button onClick={onClose} className="tw:p-1.5 tw:rounded-full hover:tw:bg-gray-100 tw:transition-colors" data-testid="close-move-modal">
                        <X size={18} className="tw:text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="tw:p-6 tw:space-y-5">
                    <div className="tw:p-3 tw:bg-blue-50 tw:rounded-lg tw:text-sm tw:text-blue-700 tw:font-medium tw:flex tw:gap-2 tw:items-start">
                        <Box size={16} className="tw:mt-0.5 tw:flex-shrink-0" />
                        Select new location & delivery area
                    </div>

                    <div className="tw:space-y-4">
                        <div className="tw:space-y-1.5">
                            <label className="tw:text-xs tw:font-bold tw:text-gray-500 tw:uppercase tw:tracking-wider">Target Location</label>
                            <div className="tw:relative">
                                <MapPin className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400" size={16} />
                                <select
                                    className="tw:w-full tw:pl-10 tw:pr-4 tw:py-2.5 tw:border tw:border-gray-200 tw:rounded-xl tw:bg-gray-50/50 tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-blue-500/20 tw:text-sm"
                                    value={targetSiteId}
                                    onChange={(e) => {
                                        setTargetSiteId(e.target.value);
                                        onSiteChange(e.target.value);
                                        setTargetAreaId('');
                                    }}
                                    data-testid="new-location-select"
                                >
                                    <option value="">Select Location</option>
                                    {sites.map(site => (
                                        <option key={site.id} value={site.id}>{site.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="tw:space-y-1.5">
                            <label className="tw:text-xs tw:font-bold tw:text-gray-500 tw:uppercase tw:tracking-wider">Target Delivery Area</label>
                            <div className="tw:relative">
                                <Box className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400" size={16} />
                                <select
                                    className="tw:w-full tw:pl-10 tw:pr-4 tw:py-2.5 tw:border tw:border-gray-200 tw:rounded-xl tw:bg-gray-50/50 tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-blue-500/20 tw:text-sm disabled:tw:opacity-60"
                                    value={targetAreaId}
                                    onChange={(e) => setTargetAreaId(e.target.value)}
                                    disabled={!targetSiteId}
                                    data-testid="new-delivery-area-select"
                                >
                                    <option value="">Choose Delivery Area</option>
                                    {deliveryAreas.map(area => (
                                        <option key={area.id} value={area.id}>{area.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="tw:flex tw:items-center tw:justify-end tw:gap-3 tw:px-6 tw:py-4 tw:bg-gray-50 tw:border-t tw:border-gray-100">
                    <button
                        onClick={onClose}
                        className="tw:px-5 tw:py-2 tw:text-sm tw:font-semibold tw:text-gray-600 hover:tw:text-gray-800 tw:transition-colors"
                        data-testid="cancel-move-button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(targetSiteId, targetAreaId)}
                        disabled={!targetSiteId || !targetAreaId}
                        className="tw:px-6 tw:py-2 tw:bg-blue-600 tw:text-white tw:rounded-lg tw:text-sm tw:font-semibold hover:tw:bg-blue-700 disabled:tw:opacity-50 disabled:tw:cursor-not-allowed tw:shadow-sm tw:transition-all"
                        data-testid="confirm-move-button"
                    >
                        Update Location
                    </button>
                </div>
            </div>
        </div>
    );
};
