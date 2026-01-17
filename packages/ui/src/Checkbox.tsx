import React from "react";
import { Check } from "lucide-react";
import { cn } from "./utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="tw:w-full">
        <div className="tw:flex tw:items-center">
          <div className="tw:relative tw:flex tw:items-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className={cn(
                "tw:peer tw:h-4 tw:w-4 tw:appearance-none tw:rounded tw:border tw:border-gray-300",
                "checked:tw:bg-blue-600 checked:tw:border-blue-600",
                "focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-blue-500 focus:tw:ring-offset-2",
                "disabled:tw:cursor-not-allowed disabled:tw:opacity-50",
                error && "tw:border-red-300",
                className
              )}
              {...props}
            />
            <div className="tw:pointer-events-none tw:absolute tw:inset-0 tw:flex tw:items-center tw:justify-center tw:opacity-0 peer-checked:tw:opacity-100">
              <Check className="tw:h-3 tw:w-3 tw:text-white" />
            </div>
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
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

Checkbox.displayName = "Checkbox";
