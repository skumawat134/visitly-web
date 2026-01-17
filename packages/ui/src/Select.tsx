import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="tw:w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="tw:block tw:text-sm tw:font-medium tw:text-gray-700 tw:mb-1"
          >
            {label}
          </label>
        )}
        <div className="tw:relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              "tw:appearance-none tw:block tw:w-full tw:rounded-md tw:border tw:px-3 tw:py-2 tw:pr-10 tw:text-sm",
              "focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-offset-2",
              "disabled:tw:cursor-not-allowed disabled:tw:opacity-50",
              "tw:bg-white",
              error
                ? "tw:border-red-300 focus:tw:border-red-500 focus:tw:ring-red-500"
                : "tw:border-gray-300 focus:tw:border-blue-500 focus:tw:ring-blue-500",
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="tw:pointer-events-none tw:absolute tw:inset-y-0 tw:right-0 tw:flex tw:items-center tw:pr-3">
            <ChevronDown className="tw:h-4 tw:w-4 tw:text-gray-400" />
          </div>
        </div>
        {error && (
          <p className="tw:mt-1 tw:text-sm tw:text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="tw:mt-1 tw:text-sm tw:text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";
