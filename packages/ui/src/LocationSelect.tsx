import React from "react";
import { MapPin } from "lucide-react";
import { Select } from "./Select";
import type { SelectProps } from "./Select";

import { cn } from "./utils";

export interface LocationOption {
  value: string;
  label: string;
}

export interface LocationSelectProps
  extends Omit<SelectProps, "options" | "onChange"> {
  value: string;
  onChange: (value: string) => void;
  options: LocationOption[];
  onClear?: () => void;
}

export const LocationSelect: React.FC<LocationSelectProps> = ({
  value,
  onChange,
  options,
  onClear,
  className,
  ...props
}) => {
  return (
    <div className="tw:relative tw:w-full tw:sm:w-64">
      {/* Left Icon */}
      <MapPin
        className="tw:absolute tw:left-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 tw:z-10"
        size={16}
      />

      {/* Select */}
      <Select
        value={value}
        options={options}
        onChange={(e) => onChange(e.target.value)}
        className={cn("tw:pl-10 tw:rounded-xl tw:bg-gray-50/50 tw:appearance-none", className)}
        {...props}
      />

      {/* Clear Button */}
      {value && onClear && (
        <button
          onClick={onClear}
          className="tw:absolute tw:right-3 tw:top-1/2 tw:-translate-y-1/2 tw:text-gray-400 hover:tw:text-red-500 tw:transition"
          aria-label="Clear location filter"
        >
          ✕
        </button>
      )}
    </div>
  );
};
