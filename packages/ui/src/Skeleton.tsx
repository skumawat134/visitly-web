import React from "react";
import { cn } from "./utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ className, variant = "rectangular", ...props }, ref) => {
    const variants = {
      text: "tw:h-4 tw:rounded",
      circular: "tw:rounded-full",
      rectangular: "tw:rounded-md",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "tw:animate-pulse tw:bg-gray-200",
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Skeleton.displayName = "Skeleton";
