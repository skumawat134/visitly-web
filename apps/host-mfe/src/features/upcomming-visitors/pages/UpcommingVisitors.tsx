import { PageHeader } from "@/shared/components";
import { Button, Input, Search } from "@visitly/ui";
import { AgGridReact } from "ag-grid-react";
import { useUpcomingVisitors } from "../hooks/use-upcomming-visitiors";
import type { VisitorsRowsType } from "../types/upcomming-visitors.types";
import { ArrowUpFromLine, Download, Menu, Plus } from "lucide-react";
import ColumnSettingsModal from "../components/CustomSettings";
import { GridFooter } from "@/shared/components/GridFooter";
import { PreRegistrationModal } from "../components/pre-registration/PreRegistration";
export const UpcomingVisitors = () => {
  const {
    search,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    rowData,
    colDefs,
    settingModalClickHander,
    setShowSettingModal,
    showSettingModal,
    exportHandler,
    data,
    onSortChanged,
    closePreRegistrationModalHandler,
    openPreRegistrationModalHandler,
    showPreRegistrationModal,
  } = useUpcomingVisitors();
  const { searchTerm, setSearchTerm } = search;
  const { pageSize, pageIndex } = pagination;
  return (
    <div
      className="tw:p-4 md:tw:p-6 tw:bg-gray-50 tw:min-h-screen tw:font-sans"
      data-test-id="upcoming-visitors-page"
    >
      <div
        className="tw:w-full tw:mx-auto"
        data-test-id="upcoming-visitors-container"
      >
        {/* Header Section */}
        <PageHeader
          header={<>My Visitors</>}
          data-test-id="upcoming-visitors-header"
          config={{ refreshBtn: true, showRightMenu: true }}
          rightMenu={
            <div className="tw:flex tw:items-center tw:gap-4">
              <Button variant="outline" className="tw:rounded-sm">
                <ArrowUpFromLine size={18} className="tw:mr-1" />
                Bulk Pre-Registration
              </Button>
              <Button
                variant="primary"
                className="tw:rounded-sm"
                onClick={openPreRegistrationModalHandler}
              >
                <Plus size={18} className="tw:mr-1" />
                Pre-Register Visit
              </Button>
            </div>
          }
        />
        {/* Search and Table Container */}
        <div
          className="tw:bg-white tw:shadow-xl tw:border tw:border-gray-200 tw:overflow-hidden tw:p-4"
          data-test-id="upcoming-visitors-table-container"
        >
          {/* Table Header Controls */}
          <div
            className="tw:flex tw:flex-col tw:sm:flex-row tw:md:flex-row tw:justify-between tw:items-center tw:gap-4"
            data-test-id="upcoming-visitors-table-header-controls"
          >
            <div
              className="tw:flex justify-between tw:items-center tw:gap-4 tw:w-full tw:sm:w-auto"
              data-test-id="upcoming-visitors-search-section"
            >
              <div
                className="tw:relative tw:w-full tw:sm:w-[30vw] tw:md:w-[30vw] tw:lg:w-[20vw] tw:w-[20vw]"
                data-test-id="upcoming-visitors-search-input-container"
              >
                <Search
                  className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400"
                  size={18}
                  data-test-id="upcoming-visitors-search-icon"
                />
                <Input
                  type="text"
                  placeholder="Search visitors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="tw:w-full tw:pl-10 tw:pr-4 tw:py-2.5 tw:border tw:border-gray-200 tw:rounded-xl tw:focus:outline-none tw:focus:ring-2 tw:focus:ring-blue-500/20 tw:focus:border-blue-500 tw:transition-all tw:bg-gray-50/50"
                  data-test-id="upcoming-visitors-search-input"
                />
              </div>
            </div>
            <div
              className="tw:flex tw:items-center tw:gap-4 "
              data-test-id="upcoming-visitors-controls-section"
            >
              <button
                className="tw:flex tw:items-center tw:cursor-pointer tw:gap-2 tw:border tw:border-gray-500  tw:text-primary-100 tw:px-4 tw:py-1.5 tw:rounded-lg tw:shadow cursor-pointer"
                data-test-id="upcoming-visitors-column-settings-btn"
                onClick={exportHandler}
              >
                <Download size={16} className="tw:mr-2" /> Export
              </button>

              <button
                className="tw:flex tw:items-center tw:cursor-pointer tw:gap-2 tw:border tw:border-gray-500  tw:text-primary-100 tw:px-4 tw:py-1.5 tw:rounded-lg tw:shadow cursor-pointer"
                data-test-id="upcoming-visitors-column-settings-btn"
                onClick={settingModalClickHander}
              >
                <Menu size={16} className="tw:mr-2" /> Column Settings
              </button>
              <div
                className="tw:flex tw:items-center tw:gap-3 tw:text-sm tw:text-gray-600"
                data-test-id="upcoming-visitors-rows-per-page"
              >
                <span>Rows Per Page</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="tw:border tw:border-gray-200 tw:rounded-lg tw:px-2 tw:py-1.5 tw:focus:outline-none tw:bg-white"
                  data-test-id="upcoming-visitors-page-size-select"
                >
                  {[10, 15, 20, 50, 100].map((size) => (
                    <option
                      key={size}
                      value={size}
                      data-test-id={`upcoming-visitors-page-size-option-${size}`}
                    >
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* AG Grid Body */}
          <div
            style={{ height: 600, width: "100%" }}
            className="tw:ag-theme-quartz tw:mt-4"
            data-test-id="upcoming-visitors-aggrid-container"
          >
            <AgGridReact<VisitorsRowsType>
              rowData={rowData as VisitorsRowsType[]}
              columnDefs={colDefs}
              // defaultColDef={defaultColDef}
              // theme={myTheme}
              // loading={isLoading}
              overlayNoRowsTemplate="<span className='tw:text-red-900 '>No visitor records found.</span>"
              rowSelection={{
                mode: "multiRow",
                checkboxes: false,
                headerCheckbox: false,
                enableClickSelection: false,
              }}
              onSortChanged={onSortChanged}
              className="tw:h-full"
              data-test-id="upcoming-visitors-aggrid"
            />
          </div>
          <GridFooter
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalRecords={data?.totalRecords || 0}
            onPageChange={handlePageChange}
          />
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
          status={"Create"}
        />
      )}  
    </div>
  );
};

export default UpcomingVisitors;
