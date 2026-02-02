import React, { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import {
  RotateCw,
  Search,
  FileText,
  X,
  User,
  Mail,
  Phone,
  Briefcase,
  Clock,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { usePastVisitors } from "../hooks/usePastVisitors";
import type { VisitRecord } from "../hooks/usePastVisitors";

import { Input } from "@visitly/ui";
import { GridFooter } from "../components/GridFooter";
import { VisitorDetailsModal } from "../components/VisitorDetailsModal";

const PastVisitors: React.FC = () => {
  const {
    rowData,
    totalRecords,
    isLoading,
    pageIndex,
    searchTerm,
    setSearchTerm,
    handlePageChange,
    pageSize,
    handlePageSizeChange,
    refetch,
    isModalOpen,
    selectedVisitor,
    selectedVisitorDetail,
    openVisitorDetails,
    closeVisitorDetails,
  } = usePastVisitors();

  // Column Definitions
  const colDefs = useMemo<ColDef<VisitRecord>[]>(
    () => [
      {
        headerName: "Name",
        field: "fullName",
        flex: 2,
        minWidth: 200,
        cellRenderer: (params: ICellRendererParams<VisitRecord>) => {
          const data = params.data;
          if (!data) return null;
          return (
            <div className="tw:flex tw:items-center tw:gap-3">
              <img
                src={data.avatarUri || "/assets/images/defaultuser.jpg"}
                alt={data.fullName}
                className="tw:w-8 tw:h-8 tw:rounded-full tw:object-cover tw:border tw:border-gray-200"
              />
              <button
                onClick={() => openVisitorDetails(data)}
                className="tw:text-blue-600 tw:hover:text-blue-800 tw:underline tw:font-medium tw:text-left tw:transition-colors"
              >
                {data.fullName}
              </button>
            </div>
          );
        },
      },
      {
        headerName: "Company",
        field: "companyName",
        flex: 1.5,
        minWidth: 150,
        valueFormatter: (params) => params.value || "-",
      },
      {
        headerName: "Purpose",
        field: "visitorType",
        flex: 1,
        minWidth: 120,
      },
      {
        headerName: "Sign In",
        field: "checkinTime",
        flex: 1.5,
        minWidth: 180,
        valueFormatter: (params) => {
          if (!params.value) return "-";
          try {
            return format(new Date(params.value), "dd MMM yy h:mm a");
          } catch (e) {
            return params.value;
          }
        },
      },
      {
        headerName: "Sign Out",
        field: "checkoutTime",
        flex: 1.5,
        minWidth: 180,
        valueFormatter: (params) => {
          if (!params.value) return "-";
          try {
            return format(new Date(params.value), "dd MMM yy h:mm a");
          } catch (e) {
            return params.value;
          }
        },
      },
    ],
    [openVisitorDetails],
  );

  // Default Column properties
  const defaultColDef = useMemo<ColDef>(
    () => ({
      sortable: true,
      filter: true,
      resizable: true,
      // floatingFilter: true,
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

  return (
    <div className="tw:p-4 md:tw:p-6 tw:bg-gray-50 tw:min-h-screen tw:font-sans">
      <div className="tw:w-full tw:mx-auto">
        {/* Header Section */}
        <header className="tw:mb-6 tw:flex tw:flex-col sm:tw:flex-row tw:justify-between tw:items-start sm:tw:items-center tw:gap-4">
          <div>
            <div className="tw:flex tw:items-center tw:gap-2">
              <h1 className="tw:text-2xl tw:font-bold tw:text-gray-900 tw:italic">
                My Visitors
              </h1>
              <button
                onClick={() => refetch()}
                className="tw:p-2 tw:text-gray-500 tw:hover:text-blue-600 tw:transition-colors tw:rounded-full tw:hover:bg-blue-50"
                title="Refresh List"
              >
                <RotateCw
                  size={18}
                  className={isLoading ? "tw:animate-spin" : ""}
                />
              </button>
            </div>
          </div>
        </header>

        {/* Search and Table Container */}
        <div className="tw:bg-white tw:shadow-xl tw:border tw:border-gray-200 tw:overflow-hidden tw:p-4">
          {/* Table Header Controls */}
          <div className="tw:flex tw:flex-col tw:sm:flex-row tw:md:flex-row tw:justify-between tw:items-center tw:gap-4">
            <div className="tw:relative tw:w-full tw:sm:w-[30vw] tw:md:w-[30vw] tw:lg:w-[20vw] tw:w-[20vw]">
              <Search
                className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400"
                size={18}
              />
              <Input
                type="text"
                placeholder="Search visitors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tw:w-full tw:pl-10 tw:pr-4 tw:py-2.5 tw:border tw:border-gray-200 tw:rounded-xl tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-blue-500/20 tw:focus:border-blue-500 tw:transition-all tw:bg-gray-50/50"
              />
            </div>

            <div className="tw:flex tw:items-center tw:gap-3 tw:text-sm tw:text-gray-600">
              <span>Rows Per Page</span>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="tw:border tw:border-gray-200 tw:rounded-lg tw:px-2 tw:py-1.5 tw:focus:outline-none tw:bg-white"
              >
                {[10, 15, 20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* AG Grid Body */}
          <div
            style={{ height: 600, width: "100%" }}
            className="tw:ag-theme-quartz tw:mt-4"
          >
            <AgGridReact<VisitRecord>
              rowData={rowData}
              columnDefs={colDefs}
              defaultColDef={defaultColDef}
              theme={myTheme}
              loading={isLoading}
              overlayNoRowsTemplate="<span className='tw:text-red-900 '>No visitor records found.</span>"
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

      {/* Visitor Details Modal */}
      <VisitorDetailsModal
        isOpen={isModalOpen}
        visitor={selectedVisitorDetail}
        onClose={closeVisitorDetails}
      />
    </div>
  );
};

export default PastVisitors;