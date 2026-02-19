import React from "react";
import { cn } from "./utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "tw:inline-flex tw:items-center tw:justify-center tw:font-medium tw:transition-colors focus:tw:outline-none focus:tw:ring-2 focus:tw:ring-offset-2 disabled:tw:opacity-50 disabled:tw:pointer-events-none tw:rounded-sm tw:cursor-pointe";
    const variants = {
      primary:
        "tw:bg-[#5E2CED] tw:text-white hover:tw:bg-blue-700 focus:tw:ring-blue-500",
      secondary:
        "tw:bg-gray-200 tw:text-gray-900 hover:tw:bg-gray-300 focus:tw:ring-gray-500",
      outline:
        "tw:border tw:border-gray-300 tw:bg-transparent hover:tw:bg-gray-50 focus:tw:ring-gray-500",
      ghost:
        "tw:bg-transparent hover:tw:bg-gray-100 focus:tw:ring-gray-500",
      danger:
        "tw:bg-red-600 tw:text-white hover:tw:bg-red-700 focus:tw:ring-red-500",
    };

    const sizes = {
      sm: "tw:h-8 tw:px-3 tw:text-sm",
      md: "tw:h-10 tw:px-4 tw:text-base",
      lg: "tw:h-12 tw:px-6 tw:text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        data-test-id="ui-button-root"
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="tw:mr-2 tw:h-4 tw:w-4 tw:animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="tw:opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="tw:opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          <>
            {leftIcon && <span className="tw:mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="tw:ml-2">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
