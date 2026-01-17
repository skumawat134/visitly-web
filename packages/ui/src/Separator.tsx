import React from "react";
import { cn } from "./utils";

export interface SeparatorProps
  extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export const Separator = React.forwardRef<HTMLHRElement, SeparatorProps>(
  ({ className, orientation = "horizontal", ...props }, ref) => {
    return (
      <hr
        ref={ref}
        className={cn(
          "tw:shrink-0 tw:border-0 tw:bg-gray-200",
          orientation === "horizontal"
            ? "tw:h-px tw:w-full"
            : "tw:h-full tw:w-px",
          className
        )}
        {...props}
      />
    );
  }
);

Separator.displayName = "Separator";
