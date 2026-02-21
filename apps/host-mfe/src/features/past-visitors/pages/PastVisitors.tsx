import React, { useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  themeQuartz,
  type ColDef,
  type ICellRendererParams,
} from "ag-grid-community";
import { format } from "date-fns";
import { usePastVisitors } from "../hooks/usePastVisitors";
import type { VisitRecord } from "../hooks/usePastVisitors";
import { GridFooter } from "../components/GridFooter";
import { useNavigate } from "react-router-dom";
import { NamedAvatar } from "@visitly/ui";

interface PastVisitorsProps {
  searchTerm?: string;
  dateRange?: { startDate: string | null; endDate: string | null };
  siteId?: string;
  visitorTypeId?: string;
  groupName?: string;
  pageSize : number;
  viewAs? : string
}

const PastVisitors: React.FC<PastVisitorsProps> = (props) => {
  const navigate = useNavigate();
  const {
    rowData,
    totalRecords,
    isLoading,
    pageIndex,
    handlePageChange,
    pageSize,
  } = usePastVisitors(props);

  const redirectToVisitorDetailPage = (data: any) => {
    if (!data?.id) return;
    const url = `/host/visitor-detail/${data.id}?source=pastVisitors`;
    navigate(url);
  }

  // Column Definitions
  const colDefs = useMemo<ColDef<VisitRecord>[]>(
    () => [
      {
             headerName: "Full Name",
             field: "fullName",
             flex: 2,
             minWidth: 200,
             cellRenderer: (params: ICellRendererParams) => {
               const data = params.data;
               if (!data) return null;
               return (
                 <div className="tw:flex tw:items-center tw:gap-2.5 tw:h-full" onClick={() => redirectToVisitorDetailPage(data)}>
                   <NamedAvatar url={data.visitPhotoURI} name={data.fullName} size={30} />
                   <div className="tw:min-w-0 tw:leading-tight">
                     <div className="tw:text-sm tw:font-medium tw:text-gray-800 tw:truncate">
                       {data.fullName}
                     </div>
                     <div className="tw:text-xs tw:text-gray-400 tw:truncate">
                       {data.email}
                     </div>
                   </div>
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
        headerName: "Group Name",
        field: "groupName",
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
    [],
  );

  // Default Column properties
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


  return (
    <div className="tw:w-full">
      {/* AG Grid Body */}
      <div
        style={{ height: 600, width: "100%" }}
        className="tw:ag-theme-quartz"
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
  );
};

export default PastVisitors;