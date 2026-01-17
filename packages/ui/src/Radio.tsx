import React from "react";
import { cn } from "./utils";

export interface RadioProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Radio = React.forwardRef<HTMLInputElement, RadioProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="tw:w-full">
        <div className="tw:flex tw:items-center">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            className={cn(
              "tw:h-4 tw:w-4 tw:text-blue-600 tw:border-gray-300",
              "focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-blue-500 focus:tw:ring-offset-2",
              "disabled:tw:cursor-not-allowed disabled:tw:opacity-50",
              error && "tw:border-red-300",
              className
            )}
            {...props}
          />
          {label && (
            <label
              htmlFor={radioId}
              className={cn(
                "tw:ml-2 tw:text-sm tw:font-medium",
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

Radio.displayName = "Radio";
