import React from "react";
import { cn } from "./utils";

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value,
      max = 100,
      showLabel = false,
      variant = "default",
      size = "md",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const variants = {
      default: "tw:bg-blue-600",
      success: "tw:bg-green-600",
      warning: "tw:bg-yellow-600",
      danger: "tw:bg-red-600",
    };

    const sizes = {
      sm: "tw:h-1",
      md: "tw:h-2",
      lg: "tw:h-3",
    };

    return (
      <div ref={ref} className={cn("tw:w-full", className)} {...props}>
        {showLabel && (
          <div className="tw:flex tw:justify-between tw:mb-1">
            <span className="tw:text-sm tw:font-medium tw:text-gray-700">
              Progress
            </span>
            <span className="tw:text-sm tw:font-medium tw:text-gray-700">
              {Math.round(percentage)}%
            </span>
          </div>
        )}
        <div
          className={cn(
            "tw:w-full tw:bg-gray-200 tw:rounded-full tw:overflow-hidden",
            sizes[size]
          )}
        >
          <div
            className={cn(
              "tw:h-full tw:transition-all tw:duration-300 tw:ease-in-out",
              variants[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);

Progress.displayName = "Progress";
