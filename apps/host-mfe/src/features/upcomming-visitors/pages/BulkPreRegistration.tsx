import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, X, Upload, Clipboard, Download } from 'lucide-react';
import { AgGridReact } from 'ag-grid-react';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import type { ColDef, ICellRendererParams, ValueFormatterParams } from 'ag-grid-community';
import { AllEnterpriseModule, LicenseManager } from 'ag-grid-enterprise';
import { useSites, useVisitorTypes, useHosts, useCoHosts } from '../hooks/use-preregistration.queries';
import { bulkPreRegistration, preScreenBulk } from '../api/pre-registration.api';
import { useAuthStore } from '@visitly/app-store';
import { format } from 'date-fns';
import { DateTimeCellEditor } from '../components/DateTimeCellEditor';
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
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[+\d\s()-]*$/;

  const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;

interface BulkRow {
    __id: number;
    fullName: string;
    email: string;
    hostEmail: string; // Override Host
    companyName: string; // Company
    phoneNumber: string; // Phone No.
    scheduleCheckinDate: string; // Check In Date
    scheduleCheckoutDate: string; // Checkout Date
    groupName: string;
    internalNote: string;
    isHighlighted?: boolean;
    warningTooltipMessage?: string;
}

function isRowNonEmpty(row: BulkRow) {
    return !!(row.fullName?.trim() || row.email?.trim() || row.phoneNumber?.trim() ||
        row.companyName?.trim() || row.scheduleCheckinDate?.trim() || row.scheduleCheckoutDate?.trim() ||
        row.hostEmail?.trim() || row.groupName?.trim() || row.internalNote?.trim());
}

function validateRow(row: BulkRow) {
    if (!isRowNonEmpty(row)) return [];

    const errors: string[] = [];

    if (!row.fullName?.trim()) errors.push('Full Name is required');
    console.log('row.scheduleCheckinDate',row.scheduleCheckinDate)
    if (!row.scheduleCheckinDate?.trim()) errors.push('Check In Date is required');
    if (!isRowNonEmpty(row)) return [];

    

  console.log('row.scheduleCheckinDate (raw):', row.scheduleCheckinDate);

  // Check if value exists and is not just whitespace
  const checkIn = row.scheduleCheckinDate?.trim();
  if (!checkIn) {
    errors.push('Check In Date is required');
  } else if (!dateTimeRegex.test(checkIn)) {
    errors.push('Check In Date format invalid');
  }

    if (row.email?.trim() && !emailRegex.test(row.email.trim())) {
        errors.push('Invalid email format');
    }
    if (row.phoneNumber?.trim() && !phoneRegex.test(row.phoneNumber.trim())) {
        errors.push('Invalid phone format');
    }

    // Date format check (now allows both :ss and without)
    if (row.scheduleCheckinDate?.trim() && !dateTimeRegex.test(row.scheduleCheckinDate.trim())) {
        errors.push('Check In Date format invalid (use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss)');
    }
    if (row.scheduleCheckoutDate?.trim() && !dateTimeRegex.test(row.scheduleCheckoutDate.trim())) {
        errors.push('Checkout Date format invalid (use YYYY-MM-DDTHH:mm or YYYY-MM-DDTHH:mm:ss)');
    }

    // Logical check
    if (row.scheduleCheckinDate && row.scheduleCheckoutDate) {
        const checkIn  = new Date(row.scheduleCheckinDate);
        const checkOut = new Date(row.scheduleCheckoutDate);

        if (isNaN(checkIn.getTime()))  errors.push('Invalid Check In date');
        if (isNaN(checkOut.getTime())) errors.push('Invalid Checkout date');
        if (checkOut < checkIn)        errors.push('Checkout must be after Check In');
    }

    return errors;
}

