import React from 'react';
import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    Input,
    Label,
    SearchUserSelect,
    Select,
    Checkbox,
    Tooltip,
    Textarea
} from '@visitly/ui';
import { AgGridReact } from 'ag-grid-react';
import { useBulkPreRegistration } from '../hooks/use-bulk-pre-registration';
import { Upload, X, PlusCircle, HelpCircle } from 'lucide-react';
import { usePointOfEntry, useParkingLot, useDestination } from '../hooks/use-preregistration.queries';

interface BulkPreRegistrationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BulkPreRegistrationModal: React.FC<BulkPreRegistrationModalProps> = ({ isOpen, onClose }) => {
    const {
        formik,
        siteOptions,
        visitorTypeOptions,
        hostOptions,
        setHostSearch,
        coHostOptions,
        setCoHostSearch,
        vtFields,
        rowData,
        onGridReady,
        onAddRow,
        handleFileChange,
        handlePaste,
        showPasteArea,
        setShowPasteArea,
        pasteAreaValue,
        setPasteAreaValue,
        handlePreScreen,
        handleSave,
        isPreScreening,
        isSaving,
        isWatchlistHit,
        isPreScreenCheckSafe,
    } = useBulkPreRegistration();

    const { data: poeData } = usePointOfEntry(formik.values.siteId);
    const poeOptions = (poeData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || [];

    const { data: parkingData } = useParkingLot(formik.values.siteId);
    const parkingOptions = (parkingData as any)?.results?.map((p: any) => ({ label: p.name, value: p.id })) || [];

    const { data: destData } = useDestination(formik.values.siteId);
    const destOptions = (destData as any)?.results?.map((d: any) => ({ label: d.name, value: d.id })) || [];

    const columnDefs = [
        { field: 'fullName', headerName: 'Full Name', editable: true, minWidth: 150 },
        { field: 'email', headerName: 'Email', editable: true, minWidth: 180 },
        { field: 'hostEmail', headerName: 'Host Email', editable: true, minWidth: 180 },
        { field: 'companyName', headerName: 'Company Name', editable: true, minWidth: 150 },
        { field: 'phoneNumber', headerName: 'Phone Number', editable: true, minWidth: 130 },
        { field: 'scheduleCheckinDate', headerName: 'Check-in (YYYY-MM-DD HH:mm)', editable: true, minWidth: 200 },
        { field: 'scheduleCheckoutDate', headerName: 'Check-out (YYYY-MM-DD HH:mm)', editable: true, minWidth: 200 },
        { field: 'groupName', headerName: 'Group Name', editable: true, minWidth: 130 },
        { field: 'internalNote', headerName: 'Internal Note', editable: true, minWidth: 150 },
    ];

    const defaultColDef = {
        flex: 1,
        resizable: true,
        sortable: true,
        cellClassRules: {
            'tw:bg-yellow-100': (params: any) => params.data.isHighlighted,
        },
        tooltipValueGetter: (params: any) => params.data.warningTooltipMessage,
    };

    const downloadTemp = () => {
        const csv = '"fullName","email","hostEmail","companyName","phoneNumber","arrivalTime (YYYY-MM-DD HH:mm)","departureTime (YYYY-MM-DD HH:mm)","groupName","internalNote"';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Upcoming_Visitors_Template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent
                className=" tw:w-[1621px]! tw:p-0 tw:overflow-hidden tw:rounded-xl"
                onClose={onClose}
            >
                <DialogHeader className="tw:px-6 tw:py-4 tw:border-b tw:border-gray-200 tw:flex tw:flex-row tw:items-center tw:justify-between">
                    <div className="tw:flex tw:flex-col">
                        <DialogTitle className="tw:text-xl tw:font-bold tw:flex tw:items-center">
                            Bulk Pre-Registration
                            <Tooltip content="Each upload or copy can include up to 200 rows. For datasets that exceed this limit, please split the data into multiple files.">
                                <HelpCircle size={18} className="tw:ml-2 tw:text-primary-500 tw:cursor-help" />
                            </Tooltip>
                        </DialogTitle>
                        <p className="tw:text-sm tw:text-gray-500">
                            Please <span className="tw:text-primary-600 tw:cursor-pointer tw:underline" onClick={downloadTemp} data-testid="bulk-prereg-download-template-link">click here</span> to download CSV template.
                        </p>
                    </div>
                </DialogHeader>

                <div className="tw:p-6 tw:space-y-6 tw:max-h-[80vh] tw:overflow-y-auto">
                    {/* Filters Section */}
                    <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-3 tw:gap-4">
                        <div className="tw:space-y-1.5">
                            <Label className="tw:required">Location</Label>
                            <Select
                                value={formik.values.siteId}
                                options={siteOptions}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                    formik.setFieldValue('siteId', e.target.value);
                                    formik.setFieldValue('visitorTypeId', '');
                                }}
                                data-testid="bulk-prereg-location-select"
                            />
                            {formik.touched.siteId && formik.errors.siteId && (
                                <p className="tw:text-xs tw:text-red-500">{formik.errors.siteId}</p>
                            )}
                        </div>

