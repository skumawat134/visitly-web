import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import { cn } from "@visitly/ui";

interface CancelVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (params: {
        notifyVisitFlag: boolean;
        notifyHostFlag: boolean;
        updateType: "SELECTED_VISIT" | "FUTURE_VISITS_ONLY" | "ALL_VISITS";
    }) => void;
    isRecurring: boolean;
    visitDate?: string;
}

type UpdateType =
  | "SELECTED_VISIT"
  | "FUTURE_VISITS_ONLY"
  | "ALL_VISITS";

export const CancelVisitModal: React.FC<CancelVisitModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    isRecurring,
    visitDate,
}) => {
    const [notifyVisit, setNotifyVisit] = useState(true);
    const [notifyHost, setNotifyHost] = useState(true);
   const [updateType, setUpdateType] = useState<UpdateType>("SELECTED_VISIT");

    if (!isOpen) return null;

    return (
        <div className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center tw:p-4 tw:bg-gray-900/60 tw:backdrop-blur-sm">
            <div className="tw:bg-white tw:rounded-2xl tw:shadow-2xl tw:max-w-md tw:w-full tw:overflow-hidden tw:animate-in tw:fade-in tw:zoom-in tw:duration-200">
                <div className="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-4 tw:border-b tw:border-gray-100">
                    <h3 className="tw:text-lg tw:font-bold tw:text-gray-900">
                        Cancel Visit
                    </h3>
                    <button
                        onClick={onClose}
                        className="tw:p-2 tw:text-gray-400 hover:tw:text-gray-600 tw:rounded-full hover:tw:bg-gray-100 tw:transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="tw:p-6">
                    <div className="tw:flex tw:items-start tw:gap-4 tw:mb-6">
                        <div className="tw:p-2 tw:bg-red-50 tw:rounded-full tw:shrink-0">
                            <AlertCircle size={24} className="tw:text-red-500" />
                        </div>
                        <div>
                            <p className="tw:text-sm tw:font-medium tw:text-gray-900">
                                Are you sure?
                            </p>
                            <p className="tw:text-sm tw:text-gray-500 tw:mt-1">
                                Do you really want to cancel this Visit? This action cannot be undone.
                            </p>
                        </div>
                    </div>

                    {isRecurring && (
                        <div className="tw:mb-6">
                            <label className="tw:text-[12px] tw:font-bold tw:text-gray-400 tw:uppercase tw:tracking-wider tw:mb-3 tw:block">
                                Cancellation Options
                            </label>
                            <div className="tw:flex tw:flex-col tw:gap-2">
                                <label className="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:border tw:border-gray-200 tw:rounded-xl hover:tw:bg-gray-50 tw:cursor-pointer tw:transition-colors">
                                    <input
                                        type="radio"
                                        name="updateType"
                                        value="SELECTED_VISIT"
                                        checked={updateType === "SELECTED_VISIT"}
                                        onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                                        className="tw:w-4 tw:h-4 tw:text-indigo-600"
                                    />
                                    <div className="tw:flex tw:flex-col">
                                        <span className="tw:text-sm tw:font-medium tw:text-gray-900">
                                            This Visit Only
                                        </span>
                                        {visitDate && (
                                            <span className="tw:text-xs tw:text-gray-500">
                                                {visitDate}
                                            </span>
                                        )}
                                    </div>
                                </label>
                                <label className="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:border tw:border-gray-200 tw:rounded-xl hover:tw:bg-gray-50 tw:cursor-pointer tw:transition-colors">
                                    <input
                                        type="radio"
                                        name="updateType"
                                        value="FUTURE_VISITS_ONLY"
                                        checked={updateType === "FUTURE_VISITS_ONLY"}
                                        onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                                        className="tw:w-4 tw:h-4 tw:text-indigo-600"
                                    />
                                    <span className="tw:text-sm tw:font-medium tw:text-gray-900">
                                        This and following Visits
                                    </span>
                                </label>
                                <label className="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:border tw:border-gray-200 tw:rounded-xl hover:tw:bg-gray-50 tw:cursor-pointer tw:transition-colors">
                                    <input
                                        type="radio"
                                        name="updateType"
                                        value="ALL_VISITS"
                                        checked={updateType === "ALL_VISITS"}
                                        onChange={(e) => setUpdateType(e.target.value as UpdateType)}
                                        className="tw:w-4 tw:h-4 tw:text-indigo-600"
                                    />
                                    <span className="tw:text-sm tw:font-medium tw:text-gray-900">
                                        All Future Visits
                                    </span>
                                </label>
                            </div>
                        </div>
                    )}

                    <div className="tw:grid tw:grid-cols-2 tw:gap-4">
                        <div className="tw:flex tw:flex-col tw:gap-2">
                            <span className="tw:text-xs tw:font-semibold tw:text-gray-400">
                                Notify Visitor
                            </span>
                            <div className="tw:flex tw:items-center tw:gap-4">
                                <label className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={notifyVisit}
                                        onChange={() => setNotifyVisit(true)}
                                        className="tw:w-4 tw:h-4 tw:text-indigo-600"
                                    />
                                    <span className="tw:text-sm tw:text-gray-700">Yes</span>
                                </label>
                                <label className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!notifyVisit}
                                        onChange={() => setNotifyVisit(false)}
                                        className="tw:w-4 tw:h-4 tw:text-indigo-600"
                                    />
                                    <span className="tw:text-sm tw:text-gray-700">No</span>
                                </label>
                            </div>
                        </div>
                        <div className="tw:flex tw:flex-col tw:gap-2">
                            <span className="tw:text-xs tw:font-semibold tw:text-gray-400">
                                Notify Host
                            </span>
                            <div className="tw:flex tw:items-center tw:gap-4">
                                <label className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={notifyHost}
                                        onChange={() => setNotifyHost(true)}
                                        className="tw:w-4 tw:h-4 tw:text-indigo-600"
                                    />
                                    <span className="tw:text-sm tw:text-gray-700">Yes</span>
                                </label>
                                <label className="tw:flex tw:items-center tw:gap-2 tw:cursor-pointer">
                                    <input
                                        type="radio"
                                        checked={!notifyHost}
                                        onChange={() => setNotifyHost(false)}
                                        className="tw:w-4 tw:h-4 tw:text-indigo-600"
                                    />
                                    <span className="tw:text-sm tw:text-gray-700">No</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tw:px-6 tw:py-4 tw:bg-gray-50 tw:flex tw:items-center tw:justify-end tw:gap-3">
                    <button
                        onClick={onClose}
                        className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-gray-700 hover:tw:bg-gray-200 tw:rounded-lg tw:transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() =>
                            onConfirm({
                                notifyVisitFlag: notifyVisit,
                                notifyHostFlag: notifyHost,
                                updateType,
                            })
                        }
                        className="tw:px-4 tw:py-2 tw:text-sm tw:font-medium tw:text-white tw:bg-red-600 hover:tw:bg-red-700 tw:rounded-lg tw:shadow-sm tw:transition-colors"
                    >
                        Confirm Cancellation
                    </button>
                </div>
            </div>
        </div>
    );
};
