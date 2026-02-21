import React, { useMemo, useState, useRef, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import {
  Filter, Plus, UserPlus, Upload, Pencil, X, Calendar,
  MapPin, Clock, ChevronDown, ChevronUp, Users,
  ChevronRight, ChevronLeft, ArrowRight, ArrowUpDown, Download,
  RotateCw, ArrowUpFromLine, Menu, Search as SearchIcon,
  Logs
} from 'lucide-react';
import { cn, Button, Input, Search, Select as VisitlySelect, FutureDateRangeFilter } from "@visitly/ui";
import { format } from "date-fns";
import { useUpcomingVisitors } from "../hooks/use-upcomming-visitiors";
import type { VisitorsRowsType } from "../types/upcomming-visitors.types";
import ColumnSettingsModal from "../components/CustomSettings";
import { GridFooter } from "@/shared/components/GridFooter";
import { PreRegistrationModal } from "../components/pre-registration/PreRegistration";
import { BulkPreRegistrationModal } from "../components/BulkPreRegistrationModal";
import { PastVisitors } from "@/features/past-visitors";
import DateRangePicker from "../../../shared/components/DateRangePicker";
// import { BulkCancelModal, BulkUpdateModal } from "../components/BulkActionModals";
import { BulkCancelModal } from "../components/BulkCancelModal";
import { BulkUpdateModal } from "../components/BulkUpdateModal";
import { CancelRecurrenceModal } from "../components/CancelRecurrenceModal";
import { CancelVisitModal } from "../components/CancelVisitModal";



import type { Site } from "../types/upcomming-visitors.types";
import type { DateRangeValue } from "../../../shared/components/DateRangePicker";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { PageDescription } from "@/shared/components/PageDescription";
import { useDelegateOption } from '@visitly/shared-core';
import { useSearchParams } from "react-router-dom";
import { HoverCard } from "@/features/host-dashboard/components/HoverCard";

// Custom styles for the premium switcher
const viewPillActive = "tw:px-4 tw:py-1.5 tw:rounded-lg tw:text-sm tw:font-semibold tw:text-blue-600 tw:bg-white tw:shadow-sm tw:border-none tw:cursor-pointer tw:whitespace-nowrap";
const viewPillInactive = "tw:px-4 tw:py-1.5 tw:rounded-lg tw:text-sm tw:font-medium tw:text-gray-500 tw:bg-transparent tw:border-none tw:cursor-pointer tw:whitespace-nowrap tw:transition-colors tw:hover:text-gray-700";

const UpcommingVisitors: React.FC = () => {
  const {
    data,
    isLoading,
    pagination,
    search,
    sorting,
    filters,
    sites,
    handlePageChange,
    handlePageSizeChange,
    rowData,
    colDefs,
    settingModalClickHander,
    setShowSettingModal,
    showSettingModal,
    exportHandler,
    onSortChanged,
    closePreRegistrationModalHandler,
    openPreRegistrationModalHandler,
    showPreRegistrationModal,
    setshowPreRegistrationModal,
    showBulkPreRegistrationModal,
    allVisitorTypeOption,
    openBulkPreRegistrationModalHandler,
    closeBulkPreRegistrationModalHandler,
    modalStatus,
    selectedVisitId,
    activeTab,
    setActiveTab,
    showInviteMenu,
    setShowInviteMenu,
    showBulkUpdateModal,
    setShowBulkUpdateModal,
    showBulkCancelModal,
    setShowBulkCancelModal,
    showMoreActionsMenu,
    setShowMoreActionsMenu,
    setSelectedRows,
    openBulkUpdateModal,
    navigate, // Ensure navigate is returned from hook or use useNavigate here if hook doesn't return it
    showCancelConfirmation,
    setShowCancelConfirmation,
    showCancelRecurrence,
    setShowCancelRecurrence,
    visitorToCancel,
    cancelUpdateType,
    setCancelUpdateType,
     upcomingDateRange,
    setUpcomingDateRange
  } = useUpcomingVisitors();
   const [searchParams] = useSearchParams();
   const type = searchParams.get("type");
   const mode = searchParams.get("mode");
   const openTab = searchParams.get("st");
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const { searchTerm, setSearchTerm } = search;
  const { pageSize, pageIndex } = pagination;
  const {
    viewAs, setViewAs,
    locationFilter, setLocationFilter,
    typeFilter, setTypeFilter,
    groupFilter, setGroupFilter,
    dateRange, setDateRange
  } = filters;

  const delegates = useDelegateOption();
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const debouncedGroupName = useDebounce(groupFilter, 500);

    const hoverTimerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inviteRef = useRef<HTMLDivElement>(null);
    const [hoveredVisitor, setHoveredVisitor] = useState<any>(null);
      const [hoverAnchor, setHoverAnchor] = useState<any>(null);
      const [hoverIsUpcoming, setHoverIsUpcoming] = useState(false);
     
    const handleRowEnter = (visitor: any, e: any, isUpcoming: boolean) => {
      clearTimeout(hoverTimerRef.current);
      const anchor = { clientX: e.event.clientX, clientY: e.event.clientY };
      hoverTimerRef.current = setTimeout(() => {
        setHoveredVisitor(visitor);
        setHoverAnchor(anchor);
        setHoverIsUpcoming(isUpcoming);
      }, 400);
    };
  
    const handleRowLeave = () => {
      clearTimeout(hoverTimerRef.current);
      setHoveredVisitor(null);
      setHoverAnchor(null);
    };
 
  useEffect(() => {
    // show modal from other page
     if(type =="single-invite"){
         setshowPreRegistrationModal(true)
     }
     if(openTab === 'checkin'){
      setActiveTab('checkedin')
     }
  }, [type])  
  

  // Customizing the Theme for AG Grid
  const myTheme = useMemo(
    () =>
      themeQuartz.withParams({
        headerBackgroundColor: "transparent",
        headerTextColor: "#9ca3af", // gray-400
        headerFontWeight: 600,
        headerFontSize: 11,
        rowHoverColor: "#f9fafb", // gray-50
        oddRowBackgroundColor: "transparent",
        borderRadius: "0px",
        accentColor: "#4338ca", // indigo-700
        fontSize: "13px",
        wrapperBorder: false,
        borderColor: "transparent",
      }),
    [],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      // sortable: true,
      // filter: true,
      resizable: true,
      // suppressHeaderMenuButton: true,
      // suppressMultiSort: true,
      headerClass:
        "tw:text-[14px] tw:uppercase tw:tracking-wider tw:font-semibold tw:text-gray-400",
    }),
    [],
  );

  const onSelectionChanged = (event: any) => {
    const selectedNodes = event.api.getSelectedNodes();
    setSelectedRows(selectedNodes.map((node: any) => node.data))
    const ids = selectedNodes.map((node: any) => node.data.id);
    setSelectedRowIds(ids);
  };


  return (
    <div ref={containerRef} className="tw:p-4 tw:md:p-6 tw:bg-gray-50 tw:min-h-screen tw:font-sans tw:relative tw:overflow-visible">
      <div className="tw:w-full tw:mx-auto">

        <div className="tw:w-full tw:flex tw:flex-col tw:md:flex-row tw:justify-between tw:items-center">
          {/* Page Header */}
          <PageDescription title='Visitors' description="Manage your upcoming and past visitors" />

          {/* Invite Dropdown */}
          <div className="tw:flex tw:justify-end tw:mb-2">
            <div className="tw:relative">
              <button
                className="tw:inline-flex tw:items-center tw:gap-2 tw:px-5 tw:py-2.5 tw:bg-blue-600 tw:text-white tw:border-none tw:rounded-xl tw:text-sm tw:font-medium tw:cursor-pointer tw:transition-colors tw:hover:bg-blue-700"
                onClick={() => setShowInviteMenu(!showInviteMenu)}
              >
                <UserPlus size={16} />
                Invite Visitor
                <ChevronDown size={14} className="tw:ml-0.5 tw:opacity-70" />
              </button>

              {showInviteMenu && (
                <>
                  <div className="tw:fixed tw:inset-0 tw:z-30" onClick={() => setShowInviteMenu(false)} />
                  <div className="tw:absolute tw:top-full tw:right-0 tw:mt-1.5 tw:bg-white tw:rounded-xl tw:border tw:border-gray-100 tw:shadow-lg tw:p-1.5 tw:z-40 tw:min-w-[220px]">
                    <button
                      className="tw:flex tw:items-center tw:gap-3 tw:w-full tw:px-3 tw:py-2.5 tw:bg-transparent tw:border-none tw:rounded-lg tw:cursor-pointer tw:text-left tw:transition-colors tw:hover:bg-gray-50"
                      onClick={() => {
                        setShowInviteMenu(false);
                        openPreRegistrationModalHandler();
                      }}
                    >
                      <UserPlus size={15} className="tw:text-blue-600 tw:shrink-0" />
                      <div>
                        <div className="tw:text-sm tw:font-medium tw:text-gray-800">Single Invite</div>
                        <div className="tw:text-xs tw:text-gray-400">Pre-register one visitor</div>
                      </div>
                    </button>
                    <button
                      className="tw:flex tw:items-center tw:gap-3 tw:w-full tw:px-3 tw:py-2.5 tw:bg-transparent tw:border-none tw:rounded-lg tw:cursor-pointer tw:text-left tw:transition-colors tw:hover:bg-gray-50"
                      onClick={() => {
                        setShowInviteMenu(false);
                        navigate('/host/bulk-pre-register');
                      }}
                    >
                      <Upload size={15} className="tw:text-blue-600 tw:shrink-0" />
                      <div>
                        <div className="tw:text-sm tw:font-medium tw:text-gray-800">Bulk Invite</div>
                        <div className="tw:text-xs tw:text-gray-400">Pre-register multiple visitors</div>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* View-As Switcher */}
        <div className="tw:flex tw:items-center tw:gap-3 tw:mb-2 tw:px-4">
          <div className="tw:flex tw:items-center tw:gap-1 tw:bg-gray-200/60 tw:p-1 tw:rounded-xl">
            <button
              onClick={() => setViewAs('all')}
              className={viewAs === 'all' ? viewPillActive : viewPillInactive}
            >
              All
            </button>
            <button
              onClick={() => setViewAs('myself')}
              className={viewAs === 'myself' ? viewPillActive : viewPillInactive}
            >
              My Visitors
            </button>
          </div>
          <div className="tw:relative">
            <select
              value={viewAs !== 'all' && viewAs !== 'myself' ? viewAs : ""}
              onChange={(e) => { if (e.target.value) setViewAs(e.target.value) }}
              className={cn(
                "tw:appearance-none tw:pl-4 tw:pr-10 tw:py-2 tw:rounded-xl tw:text-sm tw:font-medium tw:transition-all tw:outline-none tw:cursor-pointer tw:min-w-[180px] tw:h-[38px]",
                viewAs !== 'all' && viewAs !== 'myself'
                  ? "tw:border-1.5 tw:border-blue-500 tw:bg-blue-50 tw:text-blue-600"
                  : "tw:border tw:border-gray-200 tw:bg-white tw:text-gray-500"
              )}
            >
              <option value="" disabled>View as delegate...</option>
              {/* Delegates list could be passed in, currently placeholder */}
              {
                delegates.map((item) => {
                  return <option key={item.id} value={item.id}>{item.name}</option>
                })
              }
            </select>
            <ChevronDown size={14} className={cn(
              "tw:absolute tw:right-3 tw:top-1/2 tw:-translate-y-1/2 tw:pointer-events-none",
              viewAs !== 'all' && viewAs !== 'myself' ? "tw:text-blue-500" : "tw:text-gray-400"
            )} />
          </div>
        </div>

        {/* Filter Bar Card */}
        <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-12 tw:gap-2 tw:items-center tw:bg-transparent tw:p-4 tw:rounded-2xl tw:mb-2">

          {/* Search by Name */}
          <div className="tw:md:col-span-3 tw:relative">
            <SearchIcon className="tw:absolute tw:left-3.5 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400" size={18} />
            <Input
              type="text"
              leftIcon={<SearchIcon size={18} />}
              placeholder="Search by name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tw:w-full tw:pl-10 tw:pr-4 tw:py-2.5 tw:bg-white tw:border tw:border-gray-200 tw:rounded-xl tw:text-sm tw:focus:ring-2 tw:focus:ring-blue-500/10 tw:transition-all"
            />
          </div>

          {/* Search by Group */}
          <div className="tw:md:col-span-3 tw:relative">
            <Input
              type="text"
              leftIcon={<SearchIcon size={18} />}
              placeholder="Search by group name..."
              value={groupFilter}
              onChange={(e) => setGroupFilter(e.target.value)}
              className="tw:w-full tw:pl-10 tw:pr-4 tw:py-2.5 tw:bg-white tw:border tw:border-gray-200 tw:rounded-xl tw:text-sm tw:focus:ring-2 tw:focus:ring-blue-500/10 tw:transition-all"
            />
          </div>

          {/* Location Select */}
          <div className="tw:md:col-span-2 tw:relative">
            <MapPin className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400" size={16} />
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="tw:appearance-none tw:w-full tw:pl-9 tw:pr-10 tw:py-2.5 tw:border tw:border-gray-200 tw:rounded-xl tw:text-sm tw:font-medium tw:text-gray-600 tw:bg-white tw:cursor-pointer tw:outline-none"
            >
              <option value="">All Locations</option>
              {sites.map((s: Site) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="tw:absolute tw:right-2 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 tw:pointer-events-none" size={14} />
          </div>

          {/* Type Select */}
          {allVisitorTypeOption && allVisitorTypeOption?.length > 0 && <div className="tw:md:col-span-2 tw:relative">
            <Filter className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400" size={16} />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="tw:appearance-none tw:w-full tw:pl-9 tw:pr-10 tw:py-2.5 tw:border tw:border-gray-200 tw:rounded-xl tw:text-sm tw:font-medium tw:text-gray-600 tw:bg-white tw:cursor-pointer tw:outline-none"
            >
              <option value="">All Types</option>
              {allVisitorTypeOption?.map((item) => {
                return <option key={item.id} value={item.id}>{item.name}</option>
              })}
            </select>
            <ChevronDown className="tw:absolute tw:right-2 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 tw:pointer-events-none" size={14} />
          </div>}

          {/* Rows Per Page */}
          <div className="tw:md:col-span-2 tw:relative tw:flex tw:items-center tw:gap-2">
            <span className="tw:text-sm tw:font-medium tw:text-gray-700">Rows</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="tw:w-20 tw:pl-3 tw:pr-2 tw:py-2.5 tw:border tw:border-gray-200 tw:rounded-xl tw:text-sm tw:font-medium tw:text-gray-600 tw:bg-white tw:cursor-pointer tw:outline-none"
            >
              {[15, 20, 50, 100].map((size) => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
          </div>

          {/* Date Range Picker Section */}
          <div className="tw:md:col-span-12 tw:flex tw:items-center tw:gap-3 tw:flex-wrap tw:mt-4 md:tw:mt-0">

            { activeTab === 'upcoming' && 
              <FutureDateRangeFilter
              value={upcomingDateRange}
              onChange={(val: DateRangeValue | string) => setUpcomingDateRange(val as any)}
              />
            }

           {  activeTab === 'checkedin' && <DateRangePicker
              value={dateRange}
              onChange={(val: DateRangeValue | string) => setDateRange(val as any)}
            />}
            {/* More Actions Dropdown (Visible only when rows selected) */}
            {selectedRowIds.length > 0 && (
              <div className="tw:relative">
                <button
                  className="tw:inline-flex tw:items-center tw:gap-2 tw:px-5 tw:py-2.5 tw:bg-white tw:text-gray-700 tw:border tw:border-gray-200 tw:rounded-xl tw:text-sm tw:font-medium tw:cursor-pointer tw:transition-colors tw:hover:bg-gray-50"
                  onClick={() => setShowMoreActionsMenu(!showMoreActionsMenu)}
                >
                  More Actions
                  <ChevronDown size={14} className="tw:ml-0.5 tw:opacity-70" />
                </button>

                {showMoreActionsMenu && (
                  <>
                    <div className="tw:fixed tw:inset-0 tw:z-30" onClick={() => setShowMoreActionsMenu(false)} />
                    <div className="tw:absolute tw:top-full tw:right-0 tw:mt-1.5 tw:bg-white tw:rounded-xl tw:border tw:border-gray-100 tw:shadow-lg tw:p-1.5 tw:z-40 tw:min-w-[160px]">
                      <button
                        className="tw:flex tw:items-center tw:gap-3 tw:w-full tw:px-3 tw:py-2.5 tw:bg-transparent tw:border-none tw:rounded-lg tw:cursor-pointer tw:text-left tw:transition-colors tw:hover:bg-gray-50"
                        onClick={() => {
                          openBulkUpdateModal()
                        }}
                      >
                        <Pencil size={15} className="tw:text-gray-600 tw:shrink-0" />
                        <span className="tw:text-sm tw:font-medium tw:text-gray-800">Update</span>
                      </button>
                      <button
                        className="tw:flex tw:items-center tw:gap-3 tw:w-full tw:px-3 tw:py-2.5 tw:bg-transparent tw:border-none tw:rounded-lg tw:cursor-pointer tw:text-left tw:transition-colors tw:hover:bg-gray-50 tw:text-red-600"
                        onClick={() => {
                          setShowMoreActionsMenu(false);
                          setShowBulkCancelModal(true);
                        }}
                      >
                        <X size={15} className="tw:text-red-600 tw:shrink-0" />
                        <span className="tw:text-sm tw:font-medium">Cancel</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

        </div>



        {/* Tabs and Table Section */}
        <div className="tw:bg-white tw:rounded-3xl tw:shadow-sm tw:border tw:border-gray-100 tw:overflow-hidden">
          <div className="tw:flex tw:items-center tw:px-6 tw:pt-4 tw:border-b tw:border-gray-50">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={cn(
                "tw:px-6 tw:py-4 tw:text-sm tw:font-semibold tw:transition-all tw:relative",
                activeTab === 'upcoming' ? "tw:text-blue-600" : "tw:text-gray-400 tw:hover:text-gray-600"
              )}
            >
              Upcoming
              {activeTab === 'upcoming' && <div className="tw:absolute tw:bottom-0 tw:left-0 tw:right-0 tw:h-0.5 tw:bg-blue-600 tw:rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab('checkedin')}
              className={cn(
                "tw:px-6 tw:py-4 tw:text-sm tw:font-semibold tw:transition-all tw:relative",
                activeTab === 'checkedin' ? "tw:text-blue-600" : "tw:text-gray-400 tw:hover:text-gray-600"
              )}
            >
              Checked In
              {activeTab === 'checkedin' && <div className="tw:absolute tw:bottom-0 tw:left-0 tw:right-0 tw:h-0.5 tw:bg-blue-600 tw:rounded-t-full" />}
            </button>

            {activeTab === 'upcoming' && <div className="tw:ml-auto tw:flex tw:items-center tw:gap-3 tw:pb-4">
              <Button
                variant="ghost"
                className="tw:text-gray-400 tw:hover:text-gray-600"
                onClick={exportHandler}
              >
                <Download size={18} />
              </Button>
              <Button
                variant="ghost"
                className="tw:text-gray-400 tw:hover:text-gray-600"
                onClick={settingModalClickHander}
              >
                <Logs  size={18} />
              </Button>
            </div>}
          </div>

          <div className="tw:p-1 tw:mt-4">
            {activeTab === 'upcoming' ? (
              <>
                <div style={{ height: 600, width: "100%" }} className="tw:ag-theme-quartz">
                  <AgGridReact<VisitorsRowsType>
                    rowData={rowData as VisitorsRowsType[]}
                    columnDefs={colDefs}
                    theme={myTheme}
                    defaultColDef={defaultColDef}
                    onCellMouseOver={(e) => {
                      // only show hover card when hovering the fullName column
                      if (e.colDef && e.colDef.field === 'fullName') {
                        handleRowEnter(e.data, e, true);
                      }
                    }}
                    onCellMouseOut={handleRowLeave}
                    loading={isLoading}
                    onSortChanged={onSortChanged}
                    onSelectionChanged={onSelectionChanged}
                    rowSelection="multiple"
                    suppressRowClickSelection={true}
                    className="tw:h-full"
                  />
                </div>


                <div className="tw:px-4 tw:py-3 tw:border-t tw:border-gray-50">
                  <GridFooter
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    totalRecords={data?.totalRecords || 0}
                    onPageChange={handlePageChange}
                  />
                </div>
              </>
            ) : (
              <div className="tw:-m-1">
                <PastVisitors
                  searchTerm={debouncedSearchTerm}
                  dateRange={dateRange}
                  siteId={locationFilter}
                  visitorTypeId={typeFilter}
                  groupName={debouncedGroupName}
                  pageSize={pageSize}
                  viewAs={viewAs}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <ColumnSettingsModal
        isOpen={showSettingModal}
        onClose={() => setShowSettingModal(false)}
      />
      {showPreRegistrationModal && (
        <PreRegistrationModal
          isOpen={showPreRegistrationModal}
          onClose={closePreRegistrationModalHandler}
          status={modalStatus}
          visitId={selectedVisitId}
        />
      )}
      <BulkCancelModal
        isOpen={showBulkCancelModal}
        onClose={() => setShowBulkCancelModal(false)}
        selectedIds={selectedRowIds}
        onSuccess={() => setSelectedRowIds([])}
      />
      <BulkUpdateModal
        isOpen={showBulkUpdateModal}
        onClose={() => setShowBulkUpdateModal(false)}
        selectedIds={selectedRowIds}
        onSuccess={() => setSelectedRowIds([])}
      />
      {showCancelRecurrence && (
        <CancelRecurrenceModal
          isOpen={showCancelRecurrence}
          onClose={() => setShowCancelRecurrence(false)}
          onNext={(type) => {
            setCancelUpdateType(type);
            setShowCancelRecurrence(false);
            setShowCancelConfirmation(true);
          }}
          visitDate={visitorToCancel?.scheduleCheckinDate ? format(new Date(visitorToCancel.scheduleCheckinDate), 'MMM dd, yyyy') : ""}
        />
      )}
      {showCancelConfirmation && visitorToCancel && (
        <CancelVisitModal
          isOpen={showCancelConfirmation}
          onClose={() => setShowCancelConfirmation(false)}
          visitorId={visitorToCancel.id}
          onSuccess={() => { }}
          updateType={cancelUpdateType}
        />
      )}

       {hoveredVisitor && hoverAnchor && (
              <HoverCard
                visitor={hoveredVisitor}
                isUpcoming={hoverIsUpcoming}
                anchorRect={hoverAnchor}
                containerRef={containerRef}
              />
            )}
    </div>

  );
};

export default UpcommingVisitors;