                        <div className="tw:space-y-1.5">
                            <Label className="tw:required">Visitor Type</Label>
                            <Select
                                value={formik.values.visitorTypeId}
                                options={visitorTypeOptions}
                                disabled={!formik.values.siteId}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => formik.setFieldValue('visitorTypeId', e.target.value)}
                                data-testid="bulk-prereg-visitor-type-select"
                            />
                            {formik.touched.visitorTypeId && formik.errors.visitorTypeId && (
                                <p className="tw:text-xs tw:text-red-500">{formik.errors.visitorTypeId}</p>
                            )}
                        </div>

                        <div className="tw:space-y-1.5">
                            <Label>Host</Label>
                            <SearchUserSelect
                                options={hostOptions}
                                onSearch={setHostSearch}
                                onChange={(opt) => {
                                    const selected = Array.isArray(opt) ? opt[0] : opt;
                                    formik.setFieldValue('hostUserId', selected?.value || '');
                                    formik.setFieldValue('hostEmail', (selected as any)?.email || '');
                                }}
                                placeholder="Search Host"
                                data-testid="bulk-prereg-host-select"
                            />
                        </div>

                        <div className="tw:space-y-1.5">
                            <Label>Co-Host(s)</Label>
                            <SearchUserSelect
                                options={coHostOptions}
                                onSearch={setCoHostSearch}
                                onChange={(opt) => {
                                    const selected = Array.isArray(opt) ? opt[0] : opt;
                                    if (selected) {
                                        const current = formik.values.cohostUserIds;
                                        if (!current.includes(selected.value)) {
                                            formik.setFieldValue('cohostUserIds', [...current, selected.value]);
                                        }
                                    }
                                }}
                                placeholder="Search Co-Hosts"
                                data-testid="bulk-prereg-cohost-select"
                            />
                        </div>

                        {/* Advanced Fields */}
                        {poeOptions.length > 0 && (
                            <div className="tw:space-y-1.5">
                                <Label>Point of Entry</Label>
                                <Select
                                    value={formik.values.pointOfEntryValue}
                                    options={poeOptions}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => formik.setFieldValue('pointOfEntryValue', e.target.value)}
                                    data-testid="bulk-prereg-poe-select"
                                />
                            </div>
                        )}

                        {parkingOptions.length > 0 && (
                            <div className="tw:space-y-1.5">
                                <Label>Parking Lot</Label>
                                <Select
                                    value={formik.values.parkingLotValue}
                                    options={parkingOptions}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => formik.setFieldValue('parkingLotValue', e.target.value)}
                                    data-testid="bulk-prereg-parking-select"
                                />
                            </div>
                        )}

                        {destOptions.length > 0 && (
                            <div className="tw:space-y-1.5">
                                <Label>Destination</Label>
                                <Select
                                    value={formik.values.destinationValue}
                                    options={destOptions}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => formik.setFieldValue('destinationValue', e.target.value)}
                                    data-testid="bulk-prereg-building-select"
                                />
                            </div>
                        )}
                    </div>

                    {/* Action Row */}
                    <div className="tw:flex tw:items-center tw:justify-between tw:gap-4">
                        {/* <div className="tw:flex tw:items-center tw:gap-4">
                            <div className="tw:relative">
                                <Button variant="outline" className="tw:relative">
                                    <Upload size={18} className="tw:mr-2" />
                                    Upload CSV
                                    <Input
                                        type="file"
                                        accept=".csv"
                                        className="tw:absolute tw:inset-0 tw:opacity-0 tw:cursor-pointer"
                                        onChange={handleFileChange}
                                        disabled={!formik.values.siteId || !formik.values.visitorTypeId}
                                    />
                                </Button>
                            </div>
                            <Button variant="outline" onClick={() => setShowPasteArea(true)}>
                                Paste Data
                            </Button>
                        </div> */}

                        <div className="tw:flex tw:items-center tw:gap-6">
                            <div className="tw:flex tw:items-center tw:gap-2">
                                <Checkbox
                                    checked={formik.values.notifyHostFlag}
                                    onChange={(e: any) => formik.setFieldValue('notifyHostFlag', e.target.checked)}
                                    data-testid="bulk-prereg-notify-host-checkbox"
                                />
                                <Label htmlFor="notifyHost" className="tw:text-sm">Notify Host</Label>
                            </div>
                            <div className="tw:flex tw:items-center tw:gap-2">
                                <Checkbox
                                    checked={formik.values.notifyVisitFlag}
                                    onChange={(e: any) => formik.setFieldValue('notifyVisitFlag', e.target.checked)}
                                    data-testid="bulk-prereg-notify-visitor-checkbox"
                                />
                                <Label htmlFor="notifyVisitor" className="tw:text-sm">Notify Visitor</Label>
                            </div>
                            <div className="tw:flex tw:items-center tw:gap-2">
                                <Checkbox
                                    checked={formik.values.shouldPrefill}
                                    onChange={(e: any) => formik.setFieldValue('shouldPrefill', e.target.checked)}
                                    data-testid="bulk-prereg-prefill-checkbox"
                                />
                                <Label htmlFor="shouldPrefill" className="tw:text-sm">Allow Prefill</Label>
                            </div>
                        </div>
                    </div>

                    {/* Paste Area */}
                    {showPasteArea && (
                        <div className="tw:relative tw:bg-gray-50 tw:p-4 tw:rounded-lg tw:border tw:border-dashed tw:border-gray-300">
                            <Textarea
                                className="tw:w-full tw:h-32 tw:p-3 tw:text-sm"
                                placeholder="Press Ctrl+V or Cmd+V to paste your data here (Tab-separated)..."
                                onPaste={handlePaste}
                                autoFocus
                                data-testid="bulk-prereg-paste-textarea"
                            />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="tw:absolute tw:top-2 tw:right-2 tw:p-0 tw:w-6 tw:h-6 tw:rounded-full hover:tw:bg-gray-200"
                                onClick={() => setShowPasteArea(false)}
                                data-testid="bulk-prereg-close-paste-btn"
                            >
                                <X size={16} />
                            </Button>
                        </div>
                    )}

                    {/* Grid Area */}
                    <div className="tw:space-y-4">
                        <div className="tw:ag-theme-quartz tw:h-[400px] tw:w-full tw:border tw:border-gray-200 tw:rounded-lg tw:overflow-hidden">
                            <AgGridReact
                                rowData={rowData}
                                columnDefs={columnDefs}
                                defaultColDef={defaultColDef}
                                onGridReady={onGridReady}
                                enableRangeSelection={true}
                                undoRedoCellEditing={true}
                                rowSelection={{ mode: "multiRow" }}
                            />
                        </div>
                        <div className="tw:flex tw:justify-start">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="tw:text-primary-600 hover:tw:text-primary-700 tw:p-0"
                                onClick={onAddRow}
                                data-testid="bulk-prereg-add-row-btn"
                            >
                                <PlusCircle size={16} className="tw:mr-1" />
                                Add New Row
                            </Button>
                        </div>
                    </div>

                    {/* Feedback Messages */}
                    {isWatchlistHit && (
                        <div className="tw:bg-yellow-50 tw:border tw:border-yellow-200 tw:p-3 tw:rounded tw:text-sm tw:text-yellow-800">
                            Please review and edit the highlighted record due to a watchlist hit. Hover on the highlighted cells for details.
                        </div>
                    )}
                    {isPreScreenCheckSafe && (
                        <div className="tw:bg-green-50 tw:border tw:border-green-200 tw:p-3 tw:rounded tw:text-sm tw:text-green-800">
                            No watchlist matches found.
                        </div>
                    )}
                </div>

                <DialogFooter className="tw:px-6 tw:py-4 tw:border-t tw:bg-gray-50 tw:gap-3">
                    <Button variant="outline" onClick={onClose} disabled={isSaving || isPreScreening} data-testid="bulk-prereg-cancel-btn">
                        Cancel
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={handlePreScreen}
                        isLoading={isPreScreening}
                        disabled={isSaving || rowData.length === 0}
                        data-testid="bulk-prereg-prescreen-btn"
                    >
                        Pre-screen
                    </Button>
                    <Button
                        onClick={() => handleSave(onClose)}
                        isLoading={isSaving}
                        disabled={isPreScreening || rowData.length === 0 || !formik.isValid}
                        data-testid="bulk-prereg-save-btn"
                    >
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
