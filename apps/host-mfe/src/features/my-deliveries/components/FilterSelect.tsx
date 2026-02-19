import React from "react";
import type { LucideIcon } from "lucide-react";

type OptionType = {
  value: string | number;
  label: React.ReactNode;
};

type FilterSelectProps = {
  value: string | number | undefined;
  onChange: (value: string) => void;
  options: OptionType[];
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
};

export const FilterSelect: React.FC<FilterSelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  icon: Icon,
  className = "",
}) => {
  const hasValue = value !== "" && value !== undefined && value !== null;

  return (
    <div
      className={`
        tw:relative
        tw:flex
        tw:items-center
        tw:flex-1
        tw:min-w-[180px]
        ${className}
      `}
    >
      {Icon && (
        <Icon
          size={14}
          className={`tw:absolute tw:left-3 tw:pointer-events-none ${
            hasValue ? "tw:text-[#4F46E5]" : "tw:text-slate-400"
          }`}
        />
      )}

      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className={`
          tw:w-full
          tw:appearance-none
          tw:px-4
          ${Icon ? "tw:pl-9" : ""}
          tw:py-2
          tw:rounded-lg
          tw:text-[13px]
          tw:font-medium
          tw:border
          tw:transition-all
          tw:outline-none
          tw:cursor-pointer
          
          ${
            hasValue
              ? "tw:bg-[#EEF2FF] tw:text-[#4F46E5] tw:border-[#818CF8]"
              : "tw:bg-white tw:text-[#4B5563] tw:border-[#E5E7EB]"
          }
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};
