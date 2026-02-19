import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, X, Upload, Clipboard, Download } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-enterprise';
import { themeQuartz } from 'ag-grid-community';
import type { ColDef, ICellRendererParams, ValueFormatterParams, ProcessDataFromClipboardParams } from 'ag-grid-community';
import { useSites, useVisitorTypes, useHosts, useCoHosts } from '../hooks/use-preregistration.queries';
import { bulkPreRegistration, preScreenBulk, getPointOfEntry, getParkingLots, getDestinations, getVistorTypeFields } from '../api/pre-registration.api';
import { useAuthStore } from '@visitly/app-store';
import { format, addYears, isValid, isBefore, isAfter, parse } from 'date-fns';
import { HostCellEditor, HostCellRenderer, HostHeader } from '../components/HostCellComponents';
import { useEntitlements } from '../../visitor-detail/hooks/useEntitlement';
import { useQuery } from '@tanstack/react-query';
import { useToastStore } from '@visitly/app-store';
import { Button, SearchUserSelect } from '@visitly/ui';
// License key should be set ideally, but for now we might be in trial or it's set globally.

// ---------------------------------------------------------------------------
// Custom theme extending Quartz
// ---------------------------------------------------------------------------
const gridTheme = themeQuartz.withParams({
    borderRadius: 8,
    headerFontWeight: 600,
    fontSize: 13,
    rowBorder: { color: '#F3F4F6' },
    borderColor: '#E5E7EB',
    headerBackgroundColor: '#F9FAFB',
    headerFontSize: 12,
    headerTextColor: '#6B7280',
    cellHorizontalPadding: 12,
});

// ---------------------------------------------------------------------------
// Action cell renderer (trash icon)
// ---------------------------------------------------------------------------
const ActionCellRenderer: React.FC<ICellRendererParams> = (props) => {
    return (
        <button
            onClick={() => props.context.deleteRow(props.data.__id)}
            className="tw:bg-transparent tw:border-none tw:p-1 tw:rounded-md tw:text-gray-400 tw:cursor-pointer tw:flex tw:items-center tw:justify-center hover:tw:text-red-500 hover:tw:bg-red-50"
            title="Delete row"
        >
            <Trash2 size={15} />
        </button>
    );
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------
const nameRegex = /^[\p{L}\p{M}\p{Zs}.''-]+$/u;
const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,50}$/i;
const phoneRegex = /^[0-9]{6,15}$/;

interface BulkRow {
    __id: number;
    fullName: string;
    email: string;
    host: any; // Override Host object or string from CSV
    companyName: string; // Company
    phoneNumber: string; // Phone No.
    checkinDate: Date | null;
    checkoutDate: Date | null;
    groupName: string;
    internalNote: string;
    isHighlighted?: boolean;
    warningTooltipMessage?: string;
}

function isRowNonEmpty(row: BulkRow) {
    return !!(row.fullName?.trim() || row.email?.trim() || row.phoneNumber?.trim() ||
        row.companyName?.trim() || row.checkinDate ||
        row.checkoutDate ||
        row.host || row.groupName?.trim() || row.internalNote?.trim());
}

function validateRow(row: BulkRow) {
    if (!isRowNonEmpty(row)) return [];

    const errors: string[] = [];
    const now = new Date();
    const maxDate = addYears(now, 5);

    // Full Name
    if (!row.fullName?.trim()) {
        errors.push('Full Name is required');
    } else if (!nameRegex.test(row.fullName.trim())) {
        errors.push('Full Name format invalid');
    }

    // Email
    if (row.email?.trim() && !emailRegex.test(row.email.trim())) {
        errors.push('Invalid email format');
    }

    // Phone
    if (row.phoneNumber?.trim() && !phoneRegex.test(row.phoneNumber.trim())) {
        errors.push('Invalid phone format');
    }

    // Check In Date & Time
    if (!row.checkinDate) {
        errors.push('Check In Date is required');
    } else {
        if (!isValid(row.checkinDate)) {
            errors.push('Check In Date format invalid');
        } else {
            if (isBefore(row.checkinDate, now)) {
                errors.push('Check In must be in the future');
            } else if (isAfter(row.checkinDate, maxDate)) {
                errors.push('Check In must be within 5 years');
            }
        }
    }

    // Checkout Date & Time
    if (row.checkoutDate) {
        if (!isValid(row.checkoutDate)) {
            errors.push('Checkout Date format invalid');
        } else {
            if (isBefore(row.checkoutDate, now)) {
                errors.push('Checkout must be in the future');
            } else if (isAfter(row.checkoutDate, maxDate)) {
                errors.push('Checkout must be within 5 years');
            }

            // Logical check
            if (row.checkinDate && isValid(row.checkinDate)) {
                if (isBefore(row.checkoutDate, row.checkinDate)) {
                    errors.push('Checkout must be after Check In');
                }
            }
        }
    }

    return errors;
}

// Cell style for required fields — red highlight when empty on a non-empty row
function requiredCellStyle(params: any) {
    const row = params.data;
    if (!isRowNonEmpty(row)) return null;
    const val = params.value;
    if (val === null || val === undefined || (typeof val === 'string' && !val.trim())) {
        return { borderLeft: '3px solid #EF4444', background: '#FEF2F2' };
    }
    return null;
}

// Cell style for email — red if invalid format
function emailCellStyle(params: any) {
    const val = params.value;
    if (val && val.trim() && !emailRegex.test(val.trim())) {
        return { borderLeft: '3px solid #F59E0B', background: '#FFFBEB' };
    }
    return null;
}

