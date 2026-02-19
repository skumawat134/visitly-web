import React from "react";
import { cn } from "@visitly/ui";

export interface InfoFieldProps {
  icon?: React.ElementType; // better than `any`
  label: string;
  value?: string | null;
}

const InfoField: React.FC<InfoFieldProps> = ({
  icon: Icon,
  label,
  value,
}) => {
  return (
    <div className="tw:flex tw:items-start tw:gap-3 tw:py-3">
      {Icon && (
        <Icon
          size={16}
          className="tw:text-slate-400 tw:mt-0.5 tw:shrink-0"
        />
      )}

      <div className="tw:min-w-0">
        <div className="tw:text-[11px] tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-wider tw:mb-0.5">
          {label}
        </div>

        <div
          className={cn(
            "tw:text-[14px] tw:font-bold",
            value ? "tw:text-slate-800" : "tw:text-slate-300"
          )}
        >
          {value || "---"}
        </div>
      </div>
    </div>
  );
};

export default InfoField;
