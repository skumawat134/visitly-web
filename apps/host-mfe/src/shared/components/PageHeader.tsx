import React from 'react';
import { RotateCw } from "lucide-react";
import { Button } from "@visitly/ui";

export interface PageHeaderProps {
  refetch: () => void;
  config: {
    refreshBtn: boolean,
    showRightMenu: boolean,
  },
  rightMenu: React.ReactElement
  isLoading?: boolean,
  header: React.ReactElement
}
export const PageHeader: React.FC<Partial<PageHeaderProps>> = ({ header, config, refetch, rightMenu, isLoading }) => {
  return (
    <div className="tw:mb-6 tw:flex tw:flex-col sm:tw:flex-row tw:justify-between tw:items-start sm:tw:items-center tw:gap-4" data-test-id="host-mfe-page-header-root">
      <div className="tw:flex tw:justify-between tw:w-full">
        <div className="tw:flex tw:items-center tw:gap-2">
          <h1 className="tw:text-2xl tw:font-bold tw:text-gray-900 tw:italic" data-test-id="host-mfe-page-header-title">
            {header}
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch && refetch()}
            className="tw:rounded-full tw:h-8 tw:w-8 tw:p-0 tw:text-gray-500 hover:tw:text-blue-600 hover:tw:bg-blue-50"
            title="Refresh List"
            data-test-id="host-mfe-page-header-refresh-btn"
          >
            <RotateCw
              size={18}
              className={isLoading ? "tw:animate-spin" : ""}
            />
          </Button>

        </div>
        <div className="flex tw:items-center tw:gap-2">
          {config?.showRightMenu && rightMenu}
        </div>
      </div>

    </div>
  )
}
