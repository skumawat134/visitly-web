import React from "react";
import { cn } from "./utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", children, ...props }, ref) => {
    const variants = {
      default: "tw:bg-gray-100 tw:text-gray-800",
      primary: "tw:bg-blue-100 tw:text-blue-800",
      success: "tw:bg-green-100 tw:text-green-800",
      warning: "tw:bg-yellow-100 tw:text-yellow-800",
      danger: "tw:bg-red-100 tw:text-red-800",
      info: "tw:bg-cyan-100 tw:text-cyan-800",
    };

    const sizes = {
      sm: "tw:text-xs tw:px-2 tw:py-0.5",
      md: "tw:text-sm tw:px-2.5 tw:py-1",
      lg: "tw:text-base tw:px-3 tw:py-1.5",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "tw:inline-flex tw:items-center tw:font-medium tw:rounded-full",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = "Badge";
