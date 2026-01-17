import React from "react";
import { cn } from "./utils";

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "tw:block tw:text-sm tw:font-medium tw:text-gray-700",
          className
        )}
        {...props}
      >
        {children}
        {required && <span className="tw:text-red-500 tw:ml-1">*</span>}
      </label>
    );
  }
);

Label.displayName = "Label";
