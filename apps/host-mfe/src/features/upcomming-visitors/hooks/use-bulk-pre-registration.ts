import { useState, useCallback, useMemo } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format, parse } from 'date-fns';
import {
    useSites,
    useVisitorTypes,
    useHosts,
    useCoHosts,
    useVisitorTypesFields,
    usePointOfEntry,
    useParkingLot,
    useDestination
} from './use-preregistration.queries';
import { bulkPreRegistration, preScreenBulk } from '../api/pre-registration.api';
import { useQueryClient } from '@tanstack/react-query';

export interface BulkPreRegRow {
    fullName: string;
    email: string;
    hostEmail: string;
    companyName: string;
    phoneNumber: string;
    scheduleCheckinDate: string;
    scheduleCheckoutDate: string;
    groupName: string;
    internalNote: string;
    isHighlighted?: boolean;
    warningTooltipMessage?: string;
    [key: string]: any;
}

export const useBulkPreRegistration = () => {
    const queryClient = useQueryClient();
    const [rowData, setRowData] = useState<BulkPreRegRow[]>([]);
    const [gridApi, setGridApi] = useState<any>(null);
    const [isPreScreening, setIsPreScreening] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showPasteArea, setShowPasteArea] = useState(false);
    const [pasteAreaValue, setPasteAreaValue] = useState('');
    const [isWatchlistHit, setIsWatchlistHit] = useState(false);
    const [isPreScreenCheckSafe, setIsPreScreenCheckSafe] = useState(false);

    const { data: sites } = useSites();
    const siteOptions = useMemo(() => sites?.results?.map(s => ({ label: s.name, value: s.id })) || [], [sites]);

    const formik = useFormik({
        initialValues: {
            siteId: '',
            visitorTypeId: '',
            hostUserId: '',
            hostEmail: '',
            cohostUserIds: [] as string[],
            notifyHostFlag: true,
            notifyVisitFlag: true,
            shouldPrefill: true,
            parkingLotValue: '',
            pointOfEntryValue: '',
            destinationValue: '',
        },
        validationSchema: Yup.object({
            siteId: Yup.string().required('Location is required'),
            visitorTypeId: Yup.string().required('Visitor Type is required'),
        }),
        onSubmit: () => { },
    });

    const { data: visitorTypes } = useVisitorTypes(formik.values.siteId);
    const visitorTypeOptions = useMemo(() => visitorTypes?.results?.map(vt => ({ label: vt.visitorType, value: vt.id })) || [], [visitorTypes]);

    const [hostSearch, setHostSearch] = useState('');
    const { data: hostsData } = useHosts(hostSearch, formik.values.siteId);
    const hostOptions = useMemo(() => hostsData?.results?.map((u: any) => ({
        label: `${u.firstName} ${u.lastName} - ${u.email}`,
        value: u.id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName
    })) || [], [hostsData]);

    const [coHostSearch, setCoHostSearch] = useState('');
    const { data: coHostsData } = useCoHosts(coHostSearch, formik.values.siteId);
    const coHostOptions = useMemo(() => coHostsData?.results?.map((u: any) => ({
        label: `${u.firstName} ${u.lastName} - ${u.email}`,
        value: u.id
    })) || [], [coHostsData]);

    const { data: vtFields } = useVisitorTypesFields(formik.values.visitorTypeId);

    const onGridReady = (params: any) => {
        setGridApi(params.api);
    };

    const onAddRow = () => {
        const newRow: BulkPreRegRow = {
            fullName: '',
            email: '',
            hostEmail: '',
            companyName: '',
            phoneNumber: '',
            scheduleCheckinDate: "2026-02-14T19:23:00",
            scheduleCheckoutDate: '',
            groupName: '',
            internalNote: '',
        };
        setRowData(prev => [...prev, newRow]);
        gridApi?.applyTransaction({ add: [newRow] });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const csv = event.target?.result as string;
            processCsvData(csv);
        };
        reader.readAsText(file);
        // Reset file input
        e.target.value = '';
    };

    const processCsvData = (csv: string) => {
        const lines = csv.split(/\r\n|\n/);
        if (lines.length > 201) {
            alert('Bulk Pre-Registration has a limit of 200 rows.');
            return;
        }

        const newRows: BulkPreRegRow[] = [];
        for (let i = 1; i < lines.length; i++) {
            const data = lines[i].split(',');
            if (data[0] && data[1]) {
                newRows.push({
                    fullName: data[0].replace(/"/g, ''),
                    email: data[1].replace(/"/g, ''),
                    hostEmail: data[2]?.replace(/"/g, '') || '',
                    companyName: data[3]?.replace(/"/g, '') || '',
                    phoneNumber: data[4]?.replace(/"/g, '') || '',
                    scheduleCheckinDate: data[5]?.replace(/"/g, '') || '',
                    scheduleCheckoutDate: data[6]?.replace(/"/g, '') || '',
                    groupName: data[7]?.replace(/"/g, '') || '',
                    internalNote: data[8]?.replace(/"/g, '') || '',
                });
            }
        }
        setRowData(prev => [...prev, ...newRows]);
        gridApi?.applyTransaction({ add: newRows });
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const clipboardData = e.clipboardData.getData('text/plain');
        if (!clipboardData) return;

        const rows = clipboardData.split('\n').filter(r => r.trim() !== '');
        if (rows.length > 200) {
            alert('Bulk Pre-Registration has a limit of 200 rows.');
            return;
        }

        const parsedData: BulkPreRegRow[] = rows.map(row => {
            const cols = row.split('\t').map(c => c.trim());
            return {
                fullName: cols[0] || '',
                email: cols[1] || '',
                companyName: cols[2] || '',
                phoneNumber: cols[3] || '',
                scheduleCheckinDate: cols[4] || '',
                scheduleCheckoutDate: cols[5] || '',
                groupName: cols[6] || '',
                internalNote: cols[7] || '',
                hostEmail: '',
            };
        });

        setRowData(prev => [...prev, ...parsedData]);
        gridApi?.applyTransaction({ add: parsedData });
        setShowPasteArea(false);
        setPasteAreaValue('');
    };

    const validateRows = () => {
        let hasError = false;
        gridApi?.forEachNode((node: any) => {
            const { fullName, scheduleCheckinDate } = node.data;
            if (!fullName || !scheduleCheckinDate) {
                hasError = true;
            }
        });
        return !hasError;
    };

    const handlePreScreen = async () => {
        if (!validateRows()) {
            alert('Please fill in required fields (Name and Check-in Date).');
            return;
        }

        setIsPreScreening(true);
        setIsWatchlistHit(false);
        setIsPreScreenCheckSafe(false);

        const finalData = preparePayload();

        try {
            const response = await preScreenBulk(finalData);
            let allSafe = true;
            let countOfUnsafe = 0;

            response.forEach((res: any, index: number) => {
                if (res.visitStatus && res.visitStatus !== 'safe') {
                    allSafe = false;
                    countOfUnsafe++;
                    const rowNode = gridApi?.getRowNode(index.toString()) || gridApi?.getDisplayedRowAtIndex(index);
                    if (rowNode) {
                        const updatedData = {
                            ...rowNode.data,
                            isHighlighted: true,
                            warningTooltipMessage: `Watchlist hit: ${res?.matchedRule?.keyName}`
                        };
                        rowNode?.updateData(updatedData);
                    }
                }
            });

            if (allSafe) {
                setIsPreScreenCheckSafe(true);
            } else {
                setIsWatchlistHit(true);
            }
        } catch (error) {
            console.error('Pre-screen failed', error);
        } finally {
            setIsPreScreening(false);
        }
    };

    const handleSave = async (onSuccess: () => void) => {
        // if (!validateRows()) {
        //     alert('Please fill in required fields (Name and Check-in Date).');
        //     return;
        // }

        setIsSaving(true);
        const finalData = preparePayload();

        try {
            await bulkPreRegistration(finalData);
            onSuccess();
        } catch (error) {
            console.error('Save failed', error);
        } finally {
            setIsSaving(false);
        }
    };

    const preparePayload = () => {
        const rows: any[] = [];
        gridApi?.forEachNode((node: any) => {
            const data = node.data;
            rows.push({
                ...data,
                siteId: formik.values.siteId,
                visitorTypeId: formik.values.visitorTypeId,
                hostUserId: formik.values.hostUserId || undefined,
                cohostUserIds: formik.values.cohostUserIds,
                notifyHostFlag: formik.values.notifyHostFlag,
                notifyVisitFlag: formik.values.notifyVisitFlag,
                shouldPrefill: formik.values.shouldPrefill,
                poeId: formik.values.pointOfEntryValue || undefined,
                parkingLotId: formik.values.parkingLotValue || undefined,
                buildingId: formik.values.destinationValue || undefined,
            });
        });
        return rows;
    };

    return {
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
    };
};
