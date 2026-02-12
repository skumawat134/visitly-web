import React, { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format, startOfDay, addDays } from 'date-fns';
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
import { useNavigate } from 'react-router-dom';
import { Button } from '@visitly/ui';

export const useUpcomingVisitors = () => {
  const navigate = useNavigate();
  // 1. Pagination & Search States
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState('scheduledCheckinDate');
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showPreRegistrationModal, setshowPreRegistrationModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | undefined>(undefined);
  const [modalStatus, setModalStatus] = useState<'Create' | 'Update'>('Create');

  const [showBulkPreRegistrationModal, setShowBulkPreRegistrationModal] = useState(false);
  // 3. Filter States using native Dates
  const [filters, setFilters] = useState<VisitorFilters>({
    siteId: '',
    groupName: '',
    visitorTypeId: '',
    dateRange: {
      startDate: startOfDay(new Date()),
      endDate: addDays(new Date(), 30),
    }
  });

  const { mutate: triggerExport } = useMutation({
    mutationFn: async (params: VisitorListParams) => {
      const blob = await exportVisitorsCSV(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `Pre_Visitor_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      return blob;
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
      scheduleCheckinStartDate: filters.dateRange?.startDate ? format(filters.dateRange.startDate, 'yyyy-MM-dd') : '',
      scheduleCheckinEndDate: filters.dateRange?.endDate ? format(filters.dateRange.endDate, 'yyyy-MM-dd') : '',
    };
  };

  const query = useQuery<VisitorVisitResponse>({
    queryKey: ['upcomingVisitors', pageIndex, pageSize, searchTerm, sort, sortBy, filters],
    queryFn: () => getUpCommingVisitors(buildParams()),
    placeholderData: (previousData) => previousData,
  });

  const handlePageChange = (newPageIndex: number) => setPageIndex(newPageIndex);
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  const rowData = useMemo(() => query?.data?.results || [], [query?.data]);

  const colDefs = useMemo<ColDef<VisitorsRowsType>[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedColumns: any[] = savedData ? JSON.parse(savedData) : [];
    const isVisible = (title: string) => savedColumns.some(col => col.columnTitle === title);

    const allPossibleCols: ColDef<VisitorsRowsType>[] = [
     {
  headerName: "Name",
  field: "fullName",
  hide: false,
  cellRenderer: (params: ICellRendererParams) => {
    const id = !!params.data?.visitInfoModel ?  params.data?.visitInfoModel?.id : params.data?.id;
    const isPrefill = !!params.data?.visitInfoModel; // true if key exists

    const handleClick = () => {
      const url = isPrefill
        ? `/host/visitor-detail/${id}?isPrefill=true`
        : `/host/visitor-detail/${id}`;

      navigate(url);
    };

    return (
      <button
        onClick={handleClick}
        className="tw:text-blue-600 tw:hover:text-blue-800 tw:underline"
      >
        {params.data?.fullName}
      </button>
    );
  },
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
      { headerName: "Scheduled Check-In Date", field: "scheduleCheckinDate" },
      {
        headerName: "Action",
        field: "id",
        width: 100,
        pinned: 'right',
        cellRenderer: (params: ICellRendererParams<VisitorsRowsType>) => (
          <div className="tw:flex tw:items-center tw:justify-center tw:gap-3 tw:h-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedVisitId(params.data?.id);
                setModalStatus('Update');
                setshowPreRegistrationModal(true);
              }}
              className="tw:text-indigo-600 hover:tw:text-indigo-800 tw:p-0 tw:h-auto"
            >
              <Edit2 size={16} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="tw:text-red-500 hover:tw:text-red-600 tw:p-0 tw:h-auto"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        )
      }
    ];

    const customCols = savedColumns
      .filter(col => col.type === 'Custom' || col.type === 'CUSTOM_FIELD')
      .map(col => ({
        headerName: col.columnTitle,
        field: col.prop,
        valueGetter: (params: any) => {
          const match = params.data?.preregisterVisitCustomFieldModels?.find((f: any) => f.name === col.columnTitle);
          return match ? match.value : '';
        }
      }));

    return [...allPossibleCols, ...customCols];
  }, [rowData, showSettingModal]);

  const onSortChanged = (event: any) => {
    const sortedColumn = event.api.getColumnState().find((col: any) => col.sort);
    if (sortedColumn) {
      setSortBy(sortedColumn.colId);
      setSort(sortedColumn.sort);
    }
  };

  const openPreRegistrationModalHandler = () => {
    setModalStatus('Create');
    setSelectedVisitId(undefined);
    setshowPreRegistrationModal(true);
  };

  const closePreRegistrationModalHandler = () => {
    setshowPreRegistrationModal(false);
    setSelectedVisitId(undefined);
  }
  const openBulkPreRegistrationModalHandler = () => {
    setShowBulkPreRegistrationModal(true);
  }
  const closeBulkPreRegistrationModalHandler = () => {
    setShowBulkPreRegistrationModal(false);
  }
  return {
    ...query,
    pagination: { pageIndex, setPageIndex, pageSize, setPageSize },
    search: { searchTerm, setSearchTerm },
    sorting: { sort, setSort, sortBy, setSortBy },
    filters: { filters, setFilters },
    handlePageChange,
    handlePageSizeChange,
    rowData,
    colDefs,
    settingModalClickHander: () => setShowSettingModal(true),
    showSettingModal,
    setShowSettingModal,
    exportHandler: () => triggerExport(buildParams()),
    onSortChanged,
    openPreRegistrationModalHandler,
    closePreRegistrationModalHandler,
    showPreRegistrationModal,
    selectedVisitId,
    modalStatus,
    showBulkPreRegistrationModal,
    openBulkPreRegistrationModalHandler,
    closeBulkPreRegistrationModalHandler,
  };
};