// Cell style for phone — red if invalid characters
function phoneCellStyle(params: any) {
    const val = params.value;
    if (val && val.trim() && !phoneRegex.test(val.trim())) {
        return { borderLeft: '3px solid #F59E0B', background: '#FFFBEB' };
    }
    return null;
}

// Cell style for dates — red if invalid format
function dateCellStyle(params: any) {
    const row = params.data;
    if (!isRowNonEmpty(row)) return null;

    const val = params.value;
    if (!isRowNonEmpty(row)) return null;

    // Required field check (only for check-in)
    if (params.colDef.field === 'checkinDate') {
        if (!val) {
            return { borderLeft: '3px solid #EF4444', background: '#FEF2F2' };
        }
    }

    // Format check
    if (val && !isValid(new Date(val))) {
        return { borderLeft: '3px solid #F59E0B', background: '#FFFBEB' };
    }

    return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
let rowIdCounter = 0;
function makeEmptyRow(): BulkRow {
    return {
        __id: Math.random(),
        fullName: '',
        email: '',
        host: null,
        companyName: '',
        phoneNumber: '',
        checkinDate: null,
        checkoutDate: null,
        groupName: '',
        internalNote: '',
    };
}

function makeInitialRows(count = 1): BulkRow[] {
    return Array.from({ length: count }, makeEmptyRow);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const BulkPreRegistration: React.FC = () => {
    const navigate = useNavigate();
    const gridRef = useRef<any>(null);
    const { user } = useAuthStore();
    const toast = useToastStore((s) => s.showToast)

    const { isAdvancedMegaLocationEntitled, isPreScreenCheckEntitled, isBulkPreRegCSVUploadEntitled, isCoHostsEntitled } = useEntitlements();

    // Hooks for data
    const { data: sites } = useSites();
    const siteOptions = sites?.results || [];

    // Common settings
    const [siteId, setSiteId] = useState('');
    const { data: visitorTypes } = useVisitorTypes(siteId);
    const visitorTypeOptions = visitorTypes?.results || [];

    const [visitorTypeId, setVisitorTypeId] = useState('');

    // Advanced Location States
    const { data: poeData } = useQuery({
        queryKey: ['poe', siteId],
        queryFn: () => getPointOfEntry(siteId),
        enabled: !!siteId && isAdvancedMegaLocationEntitled
    });
    const { data: parkingData } = useQuery({
        queryKey: ['parking', siteId],
        queryFn: () => getParkingLots(siteId),
        enabled: !!siteId && isAdvancedMegaLocationEntitled
    });
    const { data: buildingData } = useQuery({
        queryKey: ['buildings', siteId],
        queryFn: () => getDestinations(siteId),
        enabled: !!siteId && isAdvancedMegaLocationEntitled
    });

    const [poeId, setPoeId] = useState('');
    const [parkingLotId, setParkingLotId] = useState('');
    const [buildingId, setBuildingId] = useState('');

    const { data: vtConfig } = useQuery({
        queryKey: ['vtConfig', visitorTypeId],
        queryFn: () => getVistorTypeFields(visitorTypeId),
        enabled: !!visitorTypeId
    });

    const [host, setHost] = useState<{ name: string; email: string; id: string } | null>(
        user ? { name: `${user.firstName} ${user.lastName}`, email: user.email, id: user.id } : null
    );

    // Host Search
    const [hostSearch, setHostSearch] = useState('');
    const { data: hostsData } = useHosts(hostSearch, siteId);

    const [coHosts, setCoHosts] = useState<{ name: string; email: string; id: string }[]>([]);
    const [coHostSearch, setCoHostSearch] = useState('');
    const { data: coHostsData } = useCoHosts(coHostSearch, siteId);


    // Notifications
    const [notifyHost, setNotifyHost] = useState(true);
    const [notifyVisitor, setNotifyVisitor] = useState(true);
    const [allowPrefill, setAllowPrefill] = useState(true);

    // Grid data
    const [rowData, setRowData] = useState<BulkRow[]>(makeInitialRows);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreScreening, setIsPreScreening] = useState(false);
    const [isWatchlistHit, setIsWatchlistHit] = useState(false);
    const [isPreScreenCheckSafe, setIsPreScreenCheckSafe] = useState(false);

    // track times rows had a host set so we can ignore immediate null
    const hostSetTimestamps = useRef<Record<string, number>>({});

    // Grid context for action renderer
    const gridContext = useMemo(() => ({
        deleteRow: (id: number) => {
            setRowData(prev => prev.filter(r => r.__id !== id));
        },
        clearHost: (node: any) => {
            node.setDataValue('host', null);
            setRowData(prev =>
                prev.map(r => r.__id === node.data.__id ? { ...r, host: null } : r)
            );
            hostSetTimestamps.current[String(node.data.__id)] = 0;
        },
    }), []);

    // Column definitions
    const columnDefs: ColDef[] = useMemo(() => [
        {
            headerName: 'Full Name *',
            field: 'fullName',
            editable: true,
            flex: 1.2,
            minWidth: 150,
            cellClassRules: {
                'tw:bg-red-50': (params) => !params.value || params.value.trim() === '' || !nameRegex.test(params.value),
            },
            tooltipValueGetter: (params) => {
                if (!params.value || params.value.trim() === '') return 'Full Name cannot be empty';
                if (!nameRegex.test(params.value)) return 'Please enter a valid name';
                return null;
            }
        },
        {
            headerName: 'Email',
            field: 'email',
            editable: true,
            flex: 1.2,
            minWidth: 170,
            cellClassRules: {
                'tw:bg-red-50': (params) => params.value && !emailRegex.test(params.value),
            },
            tooltipValueGetter: (params) => {
                if (params.value && !emailRegex.test(params.value)) {
                    return 'Please enter a valid email address (e.g., user@example.com)';
                }
                return null;
            },
        },
        {
            headerName: 'Override Host',
            field: 'host',
            editable: true,
            flex: 1.5,
            minWidth: 180,
            cellEditor: HostCellEditor,
            cellRenderer: HostCellRenderer,
            headerComponent: HostHeader,
            valueSetter: (params) => {
                if (params.newValue === null) return false;
                params.data.host = params.newValue;
                return true;
            },
        },
        {
            headerName: 'Company',
            field: 'companyName',
            editable: true,
            flex: 1,
            minWidth: 120,
        },
        {
            headerName: 'Phone No.',
            field: 'phoneNumber',
            editable: true,
            flex: 1,
            minWidth: 120,
            cellClassRules: {
                'tw:bg-red-50': (params) => params.value && !phoneRegex.test(params.value),
            },
            tooltipValueGetter: (params) => {
                if (params.value && !phoneRegex.test(params.value)) {
                    return 'Phone Number must be numeric and between 6 to 15 digits';
                }
                return null;
            },
        },
        {
            headerName: 'Schedule Check In Date *',
            field: 'checkinDate',
            editable: true,
            flex: 1.5,
            minWidth: 190,
            cellEditor: 'agDateCellEditor',
            cellEditorParams: {
                default: new Date(),
                includeTime: true,
                step: 60
            },
            cellClassRules: {
                'tw:bg-red-50': (params) => {
                    if (!params.value) return true;
                    const d = params.value instanceof Date ? params.value : new Date(params.value);
                    const now = new Date();
                    const maxDate = addYears(now, 5);
                    return !isValid(d) || isBefore(d, now) || isAfter(d, maxDate);
                },
            },
            tooltipValueGetter: (params) => {
                if (!params.value) return 'Schedule Check-In Date cannot be empty';
                const d = params.value instanceof Date ? params.value : new Date(params.value);
                const now = new Date();
                const maxDate = addYears(now, 5);
                if (!isValid(d)) return 'Invalid Check-In Date format';
                if (isBefore(d, now)) {
                    return `Check-In Date must be after current time (${format(now, 'dd MMM yy hh:mm a')})`;
                }
                if (isAfter(d, maxDate)) {
                    return `Check-In Date cannot be more than 5 years from now (${format(now, 'dd MMM yy hh:mm a')})`;
                }
                return null;
            },
            valueFormatter: (params) => {
                if (!params.value) return '';
                const d = params.value instanceof Date ? params.value : new Date(params.value);
                return isValid(d) ? format(d, 'dd MMM yy hh:mm a') : String(params.value);
            },
            valueParser: (params) => {
                if (!params.newValue) return null;
                const d = new Date(params.newValue);
                return isValid(d) ? d : null;
            },
        },
        {
            headerName: 'Schedule Checkout Date',
            field: 'checkoutDate',
            editable: true,
            flex: 1.5,
            minWidth: 190,
            cellEditor: 'agDateCellEditor',
            cellEditorParams: {
                default: new Date(),
                includeTime: true,
                step: 60
            },
            cellClassRules: {
                'tw:bg-red-50': (params) => {
                    if (!params.value) return false;
                    const d = params.value instanceof Date ? params.value : new Date(params.value);
                    const now = new Date();
                    const maxDate = addYears(now, 5);
                    if (!isValid(d) || isBefore(d, now) || isAfter(d, maxDate)) return true;

                    const checkin = params.data.checkinDate;
                    if (checkin && isValid(new Date(checkin)) && isBefore(d, new Date(checkin))) return true;
                    return false;
                },
            },
            tooltipValueGetter: (params) => {
                if (!params.value) return null;
                const d = params.value instanceof Date ? params.value : new Date(params.value);
                const now = new Date();
                const maxDate = addYears(now, 5);
                if (!isValid(d)) return 'Invalid Checkout Date format';
                if (isBefore(d, now)) {
                    return `Checkout Date must be after current time (${format(now, 'dd MMM yy hh:mm a')})`;
                }
                if (isAfter(d, maxDate)) {
                    return `Checkout Date cannot be more than 5 years from now (${format(now, 'dd MMM yy hh:mm a')})`;
                }
                const checkin = params.data.checkinDate;
                if (checkin && isValid(new Date(checkin)) && isBefore(d, new Date(checkin))) {
                    return `Checkout Date must be after Check-In Date (${format(new Date(checkin), 'dd MMM yy hh:mm a')})`;
                }
                return null;
            },
            valueFormatter: (params) => {
                if (!params.value) return '';
                const d = params.value instanceof Date ? params.value : new Date(params.value);
                return isValid(d) ? format(d, 'dd MMM yy hh:mm a') : String(params.value);
            },
            valueParser: (params) => {
                if (!params.newValue) return null;
                const d = new Date(params.newValue);
                return isValid(d) ? d : null;
            },
        },
        {
            headerName: 'Group Name',
            field: 'groupName',
            editable: true,
            flex: 1,
            minWidth: 120,
        },
        {
            headerName: 'Internal Note',
            field: 'internalNote',
            editable: true,
            flex: 1.2,
            minWidth: 130,
        },
        {
            headerName: 'Actions',
            field: '__actions',
            width: 80,
            cellRenderer: ActionCellRenderer,
            editable: false,
            sortable: false,
            filter: false,
            suppressHeaderMenuButton: true,
        },
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: false,
        filter: false,
        resizable: true,
        suppressMovable: true,
        enableBrowserTooltips: true,
    }), []);

    const addRow = useCallback(() => {
        const currentCount = gridRef.current?.api.getDisplayedRowCount() || 0;
        if (currentCount >= 200) {
            toast({ message: 'Bulk Pre Registration has a limit of 200.', type: 'error' });
            return;
        }

        setRowData(prev => [...prev, makeEmptyRow()]);
        // Scroll grid to bottom after adding
        setTimeout(() => {
            if (gridRef.current?.api) {
                const api = gridRef.current.api;
                api.ensureIndexVisible(api.getDisplayedRowCount() - 1, 'bottom');
            }
        }, 50);
    }, [toast]);

    const processDataFromClipboard = useCallback((params: ProcessDataFromClipboardParams): string[][] | null => {
        let data = [...params.data];
        const currentCount = gridRef.current?.api.getDisplayedRowCount() || 0;

        // When pasting, ag-grid gives us already-split rows. We convert them back to BulkRow objects
        // and add them to the grid. This matches how CSV upload works.
        
        const newRows: BulkRow[] = [];
        data.forEach(row => {
            if (!row || row.length === 0) return;
            if (row.every(cell => !cell || cell.trim() === '')) return; // Skip completely empty rows
            
            const r = makeEmptyRow();
            r.fullName = row[0]?.trim().replace(/^"|"$/g, '') || '';
            r.email = row[1]?.trim().replace(/^"|"$/g, '') || '';
            r.host = row[2]?.trim().replace(/^"|"$/g, '') || '';
            r.companyName = row[3]?.trim().replace(/^"|"$/g, '') || '';
            r.phoneNumber = row[4]?.trim().replace(/^"|"$/g, '') || '';

            // Parse check-in date
            const checkinDateStr = row[5]?.trim().replace(/^"|"$/g, '') || '';
            if (checkinDateStr) {
                let d = new Date(checkinDateStr);
                if (!isValid(d)) {
                    d = parse(checkinDateStr, 'dd MMM yy hh:mm a', new Date());
                }
                if (isValid(d)) {
                    r.checkinDate = d;
                }
            }

            // Parse checkout date
            const checkoutDateStr = row[6]?.trim().replace(/^"|"$/g, '') || '';
            if (checkoutDateStr) {
                let d = new Date(checkoutDateStr);
                if (!isValid(d)) {
                    d = parse(checkoutDateStr, 'dd MMM yy hh:mm a', new Date());
                }
                if (isValid(d)) {
                    r.checkoutDate = d;
                }
            }

            r.groupName = row[7]?.trim().replace(/^"|"$/g, '') || '';
            r.internalNote = row[8]?.trim().replace(/^"|"$/g, '') || '';
            newRows.push(r);
        });

        if (newRows.length + currentCount > 200) {
            toast({ message: 'Bulk Pre Registration has a limit of 200.', type: 'error' });
            return null;
        }

        // Add the new rows to grid state
        setRowData(prev => {
            const keptRows = prev.filter(p => isRowNonEmpty(p));
            const combined = [...keptRows, ...newRows];
            if (combined.length > 200) {
                combined.splice(200);
            }
            return combined;
        });

        // Return empty array so ag-grid doesn't double-populate
        return [];
    }, [toast]);

    const handleCellValueChanged = useCallback((event: any) => {

        const field = event.colDef.field;
        const prevRows = rowData; // capture current state for comparison
        const prevRow = prevRows.find(r => r.__id === event.data.__id);

        // special handling for host column
        if (field === 'host') {
            // if a null commit occurs after we already set a host, ignore it
            if (event.newValue === null && prevRow && prevRow.host != null) {
                return;
            }
            // ensure event.data.host contains the new value so state update keeps it
            if (event.newValue !== null) {
                event.data.host = event.newValue;
            }
        }

        setRowData(prev =>
            prev.map(r => r.__id === event.data.__id ? { ...event.data } : r)
        );
        setValidationErrors([]);
    }, [rowData]);

    const getRowId = useCallback((params: any) => String(params.data.__id), []);

    // Prepare options for SearchUserSelect
    const hostOptions = useMemo(() => {
        return hostsData?.results?.map((u: any) => ({
            label: `${u.firstName} ${u.lastName}`,
            value: u.id,
            email: u.email
        })) || [];
    }, [hostsData]);

    const coHostOptions = useMemo(() => {
        return coHostsData?.results?.map((u: any) => ({
            label: `${u.firstName} ${u.lastName}`,
            value: u.id,
            email: u.email
        })) || [];
    }, [coHostsData]);

    const preparePayload = (validRows: BulkRow[]) => {
        return validRows.map(row => {
            const formatISO = (date: Date | null) => {
                if (!date || !isValid(date)) return null;
                // Format to YYYY-MM-DDTHH:mm:ss for backend compatibility
                return format(date, "yyyy-MM-dd'T'HH:mm:ss");
            };

            return {
                fullName: row.fullName,
                email: row.email || null,
                companyName: row.companyName || null,
                phoneNumber: row.phoneNumber || null,
                scheduleCheckinDate: formatISO(row.checkinDate),
                scheduleCheckoutDate: formatISO(row.checkoutDate),
                groupName: row.groupName || null,
                internalNote: row.internalNote || null,
                hostEmail: typeof row.host === 'string' ? row.host : (row.host?.email || null),

                // Common settings
                hostUserId: row.host?.id ?? (host?.id || null),
                siteId: siteId,
                shouldPrefill: !!allowPrefill,
                visitorTypeId: visitorTypeId,
                notifyHostFlag: String(!!notifyHost),
                notifyVisitFlag: String(!!notifyVisitor),
                cohostUserIds: coHosts.map(c => c.id),
                orgId: user?.orgId,

                // Advanced Locations
                poeId: poeId || null,
                parkingLotId: parkingLotId || null,
                buildingId: buildingId || null,
            };
        });
    };

    const runValidation = () => {
        // Validate common settings
        const settingsErrors: string[] = [];
        if (!siteId) settingsErrors.push('Location is required');
        if (!visitorTypeId) settingsErrors.push('Visitor Type is required');

        // Advanced Location Validation based on VT Config
        if (vtConfig) {
            const hasField = (name: string) => vtConfig.fields?.find(f => f.name === name);

            const poeField = hasField('Point of Entry');
            if (poeField?.isMandatoryForPreregistration && !poeId) {
                settingsErrors.push('Point of Entry is required');
            }

            const parkingField = hasField('Parking Lot');
            if (parkingField?.isMandatoryForPreregistration && !parkingLotId) {
                settingsErrors.push('Parking Lot is required');
            }

            const buildingField = hasField('Building');
            if (buildingField?.isMandatoryForPreregistration && !buildingId) {
                settingsErrors.push('Building is required');
            }
        }

        // Validate grid rows
        const filledRows = rowData.filter(isRowNonEmpty);
        if (filledRows.length === 0) {
            setValidationErrors([...settingsErrors, 'Please add at least one visitor.']);
            return null;
        }

        const rowErrors: string[] = [];
        filledRows.forEach((row, idx) => {
            const errs = validateRow(row);
            errs.forEach(e => rowErrors.push(`Row ${idx + 1}: ${e}`));
        });

        const allErrors = [...settingsErrors, ...rowErrors];
        setValidationErrors(allErrors);

        if (allErrors.length > 0) {
            // Refresh grid to show validation styles
            if (gridRef.current?.api) gridRef.current.api.refreshCells({ force: true });
            return null;
        }
        return filledRows;
    };

    const handlePreScreen = async () => {
        const validRows = runValidation();
        if (!validRows) return;

        setIsPreScreening(true);
        setIsWatchlistHit(false);
        setIsPreScreenCheckSafe(false);

        try {
            const payload = preparePayload(validRows);
            const response = await preScreenBulk(payload);
            let allSafe = true;

            // Map response back to rows to highlight hits
            const hitIndices = new Set<number>();
            response.forEach((res: any, index: number) => {
                if (res.visitStatus && res.visitStatus !== 'safe') {
                    allSafe = false;
                    hitIndices.add(index);
                }
            });

            if (!allSafe) {
                // We need to map the "index" from response back to our "filledRows".
                // And then map those "filledRows" back to the full `rowData` by ID to update them.
                const newRowData = [...rowData];
                validRows.forEach((vRow, idx) => {
                    if (hitIndices.has(idx)) {
                        const realIndex = newRowData.findIndex(r => r.__id === vRow.__id);
                        if (realIndex !== -1) {
                            newRowData[realIndex] = {
                                ...newRowData[realIndex],
                                isHighlighted: true,
                                warningTooltipMessage: `Watchlist hit`
                            } as BulkRow;
                        }
                    }
                });
                setRowData(newRowData);
                setIsWatchlistHit(true);
            } else {
                setIsPreScreenCheckSafe(true);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsPreScreening(false);
        }
    };

    const handleSave = async () => {
        const validRows = runValidation();
        if (!validRows) return;

        setIsSaving(true);
        try {
            const payload = preparePayload(validRows);
            await bulkPreRegistration(payload);
            navigate('/host/upcoming-visitors');
            toast({ message: 'Bulk preregistration completed successfully!' })
        } catch (error) {
        } finally {
            setIsSaving(false);
        }
    };

    const downloadTemp = () => {
        const csv = '"fullName","email","hostEmail","companyName","phoneNumber","scheduleCheckinDate (DD MMM YY hh:mm AM/PM)","scheduleCheckoutDate (DD MMM YY hh:mm AM/PM)","groupName","internalNote"';
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Upcoming_Visitors_Template.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // File Handling
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const csv = event.target?.result as string;
            const allLines = csv.split(/\r\n|\n/).filter(line => line.trim() !== '');
            const lines = allLines.slice(1); // Skip header

            if (lines.length > 200) {
                toast({ message: 'Bulk Pre Registration has a limit of 200.', type: 'error' });
                return;
            }

            const newRows: BulkRow[] = [];
            lines.forEach(line => {
                const cols = line.split(',');
                if (cols.length > 1) {
                    const r = makeEmptyRow();
                    r.fullName = cols[0]?.replace(/"/g, '') || '';
                    r.email = cols[1]?.replace(/"/g, '') || '';
                    r.host = cols[2]?.replace(/"/g, '') || '';
                    r.companyName = cols[3]?.replace(/"/g, '') || '';
                    r.phoneNumber = cols[4]?.replace(/"/g, '') || '';

                    // Checkin Date/Time (Combined)
                    const checkinRaw = cols[5]?.replace(/"/g, '').trim() || '';
                    if (checkinRaw) {
                        const d = new Date(checkinRaw);
                        if (isValid(d)) {
                            r.checkinDate = d;
                        } else {
                            // Try parsing specific format if generic fails
                            const parsed = parse(checkinRaw, 'dd MMM yy hh:mm a', new Date());
                            if (isValid(parsed)) r.checkinDate = parsed;
                        }
                    }

                    // Checkout Date/Time (Combined)
                    const checkoutRaw = cols[6]?.replace(/"/g, '').trim() || '';
                    if (checkoutRaw) {
                        const d = new Date(checkoutRaw);
                        if (isValid(d)) {
                            r.checkoutDate = d;
                        } else {
                            const parsed = parse(checkoutRaw, 'dd MMM yy hh:mm a', new Date());
                            if (isValid(parsed)) r.checkoutDate = parsed;
                        }
                    }

                    r.groupName = cols[7]?.replace(/"/g, '') || '';
                    r.internalNote = cols[8]?.replace(/"/g, '') || '';
                    newRows.push(r);
                }
            });

            setRowData(prev => {
                const keptRows = prev.filter(p => isRowNonEmpty(p));
                // If total exceeds 200 after merge, we might want to trim or alert.
                // Assuming we just append but limit the total to 200 is safer.
                const combined = [...keptRows, ...newRows];
                if (combined.length > 200) {
                    toast({ message: 'Bulk Pre Registration has a limit of 200 records. Only the first 200 were kept.', type: 'warning' });
                    return combined.slice(0, 200);
                }
                return combined;
            });
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    // Chip renderer
    const renderChip = (label: string, active: boolean, onClick: () => void) => (
        <button
            type="button"
            onClick={onClick}
            className={`tw:inline-flex tw:items-center tw:gap-1.5 tw:px-3.5 tw:py-2 tw:rounded-full tw:text-[13px] tw:font-medium tw:border-[1.5px] tw:cursor-pointer tw:transition-all ${active
                ? 'tw:border-primary-500 tw:bg-primary-50 tw:text-primary-600'
                : 'tw:border-gray-200 tw:bg-white tw:text-gray-600'
                }`}
        >
            {active && (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            )}
            {label}
        </button>
    );

    const selectStyle = {
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m2 4 4 4 4-4'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 10px center',
    } as React.CSSProperties;

    return (
        <div className="tw:flex tw:flex-col tw:h-screen tw:bg-white tw:font-sans">
            {/* ================================================================ */}
            {/* Header Bar                                                       */}
            {/* ================================================================ */}
            <div className="tw:flex tw:items-center tw:justify-between tw:px-6 tw:py-4 tw:border-b tw:border-gray-200 tw:flex-shrink-0">
                <div className="tw:flex tw:items-center tw:gap-3">
                    <button
                        onClick={() => navigate('/host/upcoming-visitors')}
                        className="tw:bg-transparent tw:border-none tw:p-1.5 tw:rounded-lg tw:text-gray-500 tw:cursor-pointer tw:flex tw:items-center tw:transition-colors hover:tw:bg-gray-100"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="tw:text-xl tw:font-semibold tw:text-gray-900 tw:m-0">
                            Bulk Pre-Registration
                        </h1>
                        {isBulkPreRegCSVUploadEntitled && <p className="tw:text-xs tw:text-gray-500 tw:mt-1 tw:cursor-pointer hover:tw:text-primary-600 hover:tw:underline" onClick={downloadTemp}>
                            click <span className='tw:underline tw:text-blue-700'>here</span> to download upload CSV template.
                        </p>}
                    </div>
                </div>

                <div className="tw:flex tw:gap-3">
                    {isBulkPreRegCSVUploadEntitled && <div className="tw:relative">
                        <input
                            type="file"
                            accept=".csv"
                            className="tw:absolute tw:inset-0 tw:opacity-0 tw:cursor-pointer"
                            onChange={handleFileChange}
                            disabled={!siteId}
                        />
                        <button className="tw:px-4 tw:py-2.5 tw:bg-white tw:text-gray-700 tw:border tw:border-gray-300 tw:rounded-[10px] tw:text-sm tw:font-medium tw:cursor-pointer hover:tw:bg-gray-50 tw:flex tw:items-center tw:gap-2">
                            <Upload size={16} /> Upload CSV
                        </button>
                    </div>
                    }
                    {isPreScreenCheckEntitled && <button
                        onClick={handlePreScreen}
                        disabled={isPreScreening || isSaving}
                        className="tw:px-4 tw:py-2.5 tw:bg-white tw:text-gray-700 tw:border tw:border-gray-300 tw:rounded-[10px] tw:text-sm tw:font-medium tw:cursor-pointer hover:tw:bg-gray-50"
                    >
                        {isPreScreening ? 'Checking...' : 'Pre-screen'}
                    </button>}

                    <Button
                        onClick={handleSave}
                        variant='primary'
                        disabled={isSaving || isPreScreening}
                        className="tw:cursor-pointer"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>

            {/* ================================================================ */}
            {/* Scrollable content area                                          */}
            {/* ================================================================ */}
            <div className="tw:flex-1 tw:overflow-auto tw:p-6 tw:flex tw:flex-col tw:gap-5 tw:min-h-0">

                {/* ---- Common Settings Card ---- */}
                <div className="tw:bg-gray-50 tw:border tw:border-gray-100 tw:rounded-[14px] tw:p-6">
                    <div className="tw:flex tw:flex-wrap tw:gap-4 tw:items-start">
                        {/* Location */}
                        <div className="tw:flex tw:flex-col tw:gap-1">
                            <label className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wide">
                                Location <span className="tw:text-red-500">*</span>
                            </label>
                            <select
                                value={siteId}
                                onChange={(e) => setSiteId(e.target.value)}
                                className="tw:appearance-none tw:px-3 tw:py-2 tw:pr-8 tw:text-[13px] tw:font-medium tw:rounded-lg tw:border tw:border-gray-200 tw:bg-white tw:text-gray-700 tw:outline-none tw:min-w-[180px] focus:tw:ring-2 focus:tw:ring-primary-500/20 focus:tw:border-primary-500"
                                style={{ ...selectStyle, borderColor: !siteId ? '#FCA5A5' : '' }}
                            >
                                <option value="">Select location</option>
                                {siteOptions.map((s: any) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Visitor Type */}
                        <div className="tw:flex tw:flex-col tw:gap-1">
                            <label className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wide">
                                Visitor Type <span className="tw:text-red-500">*</span>
                            </label>
                            <select
                                value={visitorTypeId}
                                onChange={(e) => setVisitorTypeId(e.target.value)}
                                disabled={!siteId}
                                className="tw:appearance-none tw:px-3 tw:py-2 tw:pr-8 tw:text-[13px] tw:font-medium tw:rounded-lg tw:border tw:border-gray-200 tw:bg-white tw:text-gray-700 tw:outline-none tw:min-w-[180px] focus:tw:ring-2 focus:tw:ring-primary-500/20 focus:tw:border-primary-500"
                                style={{ ...selectStyle, borderColor: !visitorTypeId ? '#FCA5A5' : '' }}
                            >
                                <option value="">Select type</option>
                                {visitorTypeOptions.map((t: any) => (
                                    <option key={t.id} value={t.id}>{t.visitorType}</option>
                                ))}
                            </select>
                        </div>



                        {/* Host */}
                        <div className="tw:flex tw:flex-col tw:gap-1 tw:min-w-[240px]">
                            <label className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wide">
                                Host
                            </label>
                            <SearchUserSelect
                                options={hostOptions}
                                onSearch={setHostSearch}
                                value={host ? [{ label: host.name, value: host.id, email: host.email }] : []}
                                onChange={(opt: any) => {
                                    const selected = Array.isArray(opt) ? opt[0] : opt;
                                    setHost(selected ? { name: selected.label, email: selected.email, id: selected.value } : null);
                                }}
                                placeholder="Search host..."
                            />
                        </div>

                        {/* Co-Hosts */}
                        {isCoHostsEntitled && <div className="tw:flex tw:flex-col tw:gap-1 tw:min-w-[300px]">
                            <label className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wide">
                                Co-Host(s)
                            </label>
                            <SearchUserSelect
                                multi
                                options={coHostOptions}
                                onSearch={setCoHostSearch}
                                value={coHosts.map(c => ({ label: c.name, value: c.id, email: c.email }))}
                                onChange={(opts: any) => {
                                    setCoHosts(opts.map((o: any) => ({ name: o.label, email: o.email, id: o.value })));
                                }}
                                placeholder="Search co-hosts..."
                            />
                        </div>}

                        {/* Point of Entry (Advanced) */}
                        {isAdvancedMegaLocationEntitled && (
                            <div className="tw:flex tw:flex-col tw:gap-1">
                                <label className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wide">
                                    Point of Entry {vtConfig?.fields?.find(f => f.name === 'Point of Entry')?.isMandatoryForPreregistration && <span className="tw:text-red-500">*</span>}
                                </label>
                                <select
                                    value={poeId}
                                    onChange={(e) => setPoeId(e.target.value)}
                                    disabled={!siteId || !poeData}
                                    className="tw:appearance-none tw:px-3 tw:py-2 tw:pr-8 tw:text-[13px] tw:font-medium tw:rounded-lg tw:border tw:border-gray-200 tw:bg-white tw:text-gray-700 tw:outline-none tw:min-w-[180px] focus:tw:ring-2 focus:tw:ring-primary-500/20 focus:tw:border-primary-500"
                                    style={selectStyle}
                                >
                                    <option value="">Select point of entry</option>
                                    {(Array.isArray(poeData) ? poeData : (poeData as any)?.results || [])?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Parking Lot (Advanced) */}
                        {isAdvancedMegaLocationEntitled && (
                            <div className="tw:flex tw:flex-col tw:gap-1">
                                <label className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wide">
                                    Parking Lot {vtConfig?.fields?.find(f => f.name === 'Parking Lot')?.isMandatoryForPreregistration && <span className="tw:text-red-500">*</span>}
                                </label>
                                <select
                                    value={parkingLotId}
                                    onChange={(e) => setParkingLotId(e.target.value)}
                                    disabled={!siteId || !parkingData}
                                    className="tw:appearance-none tw:px-3 tw:py-2 tw:pr-8 tw:text-[13px] tw:font-medium tw:rounded-lg tw:border tw:border-gray-200 tw:bg-white tw:text-gray-700 tw:outline-none tw:min-w-[180px] focus:tw:ring-2 focus:tw:ring-primary-500/20 focus:tw:border-primary-500"
                                    style={selectStyle}
                                >
                                    <option value="">Select parking lot</option>
                                    {(Array.isArray(parkingData) ? parkingData : (parkingData as any)?.results || [])?.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Building (Advanced) */}
                        {isAdvancedMegaLocationEntitled && (
                            <div className="tw:flex tw:flex-col tw:gap-1">
                                <label className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wide">
                                    Building {vtConfig?.fields?.find(f => f.name === 'Building')?.isMandatoryForPreregistration && <span className="tw:text-red-500">*</span>}
                                </label>
                                <select
                                    value={buildingId}
                                    onChange={(e) => setBuildingId(e.target.value)}
                                    disabled={!siteId || !buildingData}
                                    className="tw:appearance-none tw:px-3 tw:py-2 tw:pr-8 tw:text-[13px] tw:font-medium tw:rounded-lg tw:border tw:border-gray-200 tw:bg-white tw:text-gray-700 tw:outline-none tw:min-w-[180px] focus:tw:ring-2 focus:tw:ring-primary-500/20 focus:tw:border-primary-500"
                                    style={selectStyle}
                                >
                                    <option value="">Select building</option>
                                    {(Array.isArray(buildingData) ? buildingData : (buildingData as any)?.results || [])?.map((b: any) => (
                                        <option key={b.id} value={b.id}>{b.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>

                    {/* Notification & Prefill chips */}
                    <div className="tw:flex tw:items-center tw:gap-2.5 tw:mt-4 tw:pt-4 tw:border-t tw:border-gray-200">
                        <span className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wide tw:mr-1">
                            Settings
                        </span>
                        {renderChip('Notify Host', notifyHost, () => setNotifyHost(v => !v))}
                        {renderChip('Notify Visitor', notifyVisitor, () => setNotifyVisitor(v => !v))}
                        {renderChip('Allow Prefill', allowPrefill, () => setAllowPrefill(v => !v))}
                    </div>
                </div>

                {/* ---- Watchlist Warning ---- */}
                {isWatchlistHit && (
                    <div className="tw:p-4 tw:bg-amber-50 tw:border tw:border-amber-200 tw:rounded-[10px] tw:flex tw:items-start tw:gap-3">
                        <div className="tw:flex-shrink-0 tw:mt-0.5">
                            <img src="/assets/images/vl-status-under-review.svg" height="15px" alt="Warning" className="tw:h-4 tw:w-4" />
                        </div>
                        <p className="tw:text-[13px] tw:text-amber-800 tw:m-0">
                            Please review and edit the highlighted record due to a watchlist hit. Hover on the icon for the details, click "Save" to proceed, or "X" to cancel.
                        </p>
                        <button
                            onClick={() => setIsWatchlistHit(false)}
                            className="tw:ml-auto tw:bg-transparent tw:border-none tw:p-0.5 tw:text-amber-800 tw:cursor-pointer hover:tw:text-amber-900"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {isPreScreenCheckSafe && (
                    <div className="tw:p-3 tw:bg-green-50 tw:border tw:border-green-200 tw:rounded-[10px]">
                        <p className="tw:text-[13px] tw:text-green-800 tw:m-0">No watchlist matches found</p>
                    </div>
                )}

                {/* ---- Validation Errors ---- */}
                {validationErrors.length > 0 && (
                    <div className="tw:p-3 tw:bg-red-50 tw:border tw:border-red-200 tw:rounded-[10px] tw:flex tw:flex-col tw:gap-1">
                        <div className="tw:flex tw:items-center tw:justify-between">
                            <span className="tw:text-[13px] tw:font-semibold tw:text-red-800">
                                {validationErrors.length} validation error{validationErrors.length !== 1 ? 's' : ''}
                            </span>
                            <button
                                onClick={() => setValidationErrors([])}
                                className="tw:bg-transparent tw:border-none tw:p-0.5 tw:text-red-800 tw:cursor-pointer hover:tw:text-red-900"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        {validationErrors.slice(0, 5).map((err, i) => (
                            <div key={i} className="tw:text-xs tw:text-red-700">{err}</div>
                        ))}
                        {validationErrors.length > 5 && (
                            <div className="tw:text-xs tw:text-red-700 tw:italic">
                                ...and {validationErrors.length - 5} more
                            </div>
                        )}
                    </div>
                )}

                {/* ---- Grid Section ---- */}
                <div className="tw:flex-1 tw:flex tw:flex-col tw:min-h-[340px]">
                    <div className="tw:flex-1 tw:border tw:border-gray-200 tw:rounded-xl tw:overflow-hidden tw:shadow-sm">
                        <AgGridReact
                            ref={gridRef}
                            theme={gridTheme}
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            context={gridContext}
                            getRowId={getRowId}
                            onCellValueChanged={handleCellValueChanged}
                            processDataFromClipboard={processDataFromClipboard}
                            cellSelection={true}
                            undoRedoCellEditing={true}
                            undoRedoCellEditingLimit={10}
                            stopEditingWhenCellsLoseFocus={true}
                            suppressRowHoverHighlight={false}
                            rowHeight={42}
                            headerHeight={40}
                            rowSelection={{ mode: "multiRow" }}
                        />
                    </div>

                    {/* Add Row button */}
                    <button
                        onClick={addRow}
                        className="tw:inline-flex tw:items-center tw:gap-1.5 tw:mt-2.5 tw:px-4 tw:py-2 tw:bg-transparent tw:border tw:border-dashed tw:border-gray-300 tw:rounded-lg tw:text-[13px] tw:font-medium tw:text-gray-500 tw:cursor-pointer tw:self-start hover:tw:text-primary-600 hover:tw:border-primary-300 hover:tw:bg-primary-50 tw:transition-all"
                    >
                        <Plus size={15} />
                        Add Row
                    </button>
                </div>
            </div>
        </div>
    );
};
