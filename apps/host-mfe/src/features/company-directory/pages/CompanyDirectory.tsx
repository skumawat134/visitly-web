import React, { useMemo } from "react";
import {
  RotateCw,
  Search,
  Mail,
  Phone,
  Building,
  User,
  ArrowUpDown,
  Filter,
  Users,
  SearchCheck,
  SearchX
} from "lucide-react";
import { useCompanyDirectory } from "../hooks/useCompanyDirectory";
import { Input, cn } from "@visitly/ui";
import { GridFooter } from "../components/GridFooter";
import { CompanyDirectoryModal } from "../components/CompanyDirectoryModal";
import DirectoryCard from "../components/DirectoryCard";
import { PageDescription } from "@/shared/components/PageDescription";

const CompanyDirectory: React.FC = () => {
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
    selectedUserDetail,
    openViewUserModal,
    closeViewUserModal,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
  } = useCompanyDirectory();

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="tw:min-h-screen tw:bg-[#F8FAFC] tw:pb-4">
      {/* Page Header - Premium Style */}
      <PageDescription  title='Company Directory' description="Find and connect with colleagues across the organization" />

      <div className="tw:max-w-full tw:mx-auto tw:px-4">
        {/* Controls Section - Floating Style */}
        <div className="tw:bg-white tw:p-2 tw:shadow-[0_8px_30px_rgb(0,0,0,0.04)] tw:border tw:border-slate-200/50 tw:mb-4">
          <div className="tw:flex tw:flex-col tw:lg:flex-row tw:justify-between tw:items-center tw:gap-6">
            <div className="tw:relative tw:w-full tw:lg:max-w-md">
              <Search
                className="tw:absolute tw:left-4 tw:top-1/2 tw:-translate-y-1/2 tw:text-slate-400"
                size={18}
              />
              <Input
                type="text"
                leftIcon={<Search />  }
                placeholder="Search colleagues by name, email, department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="tw:w-full tw:pl-12 tw:pr-4 tw:py-3.5 tw:text-[15px] tw:border-slate-200 tw:rounded-2xl tw:focus:ring-4 tw:focus:ring-indigo-500/10 tw:focus:border-indigo-500 tw:transition-all tw:bg-slate-50/50 tw:placeholder:text-slate-400"
              />
            </div>

            <div className="tw:flex tw:items-center tw:gap-4 tw:w-full tw:lg:w-auto">
              {/* <div className="tw:flex tw:items-center tw:gap-2 tw:p-1.5 tw:bg-slate-50 tw:rounded-xl tw:border tw:border-slate-200/60">
                <div className="tw:px-3 tw:py-1.5 tw:text-xs tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-wider">
                  Sort
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="tw:bg-transparent tw:text-sm tw:font-bold tw:text-slate-700 tw:pr-8 tw:pl-2 tw:py-1.5 tw:focus:outline-none tw:cursor-pointer"
                >
                  <option value="firstName">Name</option>
                  <option value="email">Email</option>
                  <option value="department">Department</option>
                </select>
                <button
                  onClick={toggleSortOrder}
                  className="tw:p-1.5 tw:bg-white tw:rounded-lg tw:border tw:border-slate-200 tw:text-slate-600 tw:hover:text-indigo-600 tw:hover:border-indigo-100 tw:transition-all tw:active:scale-90"
                >
                  <ArrowUpDown size={16} />
                </button>
              </div> */}

              <div className="tw:h-8 tw:w-px tw:bg-slate-200/60 tw:hidden tw:lg:block" />

              <div className="tw:flex tw:items-center tw:gap-3 tw:text-sm">
                <span className="tw:text-slate-500 tw:font-medium">Rows</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:px-3 tw:py-2 tw:text-sm tw:font-bold tw:text-slate-700 tw:focus:ring-2 tw:focus:ring-indigo-500/20 tw:cursor-pointer"
                >
                  {[24, 48, 96, 200].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Directory Grid */}
        {isLoading && rowData.length === 0 ? (
          <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:lg:grid-cols-3 tw:xl:grid-cols-4 tw:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="tw:h-64 tw:bg-white tw:rounded-[28px] tw:animate-pulse tw:border tw:border-slate-100" />
            ))}
          </div>
        ) : rowData.length === 0 ? (
          <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-20 tw:bg-white tw:rounded-[32px] tw:border tw:border-slate-200/60 tw:shadow-sm">
            <div className="tw:p-6 tw:bg-slate-50 tw:rounded-full tw:mb-6">
              <User size={48} className="tw:text-slate-300" />
            </div>
            <h3 className="tw:text-xl tw:font-bold tw:text-slate-900">No matches found</h3>
            <p className="tw:text-slate-500 tw:mt-2 tw:text-center tw:max-w-xs">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
          </div>
        ) : (
          <div className="tw:grid tw:grid-cols-1 tw:md:grid-cols-2 tw:lg:grid-cols-3 tw:xl:grid-cols-4 tw:gap-6 tw:min-h-[80vh]">
            {rowData.map((user) => (
              <DirectoryCard
                key={user.id}
                user={user}
                onClick={() => openViewUserModal(user)}
              />
            ))}
          </div>
        )}

        {/* Footer / Pagination */}
        <div className="tw:mt-2 tw:bg-white tw:rounded-[14px]  tw:shadow-sm tw:border tw:border-slate-200/60">
          <GridFooter
            pageIndex={pageIndex}
            pageSize={pageSize}
            totalRecords={totalRecords}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* User Details Modal */}
      <CompanyDirectoryModal
        isOpen={isModalOpen}
        user={selectedUserDetail}
        onClose={closeViewUserModal}
      />
    </div>
  );
};



export default CompanyDirectory;
