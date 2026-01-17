import React from "react";
import { cn } from "./utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="tw:w-full">
        <div className="tw:flex tw:items-center">
          <label
            htmlFor={switchId}
            className="tw:relative tw:inline-flex tw:items-center tw:cursor-pointer"
          >
            <input
              ref={ref}
              type="checkbox"
              id={switchId}
              className="tw:sr-only tw:peer"
              {...props}
            />
            <div
              className={cn(
                "tw:w-11 tw:h-6 tw:bg-gray-200 peer-focus:tw:outline-none peer-focus:tw:ring-4 peer-focus:tw:ring-blue-300 tw:rounded-full peer",
                "peer-checked:after:tw:translate-x-full peer-checked:after:tw:border-white",
                "after:tw:content-[''] after:tw:absolute after:tw:top-[2px] after:tw:left-[2px]",
                "after:tw:bg-white after:tw:border-gray-300 after:tw:border after:tw:rounded-full",
                "after:tw:h-5 after:tw:w-5 after:tw:transition-all",
                "peer-checked:tw:bg-blue-600",
                "disabled:tw:cursor-not-allowed disabled:tw:opacity-50",
                error && "tw:bg-red-100"
              )}
            />
          </label>
          {label && (
            <label
              htmlFor={switchId}
              className={cn(
                "tw:ml-3 tw:text-sm tw:font-medium tw:cursor-pointer",
                error ? "tw:text-red-600" : "tw:text-gray-700"
              )}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="tw:mt-1 tw:text-sm tw:text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";
