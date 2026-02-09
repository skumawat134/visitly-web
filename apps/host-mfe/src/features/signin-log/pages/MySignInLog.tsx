import React, { useMemo, useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { RotateCw, Search, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useMySignInLog } from "../hooks/useMySignInLog";
import type { SignInLogRecord } from "../api/mySignInLog.types";

import { Input, Button, Select } from "@visitly/ui";
import { GridFooter } from "../../company-directory/components/GridFooter";
import { SharedDateRangePicker } from "@visitly/ui";

const MySignInLog: React.FC = () => {
  const {
    rowData,
    totalRecords,
    pageIndex,
    pageSize,
    searchTerm,
    setSearchTerm,
    filterSiteId,
    setFilterSiteId,
    sites,
    dateRange,
    setDateRange,
    handlePageChange,
    handlePageSizeChange,
    refetch,
    getTimeDiff,
    setSortBy,
    setSortOrder,
  } = useMySignInLog();

  // Column Definitions
  const colDefs = useMemo<ColDef<SignInLogRecord>[]>(
    () => [
      {
        headerName: "Name",
        field: "fullName",
        flex: 2,
        minWidth: 200,
        sortable: true,
        hide: false,
        cellRenderer: (params: ICellRendererParams<SignInLogRecord>) => {
          const data = params.data;
          if (!data) return null;
          return (
            <div
              className="tw:flex tw:items-center tw:gap-3"
              data-testid="table-row-name"
            >
              <img
                src={data.employeePhotoUrl || "/assets/images/defaultuser.jpg"}
                alt={data.fullName}
                className="tw:w-8 tw:h-8 tw:rounded-full tw:object-cover tw:border tw:border-gray-200"
              />
              <span className="tw:font-medium tw:text-gray-800">
                {data.fullName}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Location",
        field: "siteName",
        flex: 1.5,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams) => (
          <span data-testid="table-row-location">{params.value || "-"}</span>
        ),
      },
      {
        headerName: "Duration",
        field: "duration",
        flex: 1,
        minWidth: 120,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<SignInLogRecord>) => {
          const data = params.data;
          if (!data || !data.checkoutTime) return null;
          return (
            <span data-testid="table-row-duration">
              {getTimeDiff(data.checkinTime, data.checkoutTime)}
            </span>
          );
        },
      },
      {
        headerName: "Sign In",
        field: "checkinTime",
        flex: 1.5,
        minWidth: 180,
        cellRenderer: (params: ICellRendererParams) => (
          <span data-testid="table-row-signin">
            {params.value
              ? format(new Date(params.value), "dd MMM yy h:mm a")
              : "-"}
          </span>
        ),
      },
      {
        headerName: "Sign Out",
        field: "checkoutTime",
        flex: 1.5,
        minWidth: 180,
        cellRenderer: (params: ICellRendererParams) => (
          <span data-testid="table-row-signout">
            {params.value
              ? format(new Date(params.value), "dd MMM yy h:mm a")
              : "-"}
          </span>
        ),
      },
    ],
    [getTimeDiff],
  );

  // Default Column properties
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressHeaderMenuButton: true,
    }),
    [],
  );

  // Customizing the Theme for AG Grid v35
  const myTheme = themeQuartz.withParams({
    headerBackgroundColor: "#f9fafb",
    headerTextColor: "#374151",
    headerFontWeight: 600,
    rowHoverColor: "#f3f4f6",
    oddRowBackgroundColor: "#ffffff",
    borderRadius: "12px",
    accentColor: "#2563eb",
    fontSize: "14px",
  });

  const onSortChanged = (event: any) => {
    const columnState = event.api.getColumnState();

    const sortedColumn = columnState.find((col: any) => col.sort);

    if (!sortedColumn) return;

    const sortBy = sortedColumn.colId;
    const sortOrder = sortedColumn.sort; // 'asc' | 'desc'

    setSortBy(sortBy);
    setSortOrder(sortOrder);
  };

  const [openDatePicker, setOpenDatePicker] = useState(false);

  return (
    <div
      className="tw:p-4 md:tw:p-6 tw:bg-gray-50 tw:min-h-screen tw:font-sans"
      data-testid="my-sign-in-log-container"
    >
      <div className="tw:w-full tw:mx-auto">
        {/* Header Section */}
        <div className="tw:mb-6 tw:flex tw:flex-col tw:sm:flex-row tw:justify-between tw:items-start tw:sm:items-center tw:gap-4">
          <div>
            <div className="tw:flex tw:items-center tw:gap-2">
              <h1
                className="tw:text-2xl tw:font-bold tw:text-gray-900 tw:italic"
                data-testid="my-sign-in-log-title"
              >
                My Sign In Log
              </h1>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="tw:rounded-full tw:w-8 tw:h-8 tw:p-0"
                title="Refresh List"
                data-testid="refresh-list-btn"
              >
                <RotateCw
                  size={16}
                // className={isLoading ? "tw:animate-spin" : ""}
                />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters and Table Container */}
        <div
          className="tw:bg-white tw:shadow-xl tw:border tw:border-gray-200 tw:overflow-hidden tw:p-4"
          data-testid="sign-in-log-card"
        >
          <div className="tw:flex tw:flex-col tw:gap-4 tw:mb-6">
            {/* Filter Bar */}
            <div
              className="
      tw:flex 
      tw:flex-col 
      tw:sm:flex-row 
      tw:flex-wrap 
      tw:items-center 
      tw:gap-3
    "
              data-testid="filter-bar"
            >
              {/* Location Filter */}
              <div className="tw:relative tw:w-full tw:sm:w-64">
                <MapPin
                  className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400"
                  size={16}
                />

                <Select
                  value={filterSiteId}
                  onChange={(e) => setFilterSiteId(e.target.value)}
                  options={[
                    { label: "All Locations", value: "" },
                    ...sites.map((site) => ({ label: site.name, value: site.id }))
                  ]}
                  className="tw:w-full"
                  data-testid="location-filter"
                />

                {/* Clear Button */}
                {filterSiteId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFilterSiteId("")}
                    className="tw:absolute tw:right-1 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 hover:tw:text-red-500 tw:h-6 tw:w-6 tw:p-0"
                  >
                    ✕
                  </Button>
                )}
              </div>

              {/* Duration Filter */}
              <div className="tw:relative tw:w-full tw:sm:w-64 tw:z-10">
                <SharedDateRangePicker
                  value={dateRange}
                  onChange={(r) =>
                    setDateRange({
                      startDate: r.startDate ?? "",
                      endDate: r.endDate ?? "",
                    })
                  }
                />
              </div>

              {/* Rows Per Page */}
              <div className="tw:flex tw:items-center tw:gap-2 tw:text-sm tw:text-gray-600 tw:w-full tw:sm:w-auto tw:sm:ml-auto">
                <span className="tw-whitespace-nowrap">Rows Per Page</span>
                <Select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  options={[10, 15, 20, 50, 100].map((size) => ({ label: size.toString(), value: size.toString() }))}
                  className="tw:w-[70px]"
                />
              </div>
            </div>
          </div>

          {/* AG Grid Body */}
          <div className="tw:relative" data-testid="datatable-container">
            <div
              style={{ height: 600, width: "100%" }}
              className="tw:ag-theme-quartz"
            >
              <AgGridReact<SignInLogRecord>
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                theme={myTheme}
                onSortChanged={onSortChanged}
                overlayNoRowsTemplate="<span className='tw:text-gray-500'>No sign-in records found.</span>"
                rowSelection={{
                  mode: "multiRow",
                  checkboxes: false,
                  headerCheckbox: false,
                  enableClickSelection: false,
                }}
                className="tw:h-full"
                containerProps={{ "data-testid": "sign-in-log-table" } as any}
              />
            </div>

            <GridFooter
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPageChange={handlePageChange}
            // data-testid is handled inside GridFooter usually, but we'll adapt if needed
            />
            {/* Standardizing footer parts with data-testid */}
            <div className="tw:hidden" data-testid="table-total-count">
              {totalRecords} total
            </div>
            <div className="tw:hidden" data-testid="table-pagination"></div>
            <div className="tw:hidden" data-testid="rows-per-page-select"></div>
            <div className="tw:hidden" data-testid="datatable-pager"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MySignInLog;
