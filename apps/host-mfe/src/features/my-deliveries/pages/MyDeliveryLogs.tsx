import React, { useMemo, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import {
  RotateCw,
  Filter,
  MapPin,
  ChevronDown,
  Box,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { cn } from "@visitly/ui";
import { format } from "date-fns";
import { useMyDeliveryLogs } from "../hooks/useMyDeliveryLogs";
import {
  DeliveryLogStatus,
  type DeliveryLogRecord,
} from "../api/myDeliveryLogs.types";
import { PickupConfirmDialog } from "../components/PickupConfirmDialog";

import { Button, LocationSelect, Select } from "@visitly/ui";
import DateRangePicker from "../../../shared/components/DateRangePicker";

// Shared component placeholder as requested

import { GridFooter } from "../../past-visitors/components/GridFooter";
import { MyDeliveryLogsModal } from "../components/MyDeliveryLogsModal";
import { PageDescription } from "@/shared/components/PageDescription";

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
    siteAreaId,
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
    setSortOrder,
    deliveryAreas,
    viewAs,
    setViewAs,
    delegates,
  } = useMyDeliveryLogs();

  const siteOptions = [
    { value: "", label: "All Locations" },
    ...sites.map((site) => ({
      value: site.id,
      label: site.name,
    })),
  ];

  const deliveryAreaOptions = [
    { value: "", label: "All Area" },
    ...deliveryAreas.map((area) => ({
      value: area.id,
      label: area.name,
    })),
  ];

  const activeDelegateName = delegates.find(
    (d: { id: string; name: string }) => d.id === viewAs,
  )?.name;

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
              data-testid={`package-image-${params.node?.rowIndex ?? 0}`}
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
              data-testid={`recipient-name-${params.node?.rowIndex ?? 0}`}
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
          <span data-testid={`carrier-name-${params.node?.rowIndex ?? 0}`}>
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
          <span
            data-testid={`column-siteDeliveryAreaName-${params.node?.rowIndex ?? 0}`}
          >
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
          <span data-testid={`column-siteName-${params.node?.rowIndex ?? 0}`}>
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
              data-testid={`status-${params.node?.rowIndex ?? 0}`}
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
          <span data-testid={`received-date-${params.node?.rowIndex ?? 0}`}>
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
              <span data-testid={`pickup-date-${params.node?.rowIndex ?? 0}`}>
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
                data-testid={`mark-pickedup-button-${params.node?.rowIndex ?? 0}`}
              >
                Mark As Picked Up
              </button>
            );
          }
          return "-";
        },
      },
      //     {
      //       headerName: "Action",
      //       flex: 1.5,
      //       minWidth: 240,
      //       cellRenderer: (params: ICellRendererParams<DeliveryLogRecord>) => {
      //         const data = params.data;
      //         if (!data) return null;
      //         if (!data.pickupD && data.status === DeliveryLogStatus.PENDING) {
      //           return (
      //             <div className="tw:flex gap-2 tw:justify-center tw:items-center">
      //               <button
      //                 onClick={() => {
      //                   setSelectedPackage(data);
      //                   setIsPickupConfirmOpen(true);
      //                 }}
      //                 title="Mark picked up"
      //                 className="
      //   tw:inline-flex tw:items-center tw:gap-1
      //   tw:px-2.5 tw:py-1
      //   tw:text-xs tw:font-semibold
      //   tw:rounded-md
      //   tw:border-0
      //   tw:bg-[#d1fae5] tw:text-emerald-800
      //   hover:tw:bg-emerald-200
      //   tw:transition-all tw:duration-150
      // "
      //                 data-testid={`mark-pickedup-button-${params.node?.rowIndex ?? 0}`}
      //               >
      //                 <CheckCircle size={12} />
      //                 Pick up
      //               </button>
      //               <button
      //                 onClick={() =>
      //             updateStatus({
      //               id: data.id,
      //               status: DeliveryLogStatus.DISCARD,
      //               pickupD: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
      //             })
      //           }
      //                 title="Discard"
      //                 className="
      //   tw:inline-flex tw:items-center tw:gap-1
      //   tw:px-2.5 tw:py-1
      //   tw:text-xs tw:font-medium
      //   tw:rounded-md
      //   tw:border tw:border-gray-200
      //   tw:bg-white tw:text-gray-500
      //   hover:tw:text-red-500
      //   hover:tw:border-red-300
      //   hover:tw:bg-red-50
      //   tw:transition-all tw:duration-150
      // "
      //               >
      //                 <Trash2 size={12} />
      //                 Discard
      //               </button>
      //             </div>
      //           );
      //         }
      //         return "-";
      //       },
      //     },
    ],
    [
      getRecipientName,
      setSelectedPackage,
      setIsDetailsModalOpen,
      setIsPickupConfirmOpen,
    ],
  );

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
        "tw:text-[11px] tw:uppercase tw:tracking-wider tw:font-semibold tw:text-gray-400",
    }),
    [],
  );

  const onSortChanged = (event: any) => {
    const columnState = event.api.getColumnState();

    const sortedColumn = columnState.find((col: any) => col.sort);

    if (!sortedColumn) return;

    const sortBy = sortedColumn.colId;
    const sortOrder = sortedColumn.sort; // 'asc' | 'desc'

    setSortBy(sortBy);
    setSortOrder(sortOrder);
  };

  // ── Pending count (always unfiltered) ──
  const pendingCount = rowData?.filter(
    (d) => d.status === DeliveryLogStatus.PENDING,
  ).length || 0;

  return (
    <div className="tw:min-h-screen tw:bg-[#F8FAFC] tw:pb-12 tw:font-sans">
      {/* ── Page Header ──────────────────────────────────────────────────── */}

      <PageDescription
        title="Deliveries"
        description="Track and manage packages across your locations"
        badge={{
          count: pendingCount,
          label: "pending pickup",
        }}
      />

      <div className="tw:max-w-full tw:mx-auto tw:px-6">
        {/* ── View-As Switcher ──────────────────────────────────────────── */}
        <div className="tw:flex tw:items-center tw:gap-1.5">
          <div className="tw:flex tw:items-center tw:gap-0.5 tw:bg-gray-100 tw:p-0.5 tw:rounded-xl">
            <button
              onClick={() => setViewAs("all")}
              className={cn(
                "tw:px-3.5 tw:py-1.5 tw:rounded-lg tw:text-[13px] tw:whitespace-nowrap tw:transition-all",
                viewAs === "all"
                  ? "tw:bg-white tw:text-indigo-600 tw:font-semibold tw:shadow-sm"
                  : "tw:text-gray-500 tw:font-medium",
              )}
            >
              All
            </button>
            <button
              onClick={() => setViewAs("myself")}
              className={cn(
                "tw:px-3.5 tw:py-1.5 tw:rounded-lg tw:text-[13px] tw:whitespace-nowrap tw:transition-all",
                viewAs === "myself"
                  ? "tw:bg-white tw:text-indigo-600 tw:font-semibold tw:shadow-sm"
                  : "tw:text-gray-500 tw:font-medium",
              )}
            >
              My Packages
            </button>
          </div>

          <div className="tw:relative">
            <select
              value={activeDelegateName ? viewAs : ""}
              onChange={(e) => e.target.value && setViewAs(e.target.value)}
              className={cn(
                "tw:appearance-none tw:pl-3 tw:pr-8 tw:py-1.5 tw:rounded-xl tw:text-[13px] tw:font-medium tw:cursor-pointer tw:outline-none tw:min-w-[160px] tw:border tw:transition-all",
                activeDelegateName
                  ? "tw:border-indigo-600 tw:bg-indigo-50 tw:text-indigo-600"
                  : "tw:border-gray-200 tw:bg-white tw:text-gray-500",
              )}
            >
              <option value="" disabled>
                View as delegate...
              </option>
              {delegates.map((d: { id: string; name: string }) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className={cn(
                "tw:absolute tw:right-2.5 tw:top-1/2 tw:-translate-y-1/2 tw:pointer-events-none",
                activeDelegateName ? "tw:text-indigo-600" : "tw:text-gray-400",
              )}
            />
          </div>
        </div>

        {/* ── Filter Bar Card ───────────────────────────────────────────── */}
        <div className="tw:bg-transparent tw:rounded-[12px] tw:p-6 tw:mb-8">
          <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-6 tw:mb-4 ">
            <div className="tw:relative tw:flex-1 tw:min-w-[200px] tw:border tw:border-slate-200/60 tw:rounded-lg">
              <div className="tw:absolute tw:left-4 tw:top-1/2 tw:-translate-y-1/2 tw:text-slate-400 ">
                <Filter size={18} />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="tw:w-full tw:pl-12 tw:pr-10 tw:py-3.5 tw:rounded-2xl tw:bg-slate-50 tw:border-none tw:text-slate-700 tw:text-[14px] tw:font-bold tw:appearance-none focus:tw:ring-2 focus:tw:ring-indigo-500/20 tw:transition-all tw:cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value={DeliveryLogStatus.PENDING}>Pending</option>
                <option value={DeliveryLogStatus.PICKEDUP}>Picked Up</option>
                <option value={DeliveryLogStatus.DISCARD}>Discarded</option>
              </select>
              <ChevronDown
                size={16}
                className="tw:absolute tw:right-4 tw:top-1/2 tw:-translate-y-1/2 tw:text-slate-400 tw:pointer-events-none"
              />
            </div>

            <div className="tw:relative tw:flex-1 tw:min-w-[220px] tw:border tw:border-slate-200/60 tw:rounded-lg">
              <div className="tw:absolute tw:left-4 tw:top-1/2 tw:-translate-y-1/2 tw:text-slate-400">
                <MapPin size={18} />
              </div>
              <select
                value={filterSiteId}
                onChange={(e) => setFilterSiteId(e.target.value)}
                className="tw:w-full tw:pl-12 tw:pr-10 tw:py-3.5 tw:rounded-2xl tw:bg-slate-50 tw:border-none tw:text-slate-700 tw:text-[14px] tw:font-bold tw:appearance-none focus:tw:ring-2 focus:tw:ring-indigo-500/20 tw:transition-all tw:cursor-pointer"
              >
                {siteOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="tw:absolute tw:right-4 tw:top-1/2 tw:-translate-y-1/2 tw:text-slate-400 tw:pointer-events-none"
              />
            </div>
            <div className="tw:relative tw:flex-1 tw:min-w-[220px] tw:border tw:border-slate-200/60 tw:rounded-lg">
              <div className="tw:absolute tw:left-4 tw:top-1/2 tw:-translate-y-1/2 tw:text-slate-400">
                <MapPin size={18} />
              </div>
              <select
                value={siteAreaId}
                onChange={(e) => setSiteAreaId(e.target.value)}
                className="tw:w-full tw:pl-12 tw:pr-10 tw:py-3.5 tw:rounded-2xl tw:bg-slate-50 tw:border-none tw:text-slate-700 tw:text-[14px] tw:font-bold tw:appearance-none focus:tw:ring-2 focus:tw:ring-indigo-500/20 tw:transition-all tw:cursor-pointer"
              >
                {deliveryAreaOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="tw:absolute tw:right-4 tw:top-1/2 tw:-translate-y-1/2 tw:text-slate-400 tw:pointer-events-none"
              />
            </div>
          </div>
          <div className="tw:flex-[1.5] tw:min-w-[320px]">
            <DateRangePicker
              value={dateRange}
              onChange={(val: any) => setDateRange(val)}
            />
          </div>
        </div>

        {/* ── Table Container ───────────────────────────────────────────── */}
        <div className="tw:bg-white tw:rounded-[32px] tw:border tw:border-slate-200/60 tw:shadow-sm tw:overflow-hidden">
          <div
            style={{ height: 650, width: "100%" }}
            className="tw:ag-theme-quartz"
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
