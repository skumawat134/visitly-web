import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

type GridFooterProps = {
  pageIndex: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
};

export const GridFooter: React.FC<GridFooterProps> = ({
  pageIndex,
  pageSize,
  totalRecords,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalRecords / pageSize);
  const currentPage = pageIndex + 1;

  const start = pageIndex * pageSize + 1;
  const end = Math.min(start + pageSize - 1, totalRecords);

  return (
    <div className="tw:flex tw:justify-between tw:items-center tw:p-3  tw:border-gray-200 tw:bg-white">
      {/* LEFT */}
      {/* <span className="tw:text-sm tw:text-gray-600">
        Total Records: <b>{totalRecords}</b>
      </span> */}

      <span className="tw:text-xs sm:tw:text-sm tw:text-gray-600">
        Showing <b>{start}</b>–<b>{end}</b> of <b>{totalRecords}</b>
      </span>

      {/* RIGHT PAGINATION */}
      <div className="tw:flex tw:items-center tw:gap-3 tw:text-sm  tw:px-3 tw:py-1.5 tw:rounded-xl tw:border tw:border-gray-200">
        {/* First Page */}
        <button
          disabled={pageIndex === 0}
          onClick={() => onPageChange(0)}
          className="tw:p-1.5 tw:rounded-lg tw:hover:bg-white tw:border tw:border-transparent hover:tw:border-gray-200 tw:transition disabled:tw-opacity-40"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous */}
        <button
          disabled={pageIndex === 0}
          onClick={() => onPageChange(pageIndex - 1)}
          className="tw:p-1.5 tw:rounded-lg tw:hover:bg-white tw:border tw:border-transparent hover:tw:border-gray-200 tw:transition disabled:tw-opacity-40"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Page Info */}
        <span className="tw:px-3 tw:py-1 tw:bg-white   tw:rounded-lg tw:text-gray-700 tw-font-medium">
          Page <b>{currentPage}</b> of <b>{totalPages}</b>
        </span>

        {/* Next */}
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(pageIndex + 1)}
          className="tw:p-1.5 tw:rounded-lg tw:hover:bg-white tw:border tw:border-transparent hover:tw:border-gray-200 tw:transition disabled:tw-opacity-40"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last Page */}
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages - 1)}
          className="tw:p-1.5 tw:rounded-lg tw:hover:bg-white tw:border tw:border-transparent hover:tw:border-gray-200 tw:transition disabled:tw-opacity-40"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
      <div></div>
    </div>
  );
};
