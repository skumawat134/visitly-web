import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { RotateCw, Filter, MapPin } from "lucide-react";
import { format } from "date-fns";
import { useMyDeliveryLogs } from "../hooks/useMyDeliveryLogs";
import {
  DeliveryLogStatus,
  type DeliveryLogRecord,
} from "../api/myDeliveryLogs.types";
import { PickupConfirmDialog } from "../components/PickupConfirmDialog";

import {
  Button,
  LocationSelect,
  Select,
  SharedDateRangePicker,
} from "@visitly/ui";

// Shared component placeholder as requested

import { GridFooter } from "../../past-visitors/components/GridFooter";
import { MyDeliveryLogsModal } from "../components/MyDeliveryLogsModal";

const MyDeliveryLogs: React.FC = () => {
  const {
    rowData,
    totalRecords,
    isLoading,
    pageIndex,
    pageSize,
    selectedStatus,
    setSelectedStatus,
    filterSiteId,
    setFilterSiteId,
    setSiteAreaId,
    sites,
    dateRange,
    setDateRange,
    handlePageChange,
    handlePageSizeChange,
    refetch,
    getRecipientName,
    getCarrierName,
    selectedPackage,
    setSelectedPackage,
    isDetailsModalOpen,
    setIsDetailsModalOpen,
    isPickupConfirmOpen,
    setIsPickupConfirmOpen,
    setIsNotMyDeliveryOpen,
    updateStatus,
    updateLog,
    setSortBy,
    setSortOrder
  } = useMyDeliveryLogs();

  const siteOptions = [
    { value: "", label: "All Locations" },
    ...sites.map((site) => ({
      value: site.id,
      label: site.name,
    })),
  ];
  // Column Definitions
  const colDefs = useMemo<ColDef<DeliveryLogRecord>[]>(
    () => [
      {
        headerName: "",
        field: "labelUri",
        width: 80,
        sortable: false,
        filter: false,
        cellRenderer: (params: ICellRendererParams<DeliveryLogRecord>) => {
          const data = params.data;
          if (!data) return null;
          return (
            <div
              className="tw:flex tw:items-center tw:justify-center tw:py-2 tw:cursor-pointer"
              onClick={() => {
                setSelectedPackage(data);
                setIsDetailsModalOpen(true);
              }}
              data-testid={`package-image-${params.rowIndex}`}
            >
              <img
                src={data.labelUri || "/assets/images/defaultuser.jpg"}
                alt="Package"
                className="tw:w-10 tw:h-10 tw:rounded-lg tw:object-cover tw:border tw:border-gray-200"
                data-testid="package-thumbnail"
              />
            </div>
          );
        },
      },
      {
        headerName: "Recipient Name",
        field: "recipientFirstName",
        flex: 2,
        minWidth: 180,
        sortable: false,
        cellRenderer: (params: ICellRendererParams<DeliveryLogRecord>) => {
          const data = params.data;
          if (!data) return null;
          return (
            <button
              onClick={() => {
                setSelectedPackage(data);
                setIsDetailsModalOpen(true);
              }}
              className="tw:text-blue-600 tw:hover:text-blue-800 tw:underline tw:font-medium tw:text-left tw:transition-colors"
              data-testid={`recipient-name-${params.rowIndex}`}
            >
              {getRecipientName(data)}
            </button>
          );
        },
      },
      {
        headerName: "Carrier Name",
        field: "carrier",
        flex: 1.5,
        minWidth: 150,
        sortable: false,
        cellRenderer: (params: ICellRendererParams) => (
          <span data-testid={`carrier-name-${params.rowIndex}`}>
            {params.value || "Unknown Carrier"}
          </span>
        ),
      },
      {
        headerName: "Delivery Area",
        field: "siteDeliveryAreaName",
        flex: 1.5,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams) => (
          <span data-testid={`column-siteDeliveryAreaName-${params.rowIndex}`}>
            {params.value || "-"}
          </span>
        ),
      },
      {
        headerName: "Location",
        field: "siteName",
        flex: 1.5,
        minWidth: 150,
        cellRenderer: (params: ICellRendererParams) => (
          <span data-testid={`column-siteName-${params.rowIndex}`}>
            {params.value || "-"}
          </span>
        ),
      },
      {
        headerName: "Status",
        field: "status",
        flex: 1,
        minWidth: 120,
        cellRenderer: (params: ICellRendererParams<DeliveryLogRecord>) => {
          const status = params.value;
          let colorClass = "tw:bg-gray-100 tw:text-gray-700";
          if (status === DeliveryLogStatus.PENDING)
            colorClass = "tw:bg-yellow-100 tw:text-yellow-700";
          else if (status === DeliveryLogStatus.PICKEDUP)
            colorClass = "tw:bg-green-100 tw:text-green-700";
          else if (
            status === DeliveryLogStatus.DISCARD ||
            status === DeliveryLogStatus.DISPOSED
          )
            colorClass = "tw:bg-red-100 tw:text-red-700";

          return (
            <div
              className="tw:flex tw:items-center tw:h-full"
              data-testid={`status-${params.rowIndex}`}
            >
              <span
                className={`tw:px-3 tw:py-1 tw:rounded-full tw:text-xs tw:font-bold tw:uppercase tw:tracking-wider ${colorClass}`}
              >
                {status}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Received Date",
        field: "receiveD",
        flex: 1.5,
        minWidth: 180,
        cellRenderer: (params: ICellRendererParams) => (
          <span data-testid={`received-date-${params.rowIndex}`}>
            {params.value
              ? format(new Date(params.value), "dd MMM yy h:mm a")
              : "-"}
          </span>
        ),
      },
      {
        headerName: "Pick-up Date",
        field: "pickupD",
        flex: 1.5,
        minWidth: 180,
        cellRenderer: (params: ICellRendererParams<DeliveryLogRecord>) => {
          const data = params.data;
          if (!data) return null;
          if (data.pickupD) {
            return (
              <span data-testid={`pickup-date-${params.rowIndex}`}>
                {format(new Date(data.pickupD), "dd MMM yy h:mm a")}
              </span>
            );
          }
          if (data.status === DeliveryLogStatus.PENDING) {
            return (
              <button
                onClick={() => {
                  setSelectedPackage(data);
                  setIsPickupConfirmOpen(true);
                }}
                className="tw:text-blue-600 tw:hover:text-blue-800 tw:underline tw:text-sm tw:font-medium"
                data-testid={`mark-pickedup-button-${params.rowIndex}`}
              >
                Mark As Picked Up
              </button>
            );
          }
          return "-";
        },
      },
    ],
    [
      getRecipientName,
      setSelectedPackage,
      setIsDetailsModalOpen,
      setIsPickupConfirmOpen,
    ],
  );

  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      suppressHeaderMenuButton: true,
    }),
    [],
  );

  const myTheme = themeQuartz.withParams({
    headerBackgroundColor: "#f9fafb",
    headerTextColor: "#111",
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

  return (
    <div className="tw:p-4 md:tw:p-6 tw:bg-gray-50 tw:min-h-screen tw:font-sans">
      <div className="tw:w-full tw:mx-auto">
        {/* Header Section */}
        <div className="tw:mb-8 tw:flex tw:flex-col sm:tw:flex-row tw:justify-between tw:items-start sm:tw:items-center tw:gap-4">
          <div className="tw:flex tw:items-center tw:gap-3">
            <h1
              className="tw:text-3xl tw:font-black tw:text-gray-900 tw:tracking-tight tw:italic"
              data-testid="page-title"
            >
              My Deliveries
            </h1>
            <button
              onClick={() => refetch()}
              className="tw:p-2.5 tw:text-gray-500 tw:hover:text-blue-600 tw:transition-all tw:rounded-xl tw:hover:bg-blue-50 tw:border tw:border-transparent hover:tw:border-blue-100"
              title="Refresh List"
              data-testid="refresh-button"
            >
              <RotateCw
                size={20}
                className={isLoading ? "tw:animate-spin" : ""}
              />
            </button>
          </div>
        </div>

        {/* Filters and Actions Container */}
        <div
          className="tw:bg-white tw:shadow-2xl tw:shadow-blue-900/5 tw:border tw:border-gray-200 tw:rounded-2xl tw:overflow-hidden"
          data-testid="delivery-card"
        >
          <div className="tw:p-6">
            {/* Filter Bar */}
            <div
              className="tw:flex tw:flex-col lg:tw:flex-row tw:justify-between tw:items-start lg:tw:items-center tw:gap-6 tw:mb-8"
              data-testid="filter-section"
            >
              <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-4 tw:w-full">
                <LocationSelect
                  value={filterSiteId}
                  options={siteOptions}
                  onChange={(value) => {
                    setFilterSiteId(value);
                    setSiteAreaId("");
                  }}
                  onClear={() => {
                    setFilterSiteId("");
                    setSiteAreaId("");
                  }}
                  data-testid="location-filter"
                />

                <div className="tw:relative tw:w-full tw:sm:w-64">
                  <Filter
                    className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400"
                    size={16}
                  />

                  {/* <select
                    multiple
                    value={selectedStatus}
                    onChange={(e) => {
                      const values = Array.from(
                        e.target.selectedOptions,
                        (option) => option.value,
                      );
                      setSelectedStatus(values);
                    }}
                    className="tw:w-full tw:pl-10 tw:pr-10 tw:py-2.5 tw:border tw:border-gray-200 tw:rounded-xl tw:bg-gray-50/50 tw:text-sm tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-blue-500/20"
                    data-testid="status-filter"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Picked up">Picked Up</option>
                    <option value="Discard">Discard</option>
                  </select> */}

                  <div className="tw:relative tw:w-full tw:sm:w-64">
                    <Filter
                      className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400"
                      size={16}
                    />

                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="tw:w-full tw:pl-10 tw:pr-10 tw:py-2.5 tw:border tw:border-gray-200 tw:rounded-xl tw:bg-gray-50/50 tw:text-sm tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-blue-500/20 tw:appearance-none"
                      data-testid="status-filter"
                    >
                      <option value="">All Status</option>
                      <option value="Pending">Pending</option>
                      <option value="Picked up">Picked Up</option>
                      <option value="Discard">Discard</option>
                    </select>

                    {/* Clear Button */}
                    {selectedStatus && (
                      <span
                        onClick={() => setSelectedStatus("")}
                        className="tw:absolute tw:right-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 hover:tw:text-red-500 tw:transition"
                        title="Clear Status Filter"
                      >
                        ✕
                      </span>
                    )}
                  </div>

                  {selectedStatus.length > 0 && (
                    <span
                      onClick={() => setSelectedStatus([])}
                      className="tw:absolute tw:right-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 hover:tw:text-red-500 tw:transition"
                      title="Clear Status Filter"
                    >
                      ✕
                    </span>
                  )}
                </div>

                <SharedDateRangePicker
                  value={dateRange}
                  onChange={(r: any) =>
                    setDateRange({
                      startDate: r.startDate ?? "",
                      endDate: r.endDate ?? "",
                    })
                  }
                />
              </div>
              <div className="tw:flex tw:items-center tw:gap-3 tw:text-sm tw:text-gray-500 tw:font-medium">
                <span>Rows Per Page</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="tw:border tw:border-gray-200 tw:rounded-lg tw:px-3 tw:py-1.5 tw:focus:outline-none tw:bg-white tw:text-gray-900 tw:appearance-none"
                  data-testid="rows-per-page-selector"
                >
                  {[15, 50, 100, 250].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table Area */}
            <div
              style={{ height: 600, width: "100%" }}
              className="tw:ag-theme-quartz tw:rounded-xl tw:overflow-hidden tw:border tw:border-gray-100"
              data-testid="datatable-container"
            >
              <AgGridReact<DeliveryLogRecord>
                rowData={rowData}
                columnDefs={colDefs}
                defaultColDef={defaultColDef}
                theme={myTheme}
                loading={isLoading}
                onSortChanged={onSortChanged}
                rowHeight={64}
                overlayNoRowsTemplate="<span className='tw:text-gray-500 tw:font-medium'>No deliveries found.</span>"
                rowSelection={{
                  mode: "multiRow",
                  checkboxes: false,
                  headerCheckbox: false,
                  enableClickSelection: false,
                }}
                className="tw:h-full"
                containerProps={
                  { "data-testid": "deliveries-datatable" } as any
                }
              />
            </div>

            <GridFooter
              pageIndex={pageIndex}
              pageSize={pageSize}
              totalRecords={totalRecords}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>

      {/* Details & Update Modal */}
      <MyDeliveryLogsModal
        isOpen={isDetailsModalOpen}
        packageItem={selectedPackage}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPackage(null);
        }}
        onUpdate={(id, payload) => updateLog({ id, payload })}
        onUpdateStatus={(id, status, pickupD) =>
          updateStatus({ id, status, pickupD })
        }
        onNotMyDelivery={() => setIsNotMyDeliveryOpen(true)}
      />

      {/* Pick Up Confirmation Modal */}
      <PickupConfirmDialog
        open={isPickupConfirmOpen}
        onOpenChange={setIsPickupConfirmOpen}
        selectedPackage={selectedPackage}
        onConfirm={(payload) => updateStatus(payload)}
      />
    </div>
  );
};

export default MyDeliveryLogs;
