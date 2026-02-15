import React from "react";
import { RotateCw } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;

  // Refresh
  onRefresh?: () => void;
  isRefreshing?: boolean;

  // Optional badge (like pending pickup)
  badge?: {
    count: number;
    label: string;
  };

  // Optional fully custom right side
  rightContent?: React.ReactNode;

  className?: string;
}

export const PageDescription : React.FC<PageHeaderProps> = ({
  title,
  description,
  onRefresh,
  isRefreshing,
  badge,
  rightContent,
  className = "",
}) => {
  return (
    <div className={`tw:bg-transparent ${className}`}>
      <div className="tw:max-w-full tw:mx-auto tw:px-6 tw:py-4 tw:md:py-8 tw:flex tw:flex-col tw:md:flex-row tw:justify-between tw:items-start tw:md:items-end tw:gap-4">
        {/* Left Section */}
        <div>
          <h1 className="tw:text-3xl tw:font-bold tw:text-slate-900 tw:tracking-tight tw:flex tw:items-center tw:gap-3">
            {title}

            {onRefresh && (
              <button
                onClick={onRefresh}
                className="tw:p-2 tw:text-slate-400 hover:tw:text-indigo-600 tw:transition-all tw:rounded-xl hover:tw:bg-indigo-50"
                title="Refresh"
              >
                <RotateCw
                  size={20}
                  className={isRefreshing ? "tw:animate-spin" : ""}
                />
              </button>
            )}
          </h1>

          {description && (
            <p className="tw:text-slate-500 tw:mt-2 tw:text-[16px] tw:font-medium">
              {description}
            </p>
          )}
        </div>

        {/* Right Section */}
        <div className="tw:flex tw:items-center tw:gap-4">
          {/* Optional Badge */}
          {badge && badge?.count > 0 && (
            <div className="tw:inline-flex tw:items-center tw:gap-3 tw:px-4 tw:py-2.5 tw:rounded-2xl tw:bg-amber-50 tw:border tw:border-amber-100">
              <span className="tw:w-2 tw:h-2 tw:rounded-full tw:bg-amber-500 tw:animate-pulse" />
              <span className="tw:text-[14px] tw:font-bold tw:text-amber-800">
                {badge.count} {badge.label}
              </span>
            </div>
          )}

          {/* Custom Right Content */}
          {rightContent}
        </div>
      </div>
    </div>
  );
};
