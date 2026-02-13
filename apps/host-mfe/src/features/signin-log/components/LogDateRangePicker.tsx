import React from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { cn } from "@visitly/ui";

export type DateRangePreset = "today" | "yesterday" | "7d" | "30d" | "all" | "custom";

export interface DateRangeValue {
  preset: DateRangePreset;
  from?: string;
  to?: string;
}

interface DateRangePickerProps {
  value: string | DateRangeValue;
  onChange: (value: DateRangeValue | string) => void;
}

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "all", label: "All Time" },
  { key: "custom", label: "Custom" },
];

export const LogDateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  // Normalize legacy string values
  const normalized: DateRangeValue =
    typeof value === "string" ? { preset: value } : value;

  const isCustom = normalized.preset === "custom";

  const handlePresetClick = (key: DateRangePreset) => {
    if (key === "custom") {
      onChange({ ...normalized, preset: "custom" });
    } else {
      onChange({ preset: key });
    }
  };

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      {/* Preset Pills */}
      <div className="tw:flex tw:items-center tw:gap-2.5 tw:flex-wrap">
        <div className="tw:p-2.5 tw:bg-slate-50 tw:rounded-xl tw:text-slate-400">
          <Calendar size={18} />
        </div>

        <div className="tw:flex tw:items-center tw:gap-1.5 tw:flex-wrap">
          {PRESETS.map((p) => {
            const isActive = normalized.preset === p.key;

            return (
              <button
                key={p.key}
                onClick={() => handlePresetClick(p.key)}
                className={cn(
                  "tw:px-4 tw:py-2 tw:rounded-full tw:text-[13px] tw:transition-all tw:border",
                  isActive
                    ? "tw:bg-[#EEF2FF] tw:text-[#4F46E5] tw:border-1 tw:border-[#818CF8]!"
                    : "tw:bg-[#FFFFFF] tw:text-[#4B5563] tw:border-1 tw:border-[#E5E7EB]"
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Range Indicator */}
        {isCustom && normalized.from && normalized.to && (
          <div className="tw:ml-2 tw:flex tw:items-center tw:gap-2 tw:text-indigo-600 tw:text-sm tw:font-bold">
            <ChevronRight size={14} />
            <span>Range Selected</span>
          </div>
        )}
      </div>

      {/* Custom Inputs */}
      {isCustom && (
        <div className="tw:flex tw:items-center tw:gap-4 tw:pl-[44px] tw:animate-in tw:fade-in tw:slide-in-from-top-2">
          {/* FROM */}
          <div className="tw:flex tw:items-center tw:gap-3">
            <span className="tw:text-[11px] tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-widest">
              From
            </span>

            <input
              type="date"
              value={normalized.from || ""}
              onChange={(e) => onChange({ ...normalized, from: e.target.value })}
              className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:px-3 tw:py-2 tw:text-[13px] tw:font-bold tw:text-slate-700 tw:outline-none tw:focus:ring-2 tw:focus:ring-indigo-500/20 tw:focus:border-indigo-500 tw:transition-all"
            />
          </div>

          <div className="tw:h-px tw:w-4 tw:bg-slate-200" />

          {/* TO */}
          <div className="tw:flex tw:items-center tw:gap-3">
            <span className="tw:text-[11px] tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-widest">
              To
            </span>

            <input
              type="date"
              value={normalized.to || ""}
              min={normalized.from}
              onChange={(e) => onChange({ ...normalized, to: e.target.value })}
              className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:px-3 tw:py-2 tw:text-[13px] tw:font-bold tw:text-slate-700 tw:outline-none tw:focus:ring-2 tw:focus:ring-indigo-500/20 tw:focus:border-indigo-500 tw:transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};
