import React from "react";
import { cn } from "./utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="tw:w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="tw:block tw:text-sm tw:font-medium tw:text-gray-700 tw:mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "tw:block tw:w-full tw:rounded-md tw:border tw:px-3 tw:py-2 tw:text-sm",
            "focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-offset-2",
            "disabled:tw:cursor-not-allowed disabled:tw:opacity-50",
            "tw:resize-none",
            error
              ? "tw:border-red-300 focus:tw:border-red-500 focus:tw:ring-red-500"
              : "tw:border-gray-300 focus:tw:border-blue-500 focus:tw:ring-blue-500",
            className
          )}
          {...props}
        />
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

Textarea.displayName = "Textarea";
