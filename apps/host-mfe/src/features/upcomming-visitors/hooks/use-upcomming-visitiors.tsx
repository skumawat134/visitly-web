import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import type {
  VisitorVisitResponse,
  VisitorListParams,
  VisitorsRowsType,
  Site
} from '../types/upcomming-visitors.types';
import { exportVisitorsCSV, getUpCommingVisitors, getAllSites, getAllVisitorType } from '../api/upcomming-visitors.api';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { STORAGE_KEY, standardFields, MEGA_LOCATION_FIELDS } from '../types/upcomming-visitors.types';
import { Edit2, Repeat, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, NamedAvatar } from '@visitly/ui';
import type { DateRangeValue } from '../../../shared/components/DateRangePicker';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAuthStore } from '@visitly/app-store';
import { useToastStore } from '@visitly/app-store';
import { useEntitlements } from '@/features/visitor-detail/hooks/useEntitlement';

export const useUpcomingVisitors = () => {
  const navigate = useNavigate();
  const userinfo = JSON.parse(sessionStorage.getItem('userinfo') || '{}');
  const toast = useToastStore((s) => s.showToast)
  // 1. Pagination & Search States
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [searchTerm, setSearchTerm] = useState('');
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');
  const [sortBy, setSortBy] = useState('scheduledCheckinDate');
  const [showSettingModal, setShowSettingModal] = useState(false);
  const [showPreRegistrationModal, setshowPreRegistrationModal] = useState(false);
  const [selectedVisitId, setSelectedVisitId] = useState<string | undefined>(undefined);
  const [modalStatus, setModalStatus] = useState<'Create' | 'Update'>('Create');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'checkedin'>('upcoming');
  const debounceSearchTerm = useDebounce(searchTerm, 500)
  const currentUser = useAuthStore((state) => state.user)
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [showBulkCancelModal, setShowBulkCancelModal] = useState(false);
  const [showMoreActionsMenu, setShowMoreActionsMenu] = useState(false);
  const [selectedRows, setSelectedRows] = useState([])
  const [showBulkPreRegistrationModal, setShowBulkPreRegistrationModal] = useState(false);
  const [showInviteMenu, setShowInviteMenu] = useState(false);

  const [visitorToCancel, setVisitorToCancel] = useState<VisitorsRowsType | null>(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [showCancelRecurrence, setShowCancelRecurrence] = useState(false);
  const [cancelUpdateType, setCancelUpdateType] = useState<"SELECTED_VISIT" | "FUTURE_VISITS_ONLY" | "ALL_VISITS">("SELECTED_VISIT");

  // 2. Filter States
  const [viewAs, setViewAs] = useState<string>('all'); // 'all' | 'myself' | delegateId
  const [locationFilter, setLocationFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const debounceGroupSearch = useDebounce(groupFilter, 500)
  const { isAdvancedMegaLocationEntitled } = useEntitlements()


  // Default to All Time (null) so filtering is optional
  const [dateRange, setDateRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null
  });

  // Fetch all sites for the filter
  const { data: sitesData } = useQuery({
    queryKey: ['allSites'],
    queryFn: getAllSites,
  });

  // Fetch all visitor types for the filter
  const { data: allVisitorTypeOption } = useQuery({
    queryKey: ['visitorType', locationFilter],
    queryFn: () =>
      getAllVisitorType({
        siteId: locationFilter,
        status: 'ACTIVE',
      }),
    select: (data) =>
      data.results.map((visitorType) => ({
        id: visitorType.id,
        name: visitorType.visitorType,
      })),
    enabled: !!locationFilter,
  });



  const buildParams = (): VisitorListParams => {
    // Determine effective user ID for "View As"
    let effectiveUserId = userinfo.id || '';
    if (viewAs === 'myself') {
      effectiveUserId = userinfo.id;
    } else if (viewAs !== 'all') {
      effectiveUserId = viewAs;
    }

    return {
      limit: pageSize,
      offset: pageIndex * pageSize,
      sort: sort.toUpperCase() as any,
      sortBy: sortBy,
      q: debounceSearchTerm,
      siteId: locationFilter,
      groupName: debounceGroupSearch,
      visitorTypeId: typeFilter,
      scheduleCheckinStartDate: dateRange.startDate || '',
      scheduleCheckinEndDate: dateRange.endDate || '',
    };
  };

  const { data, isLoading, refetch, isFetching } = useQuery<VisitorVisitResponse>({
    queryKey: ['upcomingVisitors', pageIndex, pageSize, debounceSearchTerm, sort, sortBy, locationFilter, typeFilter, debounceGroupSearch, dateRange],
    queryFn: () => getUpCommingVisitors(buildParams()),
    enabled: activeTab === 'upcoming',
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

  const handlePageChange = (newPageIndex: number) => setPageIndex(newPageIndex);
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  };

  const rowData = useMemo(() => {

    if (!viewAs) return data?.results || []

    if (viewAs == 'all') {
      return data?.results;
    }
    if (viewAs == 'myself') {
      return data?.results.filter((item) => item.hostUserId === currentUser?.id)
    }

    return data?.results.filter((item) => item.hostUserId == viewAs) || []
  }
    , [data, viewAs]);

  const redirectToVisitorDetailPage = (data: any) => {
    if (!data?.id) return;

    const isPrefill = !!data.visitInfoModel;
    const id = isPrefill ? data.visitInfoModel?.id : data.id;

    const url = isPrefill
      ? `/host/visitor-detail/${id}?isPrefill=true`
      : `/host/visitor-detail/${id}`;

    navigate(url);
  };


  const handleCancelClick = useCallback((visitor: VisitorsRowsType) => {
    setVisitorToCancel(visitor);
    const isRecurring = !!visitor.recurrenceType && visitor.recurrenceType !== "NONE" || !!visitor.parentVisitId;

    if (isRecurring) {
      setShowCancelRecurrence(true);
    } else {
      setCancelUpdateType("SELECTED_VISIT");
      setShowCancelConfirmation(true);
    }
  }, []);

  const colDefs = useMemo<ColDef<VisitorsRowsType>[]>(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    const savedColumns: any[] = savedData ? JSON.parse(savedData) : standardFields.filter((f: any) => f.isSelected);

    const isVisible = (title: string) => {
      // Action and Name and Scheduled Check-in are always visible if it's in standard fields and is selected
      const field = standardFields.find((f: any) => f.columnTitle === title);
      const isMandatory = field?.isDisabled;
      if (isMandatory) return true;

      // Handle mega location fields
      if (MEGA_LOCATION_FIELDS.includes(title) && !isAdvancedMegaLocationEntitled) return false;

      return savedColumns.some(col => col.columnTitle === title);
    };

    const allPossibleCols: ColDef<VisitorsRowsType>[] = [
      {
        headerName: "",
        checkboxSelection: true,
        headerCheckboxSelection: true,
        width: 50,
        pinned: 'left',
        lockPosition: 'left',
        suppressMovable: true,
      },
      {
        headerName: "Name",
        field: "fullName",
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: ICellRendererParams) => {
          const data = params.data;
          if (!data) return null;
          return (
            <div onClick={() => redirectToVisitorDetailPage(data)} className="tw:flex tw:items-center tw:gap-2.5 tw:h-full">
              {(data.recurrenceType && data.recurrenceType != 'NONE') || data.parentVisitId && <Repeat size={16} />}
              <NamedAvatar url={data.visitPhotoURI} name={data.fullName} size={30} />
              <div className="tw:min-w-0 tw:leading-tight">
                <div className="tw:text-sm tw:font-medium tw:text-gray-800 tw:truncate">
                  {data.fullName}
                </div>
                {/* <div className="tw:text-xs tw:text-gray-400 tw:truncate">
                        {data.email}
                      </div> */}
              </div>
            </div>
          );
        },
      },
      { headerName: "Type", field: "visitorType", hide: !isVisible("Type") },
      { headerName: "Host", field: "hostName", hide: !isVisible("Host") },
      { headerName: "Location", field: "siteName", hide: !isVisible("Location") },
      { headerName: "Company", field: "companyName", hide: !isVisible("Company") },
      { headerName: "Group Name", field: "groupName", hide: !isVisible("Group Name") },
      { headerName: "Phone", field: "phoneNumber", hide: !isVisible("Phone") },
      { headerName: "Point of Entry", field: "poeName", hide: !isVisible("Point of Entry"), width: 125 },
      { headerName: "Parking Lot", field: "parkingLotName", hide: !isVisible("Parking Lot"), width: 125 },
      { headerName: "Building", field: "buildingName", hide: !isVisible("Building"), width: 125 },
      {
        headerName: "Pre-fill Status", field: "id", hide: !isVisible("Pre-fill Status"), valueFormatter: (params) => {
          const data = params.data as VisitorsRowsType;
          return (data?.visitInfoModel && data?.visitInfoModel?.id) ? 'Yes' : 'No';
        }, width: 125
      },
      { headerName: "Internal Note", field: "internalNote", hide: !isVisible("Internal Note") },
      { headerName: "Email", field: "email", hide: !isVisible("Email") },
      { headerName: "Scheduled Check-In", field: "scheduleCheckinDate", hide: !isVisible("Scheduled Check-In Date"), valueFormatter: (params) => params.value ? format(new Date(params.value), 'MMM dd, yyyy h:mm a') : '-' },
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
                const id = (params.data as VisitorsRowsType)?.id;
                setSelectedVisitId(id);
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
              onClick={() => params.data && handleCancelClick(params.data)}
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
  }, [rowData, showSettingModal, handleCancelClick]);

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


  const checkIsRecurringVisit = useCallback((datas: any) => {
    const temp = datas.some((data: any) => data.recurrenceType && (data.recurrenceType !== 'NONE' || data.parentVisitId))
    return temp;
  }, [selectedRows.length])

  const checkIsPreRegisterVisit = useCallback((datas: any) => {
    const isAnyPrefill = datas.some((data: any) => data?.visitInfoModel && data?.visitInfoModel?.id)
    return isAnyPrefill;
  }, [selectedRows.length])


  const openBulkUpdateModal = () => {
    const isRecurring = checkIsRecurringVisit(selectedRows)
    if (isRecurring) {
      toast({ message: 'Some selected entries are recurring visits and cannot be updated. Please deselect recurring visits to proceed with bulk updates.' })
      return;
    }
    const isPrefill = checkIsPreRegisterVisit(selectedRows)
    if (isPrefill) {
      toast({ message: 'Some selected entries are already prefilled and cannot be updated. Please deselect prefilled rows to proceed with bulk updates.' })
      return;
    }
    setShowMoreActionsMenu(false);
    setShowBulkUpdateModal(true);
  }


  return {
    data,
    isLoading: isLoading || isFetching,
    pagination: { pageIndex, setPageIndex, pageSize, setPageSize },
    search: { searchTerm, setSearchTerm },
    sorting: { sort, setSort, sortBy, setSortBy },
    filters: {
      viewAs, setViewAs,
      locationFilter, setLocationFilter,
      typeFilter, setTypeFilter,
      groupFilter, setGroupFilter,
      dateRange, setDateRange
    },
    sites: sitesData?.results || [],
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
    allVisitorTypeOption,
    showBulkPreRegistrationModal,
    openBulkPreRegistrationModalHandler,
    showInviteMenu,
    setShowInviteMenu,
    closeBulkPreRegistrationModalHandler: () => setShowBulkPreRegistrationModal(false),
    activeTab,
    setActiveTab,
    showBulkUpdateModal,
    setShowBulkUpdateModal,
    showBulkCancelModal,
    setShowBulkCancelModal,
    showMoreActionsMenu,
    setShowMoreActionsMenu,
    setSelectedRows,
    openBulkUpdateModal,
    navigate,
    showCancelConfirmation,
    setShowCancelConfirmation,
    showCancelRecurrence,
    setShowCancelRecurrence,
    visitorToCancel,
    cancelUpdateType,
    setCancelUpdateType,
    handleCancelClick,
  };
};