// Cell style for required fields — red highlight when empty on a non-empty row
function requiredCellStyle(params: any) {
    const row = params.data;
    if (!isRowNonEmpty(row)) return null;
    const val = params.value;
    if (!val || !val.toString().trim()) {
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

    const val = params.value?.toString()?.trim() ?? "";

    // Required field check (only for check-in)
    if (params.colDef.field === 'scheduleCheckinDate') {
        if (!val) {
            return { borderLeft: '3px solid #EF4444', background: '#FEF2F2' };
        }
    }

    // Format check
    if (val && !dateTimeRegex.test(val)) {
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
        __id: ++rowIdCounter,
        fullName: '',
        email: '',
        hostEmail: '',
        companyName: '',
        phoneNumber: '',
        scheduleCheckinDate: '',
        scheduleCheckoutDate: '',
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

    // Hooks for data
    const { data: sites } = useSites();
    const siteOptions = sites?.results || [];

    // Common settings
    const [siteId, setSiteId] = useState('');
    const { data: visitorTypes } = useVisitorTypes(siteId);
    const visitorTypeOptions = visitorTypes?.results || [];

    const [visitorTypeId, setVisitorTypeId] = useState('');
    const [host, setHost] = useState<{ name: string; email: string; id: string } | null>(
        user ? { name: `${user.firstName} ${user.lastName}`, email: user.email, id: user.id } : null
    );

    // Host Search
    const [hostSearch, setHostSearch] = useState('');
    const { data: hostsData } = useHosts(hostSearch, siteId);

    const [coHosts, setCoHosts] = useState<{ name: string; email: string; id: string }[]>([]);
    const [coHostSearch, setCoHostSearch] = useState('');
    const [showCoHostDropdown, setShowCoHostDropdown] = useState(false);
    const { data: coHostsData } = useCoHosts(coHostSearch, siteId);

    const coHostRef = useRef<HTMLDivElement>(null);
    const hostRef = useRef<HTMLDivElement>(null);
    const [showHostDropdown, setShowHostDropdown] = useState(false);


    // Notifications
    const [notifyHost, setNotifyHost] = useState(true);
    const [notifyVisitor, setNotifyVisitor] = useState(true);
    const [allowPrefill, setAllowPrefill] = useState(false);

    // Grid data
    const [rowData, setRowData] = useState<BulkRow[]>(makeInitialRows);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isPreScreening, setIsPreScreening] = useState(false);
    const [isWatchlistHit, setIsWatchlistHit] = useState(false);
    const [isPreScreenCheckSafe, setIsPreScreenCheckSafe] = useState(false);

    // Close dropdowns on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (showCoHostDropdown && coHostRef.current && !coHostRef.current.contains(e.target as Node)) {
                setShowCoHostDropdown(false);
            }
            if (showHostDropdown && hostRef.current && !hostRef.current.contains(e.target as Node)) {
                setShowHostDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showCoHostDropdown, showHostDropdown]);

    // Grid context for action renderer
    const gridContext = useMemo(() => ({
        deleteRow: (id: number) => {
            setRowData(prev => prev.filter(r => r.__id !== id));
        },
    }), []);

    // Column definitions
    const columnDefs = useMemo<ColDef[]>(() => [
        {
            headerName: 'Full Name *',
            field: 'fullName',
            editable: true,
            flex: 1.5,
            minWidth: 150,
            cellStyle: requiredCellStyle,
        },
        {
            headerName: 'Email',
            field: 'email',
            editable: true,
            flex: 1.5,
            minWidth: 160,
            cellStyle: emailCellStyle,
        },
        {
            headerName: 'Override Host',
            field: 'hostEmail',
            editable: true,
            flex: 1,
            minWidth: 130,
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
            cellStyle: phoneCellStyle,
        },
         
{
  headerName: 'Check In Date *',
  field: 'scheduleCheckinDate',
  editable: true,
  flex: 1.2,
  minWidth: 170,
  cellEditor: DateTimeCellEditor,
  cellEditorPopup: false,  // ← this is the key change
  cellStyle: dateCellStyle,
  valueFormatter: (params: ValueFormatterParams) => {
    if (!params.value) return '';
    const d = new Date(params.value);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },
},
{
  headerName: 'Checkout Date',
  field: 'scheduleCheckoutDate',
  editable: true,
  flex: 1.2,
  minWidth: 170,
  cellEditor: DateTimeCellEditor,
  cellEditorPopup: false,  // ← same here
  cellStyle: dateCellStyle,
  valueFormatter: (params: ValueFormatterParams) => {
    if (!params.value) return '';
    const d = new Date(params.value);
    return d.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
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
            cellStyle: { display: 'flex', alignItems: 'center', justifyContent: 'center' },
        },
    ], []);

    const defaultColDef = useMemo(() => ({
        sortable: false,
        filter: false,
        resizable: true,
        suppressMovable: true,
        tooltipValueGetter: (params: any) => params.data.warningTooltipMessage,
        cellClassRules: {
            'tw:bg-yellow-100': (params: any) => params.data.isHighlighted,
        },
    }), []);

    const addRow = useCallback(() => {
        setRowData(prev => [...prev, makeEmptyRow()]);
        // Scroll grid to bottom after adding
        setTimeout(() => {
            if (gridRef.current?.api) {
                const api = gridRef.current.api;
                api.ensureIndexVisible(api.getDisplayedRowCount() - 1, 'bottom');
            }
        }, 50);
    }, []);

    const handleCellValueChanged = useCallback((event: any) => {
        setRowData(prev =>
            prev.map(r => r.__id === event.data.__id ? { ...event.data } : r)
        );
        setValidationErrors([]);
    }, []);

    const getRowId = useCallback((params: any) => String(params.data.__id), []);

    const preparePayload = (validRows: BulkRow[]) => {
        return validRows.map(row => ({
            fullName: row.fullName,
            email: row.email || "",
            companyName: row.companyName || "",
            phoneNumber: row.phoneNumber || "",
            // Use T00:00:00 to match the requested format roughly while keeping date picker simple
            scheduleCheckinDate: row.scheduleCheckinDate || null,
            scheduleCheckoutDate: row.scheduleCheckoutDate || null,
            groupName: row.groupName || "",
            internalNote: row.internalNote || "",
            hostEmail: row.hostEmail || "", // Override host

            // Common settings
            orgId: user?.orgId,
            siteId: siteId,
            visitorTypeId: visitorTypeId,
            hostUserId: host?.id, // Default host
            cohostUserIds: coHosts.map(c => c.id),
            notifyHostFlag: String(notifyHost),
            notifyVisitFlag: String(notifyVisitor),
            shouldPrefill: allowPrefill,
        }));
    };

    const runValidation = () => {
        // Validate common settings
        const settingsErrors: string[] = [];
        if (!siteId) settingsErrors.push('Location is required');
        if (!visitorTypeId) settingsErrors.push('Visitor Type is required');

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
                                warningTooltipMessage: `Watchlist hit` // API response details would be better here if available per row
                            };
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
            navigate('/upcoming-visitors'); // Go back to main page
        } catch (error) {
            console.error('Save failed', error);
        } finally {
            setIsSaving(false);
        }
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

    // File Handling
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const csv = event.target?.result as string;
            const lines = csv.split(/\r\n|\n/).slice(1); // Skip header
            const newRows: BulkRow[] = [];
            lines.forEach(line => {
                const cols = line.split(',');
                if (cols.length > 1) {
                    const r = makeEmptyRow();
                    r.fullName = cols[0]?.replace(/"/g, '') || '';
                    r.email = cols[1]?.replace(/"/g, '') || '';
                    r.hostEmail = cols[2]?.replace(/"/g, '') || '';
                    r.companyName = cols[3]?.replace(/"/g, '') || '';
                    r.phoneNumber = cols[4]?.replace(/"/g, '') || '';
                    r.scheduleCheckinDate = cols[5]?.replace(/"/g, '') || '';
                    r.scheduleCheckoutDate = cols[6]?.replace(/"/g, '') || '';
                    r.groupName = cols[7]?.replace(/"/g, '') || '';
                    r.internalNote = cols[8]?.replace(/"/g, '') || '';
                    newRows.push(r);
                }
            });
            setRowData(prev => {
                const keptRows = prev.filter(p => isRowNonEmpty(p));
                return [...keptRows, ...newRows, ...makeInitialRows(newRows.length > 0 ? 1 : 1)];
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

    // Tag chip for host/co-host
    const renderTag = (name: string, onRemove: () => void) => (
        <span
            key={name}
            className="tw:inline-flex tw:items-center tw:gap-1 tw:px-2.5 tw:py-1 tw:rounded-full tw:bg-primary-50 tw:text-primary-600 tw:text-[13px] tw:font-medium tw:whitespace-nowrap"
        >
            {name}
            <button
                onClick={onRemove}
                className="tw:bg-transparent tw:border-none tw:p-0 tw:flex tw:items-center tw:text-primary-600 tw:cursor-pointer tw:opacity-70 hover:tw:opacity-100"
            >
                <X size={13} />
            </button>
        </span>
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
                        <p className="tw:text-xs tw:text-gray-500 tw:mt-1 tw:cursor-pointer hover:tw:text-primary-600 hover:tw:underline" onClick={downloadTemp}>
                            click here to download upload CSV template.
                        </p>
                    </div>
                </div>

                <div className="tw:flex tw:gap-3">
                    <div className="tw:relative">
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

                    <button
                        onClick={handlePreScreen}
                        disabled={isPreScreening || isSaving}
                        className="tw:px-4 tw:py-2.5 tw:bg-white tw:text-gray-700 tw:border tw:border-gray-300 tw:rounded-[10px] tw:text-sm tw:font-medium tw:cursor-pointer hover:tw:bg-gray-50"
                    >
                        {isPreScreening ? 'Checking...' : 'Pre-screen'}
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || isPreScreening}
                        className="tw:px-6 tw:py-2.5 tw:bg-primary-600 tw:text-white tw:border-none tw:rounded-[10px] tw:text-sm tw:font-medium tw:cursor-pointer hover:tw:bg-primary-700 tw:transition-colors"
                        style={{ background: 'var(--color-primary)' }}
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
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
                        <div className="tw:flex tw:flex-col tw:gap-1 tw:relative" ref={hostRef}>
                            <label className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wide">
                                Host
                            </label>
                            <div
                                className="tw:flex tw:items-center tw:gap-1.5 tw:min-h-[38px] tw:px-2 tw:border tw:border-transparent tw:rounded-lg hover:tw:bg-white hover:tw:border-gray-200 tw:cursor-text tw:transition-all"
                                onClick={() => {
                                    setShowHostDropdown(true);
                                    // Focus input logic if needed
                                }}
                            >
                                {host ? (
                                    renderTag(host.name, () => setHost(null))
                                ) : (
                                    <input
                                        type="text"
                                        value={hostSearch}
                                        onChange={(e) => {
                                            setHostSearch(e.target.value);
                                            setShowHostDropdown(true);
                                        }}
                                        onFocus={() => setShowHostDropdown(true)}
                                        placeholder="Search host..."
                                        className="tw:border-none tw:outline-none tw:text-[13px] tw:bg-transparent tw:text-gray-700 tw:w-full tw:min-w-[140px]"
                                    />
                                )}
                            </div>
                            {/* Host dropdown */}
                            {showHostDropdown && hostsData && (
                                <div className="tw:absolute tw:top-full tw:left-0 tw:mt-1 tw:bg-white tw:border tw:border-gray-200 tw:rounded-[10px] tw:shadow-lg tw:z-20 tw:max-h-52 tw:overflow-auto tw:p-1 tw:min-w-[240px]">
                                    {hostsData.results?.map((u: any) => (
                                        <button
                                            key={u.id}
                                            onClick={() => {
                                                setHost({ name: `${u.firstName} ${u.lastName}`, email: u.email, id: u.id });
                                                setHostSearch('');
                                                setShowHostDropdown(false);
                                            }}
                                            className="tw:w-full tw:text-left tw:px-2.5 tw:py-2 tw:rounded-md hover:tw:bg-gray-50 tw:bg-transparent tw:border-none tw:cursor-pointer"
                                        >
                                            <div className="tw:text-[13px] tw:font-medium tw:text-gray-800">{u.firstName} {u.lastName}</div>
                                            <div className="tw:text-[11px] tw:text-gray-400">{u.email}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Co-Hosts */}
                        <div className="tw:flex tw:flex-col tw:gap-1 tw:relative tw:min-w-[240px]" ref={coHostRef}>
                            <label className="tw:text-xs tw:font-semibold tw:text-gray-500 tw:uppercase tw:tracking-wide">
                                Co-Host(s)
                            </label>
                            <div
                                className="tw:flex tw:flex-wrap tw:items-center tw:gap-1.5 tw:p-1.5 tw:min-h-[38px] tw:border tw:border-gray-200 tw:rounded-lg tw:bg-white tw:cursor-text focus-within:tw:border-primary-500 focus-within:tw:ring-2 focus-within:tw:ring-primary-500/10"
                                onClick={() => {
                                    setShowCoHostDropdown(true);
                                    coHostRef.current?.querySelector('input')?.focus();
                                }}
                            >
                                {coHosts.map(c => renderTag(c.name, () => {
                                    setCoHosts(prev => prev.filter(p => p.email !== c.email));
                                }))}
                                <input
                                    type="text"
                                    value={coHostSearch}
                                    onChange={(e) => {
                                        setCoHostSearch(e.target.value);
                                        setShowCoHostDropdown(true);
                                    }}
                                    onFocus={() => setShowCoHostDropdown(true)}
                                placeholder={coHosts.length === 0 ? 'Search co-hosts...' : ''}
                                className="tw:border-none tw:outline-none tw:text-[13px] tw:flex-1 tw:min-w-[80px] tw:bg-transparent tw:text-gray-700"
                />
                            </div>

                            {/* Co-host dropdown */}
                            {showCoHostDropdown && coHostsData && (
                                <div className="tw:absolute tw:top-full tw:left-0 tw:right-0 tw:mt-1 tw:bg-white tw:border tw:border-gray-200 tw:rounded-[10px] tw:shadow-lg tw:z-20 tw:max-h-52 tw:overflow-auto tw:p-1">
                                    {coHostsData.results?.map((u: any) => {
                                        const fullName = `${u.firstName} ${u.lastName}`.trim();
                                        const isSelected = coHosts.some(c => c.email === u.email);
                                        if (isSelected) return null;

                                        return (
                                            <button
                                                key={u.id}
                                                onClick={() => {
                                                    setCoHosts(prev => [...prev, { name: fullName, email: u.email, id: u.id }]);
                                                    setCoHostSearch('');
                                                    setShowCoHostDropdown(false);
                                                }}
                                                className="tw:flex tw:flex-col tw:w-full tw:px-2.5 tw:py-2 tw:bg-transparent tw:border-none tw:rounded-md tw:cursor-pointer tw:text-left hover:tw:bg-gray-50"
                                            >
                                                <span className="tw:text-[13px] tw:font-medium tw:text-gray-800">
                                                    {fullName}
                                                </span>
                                                <span className="tw:text-[11px] tw:text-gray-400">
                                                    {u.email}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
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
                            singleClickEdit
                            stopEditingWhenCellsLoseFocus={false}
                            enableCellTextSelection
                            //   domLayout="autoHeight" // Removing autoHeight to use flex container and scroll
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
