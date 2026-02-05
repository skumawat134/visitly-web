import React from "react";
import { cn } from "./utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  rightIconClickable?: boolean;
  onRightIconClick?: () => void;
  required?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      rightIconClickable = false,
      onRightIconClick,
      id,
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="tw:w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="tw:block tw:text-sm tw:font-medium  tw:mb-1.5"
          >
           {required && <span className="tw:text-red-500">*</span>} {label}
          </label>
        )}
        <div className="tw:relative">
          {leftIcon && (
            <div className="tw:absolute tw:inset-y-0 tw:left-0 tw:pl-3 tw:flex tw:items-center tw:pointer-events-none">
              <span className="tw:text-gray-400">{leftIcon}</span>
            </div>
          )}
          <div className="tw:flex tw:flex-row">
            <input
            ref={ref}
            id={inputId}
            className={cn(
              "tw:block tw:w-full tw:rounded-md tw:border tw:px-3 tw:py-2 tw:text-sm",
              "focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-offset-2",
              "disabled:tw:cursor-not-allowed disabled:tw:opacity-50",
              error
                ? "tw:border-red-300 focus:tw:border-red-500 focus:tw:ring-red-500"
                : "tw:border-gray-300 focus:tw:border-blue-500 focus:tw:ring-blue-500",
              leftIcon && "tw:pl-10",
              rightIcon && "tw:pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <span 
              className={cn(
                "tw:flex tw:items-center tw:-ml-6",
                !rightIconClickable && "tw:pointer-events-none"
              )}
              onClick={rightIconClickable && onRightIconClick ? onRightIconClick : undefined}
            >
              <span className={cn(
                "tw:text-gray-400",
                rightIconClickable && "tw:cursor-pointer hover:tw:text-gray-600"
              )}>{rightIcon}</span>
            </span>
          )}
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

Input.displayName = "Input";
