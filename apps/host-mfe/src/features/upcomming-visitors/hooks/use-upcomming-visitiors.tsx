import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format, subDays, addYears, startOfDay, addDays } from 'date-fns';
import type {
  VisitorVisitResponse,
  VisitorListParams,
  VisitorFilters,
  VisitorsRowsType
} from '../types/upcomming-visitors.types';
import { exportVisitorsCSV, getUpCommingVisitors } from '../api/upcomming-visitors.api';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { STORAGE_KEY } from '../components/CustomSettings';
import { Edit2, Trash2 } from 'lucide-react';

export const useUpcomingVisitors = () => {
  // 1. Pagination & Search States
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  // 2. Sorting States
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState('scheduleCheckinDate');
  const [showSettingModal, setShowSettingModal] = useState(false);
   const [showPreRegistrationModal, setshowPreRegistrationModal] = useState(false);
  // 3. Filter States using native Dates
  const [filters, setFilters] = useState<VisitorFilters>({
    siteId: '',
    groupName: '',
    visitorTypeId: '',
    dateRange: {
      // Default to today and 1 year range
      startDate: startOfDay(new Date()),
      endDate: addDays(new Date(), 30),
    }
  });

  const { mutate: triggerExport, isPending: isExporting } = useMutation({
    mutationFn: async (params: VisitorListParams) => {
      const blob = await exportVisitorsCSV(params);

      // 1. Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // 2. Create a temporary hidden anchor element
      const link = document.createElement('a');
      link.href = url;

      // 3. Set the filename
      const filename = `Pre_Visitor_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.setAttribute('download', filename);

      // 4. Append to body, click, and cleanup
      document.body.appendChild(link);
      link.click();

      // Cleanup: remove the link and revoke the URL to save memory
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
    onSuccess: () => {
      // You can trigger your toast notification here
      console.log("Column Settings updated and Exported!");
    },
    onError: (error) => {
      console.error("Export failed:", error);
    }
  });

  const buildParams = (): VisitorListParams => {
    const userinfo = JSON.parse(sessionStorage.getItem('userinfo') || '{}');
    return {
      limit: pageSize,
      offset: pageIndex * pageSize,
      sort: sort,
      sortBy: sortBy,
      q: searchTerm,
      userId: userinfo.id || '',
      siteId: filters.siteId ?? '',
      groupName: filters.groupName ?? '',
      visitorTypeId: filters.visitorTypeId ?? '',
      // Formatting to YYYY-MM-DD as expected by Visitly API
      scheduleCheckinStartDate: filters.dateRange?.startDate
        ? format(filters.dateRange.startDate, 'yyyy-MM-dd')
        : '',
      scheduleCheckinEndDate: filters.dateRange?.endDate
        ? format(filters.dateRange.endDate, 'yyyy-MM-dd')
        : '',
    };
  };
  const queryKey = ['upcomingVisitors', pageIndex, pageSize, searchTerm, sort, sortBy, filters];
  const query = useQuery<VisitorVisitResponse>({
    queryKey: queryKey,
    queryFn: () => getUpCommingVisitors(buildParams()),
    placeholderData: (previousData) => previousData,
  });

  const handlePageChange = (newPageIndex: number) => {
    setPageIndex(newPageIndex);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page
  };

  const rowData = useMemo(() => {
    if (!query?.data?.results) return [];
    return query?.data?.results;
  }, [query?.data, searchTerm]);

  const colDefs = useMemo<ColDef<VisitorsRowsType>[]>(() => {
    // 1. Get current saved settings
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedColumns: any[] = savedData ? JSON.parse(savedData) : [];

    // Helper to check if a column should be visible
    const isVisible = (title: string) => savedColumns.some(col => col.columnTitle === title);

    // 2. Define ALL possible columns
    const allPossibleCols: ColDef<VisitorsRowsType>[] = [
      {
        headerName: "Name",
        field: "fullName",
        hide: false, // Name is usually mandatory
        cellRenderer: (params: ICellRendererParams) => (
          <button className="tw:text-blue-600 tw:hover:text-blue-800 tw:underline">
            {params.data?.fullName}
          </button>
        ),
      },
      { headerName: "Type", field: "visitorType", hide: !isVisible("Type") },
      { headerName: "Host", field: "hostName", hide: !isVisible("Host") },
      { headerName: "Location", field: "siteName", hide: !isVisible("Location") },
      { headerName: "Company", field: "companyName", hide: !isVisible("Company") },
      { headerName: "Group Name", field: "groupName", hide: !isVisible("Group Name") },
      { headerName: "Phone", field: "phoneNumber", hide: !isVisible("Phone") },
      { headerName: "Internal Note", field: "internalNote", hide: !isVisible("Internal Note") },
      { headerName: "Email", field: "email", hide: !isVisible("Email") },
      { headerName: "Parking Lot", field: "parkingLotName", hide: !isVisible("Parking Lot") },
      { headerName: "Point of Entry", field: "poeName", hide: !isVisible("Point of Entry") },
      { headerName: "Building", field: "buildingName", hide: !isVisible("Building") },
      { headerName: "Scheduled Check-In Date", field: "scheduleCheckinDate", hide: false },
      {
        headerName: "Action",
        field: "id",
        width: 100,
        maxWidth: 100,
        pinned: 'right',
        sortable: false,
        filter: false,
        resizable: false,
        cellRenderer: (params: ICellRendererParams<VisitorsRowsType>) => {
          return (
            <div className="tw:flex tw:items-center tw:justify-center tw:gap-3 tw:h-full">
              <button
                onClick={() => console.log('Edit', params.data?.id)}
                className="tw:text-indigo-600 hover:tw:text-indigo-800 tw:transition-colors"
              >
                <Edit2 size={16} /> {/* Smaller icon size to match */}
              </button>
              <button
                onClick={() => console.log('Delete', params.data?.id)}
                className="tw:text-red-500 hover:tw:text-red-600 tw:transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        }
      }
    ];

    const customCols = savedColumns
      .filter(col => col.type === 'Custom' || col.type === 'CUSTOM_FIELD')
      .map(col => ({
        headerName: col.columnTitle,
        field: col.prop,
        hide: false, // If it's in savedColumns, we want to show it
        valueGetter: (params: any) => {
          const fields = params.data?.preregisterVisitCustomFieldModels;
          const match = fields?.find((f: any) => f.name === col.columnTitle);
          return match ? match.value : '';
        }
      }));

    return [...allPossibleCols, ...customCols];
  }, [rowData, showSettingModal]); // Re-run when rowData changes or you could add a 'version' state for settings updates
  const settingModalClickHander = (e: React.MouseEvent<HTMLButtonElement>) => {
    setShowSettingModal(true)
  }
  const exportHandler = () => {
    const currentParams = buildParams();
    triggerExport(currentParams);
  }
  const onSortChanged = (event: any) => {
    const columnState = event.api.getColumnState();

    const sortedColumn = columnState.find((col: any) => col.sort);

    if (!sortedColumn) return;

    const sortBy = sortedColumn.colId;
    const sortOrder = sortedColumn.sort; // 'asc' | 'desc'

    setSortBy(sortBy);
    setSort(sortOrder);
  };
  const openPreRegistrationModalHandler = () => {
    setshowPreRegistrationModal(true);
  }
  const closePreRegistrationModalHandler = () => {
    setshowPreRegistrationModal(false);
  }
  return {
    ...query,
    pagination: { pageIndex, setPageIndex, pageSize, setPageSize },
    search: { searchTerm, setSearchTerm },
    sorting: { sort, setSort, sortBy, setSortBy },
    filters: { filters, setFilters },
    queryKey,
    handlePageChange,
    handlePageSizeChange,
    rowData,
    colDefs,
    settingModalClickHander,
    showSettingModal,
    setShowSettingModal,
    exportHandler,
    onSortChanged,
    openPreRegistrationModalHandler,
    closePreRegistrationModalHandler,
    showPreRegistrationModal,
  };
};