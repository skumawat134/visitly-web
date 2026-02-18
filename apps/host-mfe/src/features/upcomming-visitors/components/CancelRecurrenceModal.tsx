import React, { useState } from "react";
import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Label,
} from "@visitly/ui";

interface CancelRecurrenceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onNext: (updateType: "SELECTED_VISIT" | "FUTURE_VISITS_ONLY" | "ALL_VISITS") => void;
    visitDate?: string;
}

export const CancelRecurrenceModal: React.FC<CancelRecurrenceModalProps> = ({
    isOpen,
    onClose,
    onNext,
    visitDate,
}) => {
    const [updateType, setUpdateType] = useState<
        "SELECTED_VISIT" | "FUTURE_VISITS_ONLY" | "ALL_VISITS"
    >("SELECTED_VISIT");

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="tw:max-w-md tw:rounded-2xl tw:p-0 tw:overflow-hidden tw:shadow-2xl tw:border tw:border-gray-200 tw:bg-white">
                <DialogHeader className="tw:px-8 tw:pt-8 tw:pb-4">
                    <DialogTitle className="tw:text-2xl tw:font-semibold tw:text-gray-900">
                        Cancel Recurrence Visit
                    </DialogTitle>
                </DialogHeader>

                <div className="tw:px-8 tw:pb-8 tw:space-y-6">
                    <div className="tw:space-y-4">
                        <div className="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:rounded-lg tw:hover:bg-gray-50 tw:transition-colors tw:cursor-pointer">
                            <input
                                type="radio"
                                id="SELECTED_VISIT"
                                name="updateType"
                                className="tw:w-4 tw:h-4 tw:accent-indigo-600"
                                checked={updateType === "SELECTED_VISIT"}
                                onChange={() => setUpdateType("SELECTED_VISIT")}
                            />
                            <Label
                                htmlFor="SELECTED_VISIT"
                                className="tw:text-sm tw:font-medium tw:text-gray-700 tw:cursor-pointer"
                            >
                                This Visit {visitDate ? `(${visitDate})` : ""}
                            </Label>
                        </div>

                        <div className="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:rounded-lg tw:hover:bg-gray-50 tw:transition-colors tw:cursor-pointer">
                            <input
                                type="radio"
                                id="FUTURE_VISITS_ONLY"
                                name="updateType"
                                className="tw:w-4 tw:h-4 tw:accent-indigo-600"
                                checked={updateType === "FUTURE_VISITS_ONLY"}
                                onChange={() => setUpdateType("FUTURE_VISITS_ONLY")}
                            />
                            <Label
                                htmlFor="FUTURE_VISITS_ONLY"
                                className="tw:text-sm tw:font-medium tw:text-gray-700 tw:cursor-pointer"
                            >
                                This Visit and following Visits
                            </Label>
                        </div>

                        <div className="tw:flex tw:items-center tw:gap-3 tw:p-3 tw:rounded-lg tw:hover:bg-gray-50 tw:transition-colors tw:cursor-pointer">
                            <input
                                type="radio"
                                id="ALL_VISITS"
                                name="updateType"
                                className="tw:w-4 tw:h-4 tw:accent-indigo-600"
                                checked={updateType === "ALL_VISITS"}
                                onChange={() => setUpdateType("ALL_VISITS")}
                            />
                            <Label
                                htmlFor="ALL_VISITS"
                                className="tw:text-sm tw:font-medium tw:text-gray-700 tw:cursor-pointer"
                            >
                                All Future Visits
                            </Label>
                        </div>
                    </div>
                </div>

                <DialogFooter className="tw:px-8 tw:py-6 tw:border-t tw:border-gray-100 tw:bg-gray-50 tw:flex tw:justify-end tw:gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="tw:min-w-[100px] tw:h-10"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => onNext(updateType)}
                        className="tw:min-w-[100px] tw:h-10"
                    >
                        Next
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
