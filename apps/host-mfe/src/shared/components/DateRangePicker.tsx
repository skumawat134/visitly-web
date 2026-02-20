import React, { useEffect, useState } from "react";
import { format, subDays } from "date-fns";
import { Calendar, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DateRangePreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "all"
  | "custom";

export interface DateRangeValue {
  startDate: string | null;
  endDate: string | null;
}

interface DateRangePickerProps {
  value?: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "all", label: "All Time" },
  { key: "custom", label: "Custom" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
}) => {
  const today = new Date();
  const [selectedPreset, setSelectedPreset] =
    useState<DateRangePreset>("all");

  // local state for custom inputs—only notify parent when user edits
  const [customRange, setCustomRange] =
    useState<DateRangeValue>({ startDate: null, endDate: null });

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const getPresetRange = (preset: DateRangePreset): DateRangeValue => {
    switch (preset) {
      case "today":
        return {
          startDate: format(today, "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };

      case "yesterday": {
        const y = subDays(today, 1);
        return {
          startDate: format(y, "yyyy-MM-dd"),
          endDate: format(y, "yyyy-MM-dd"),
        };
      }

      case "7d":
        return {
          startDate: format(subDays(today, 6), "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };

      case "30d":
        return {
          startDate: format(subDays(today, 29), "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };

      case "all":
        return {
          startDate: null,
          endDate: null,
        };

      default:
        return {
          startDate: null,
          endDate: null,
        };
    }
  };

  // -------------------------------------------------------------------------
  // Sync preset from external value
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!value) return;

    if (!value.startDate && !value.endDate) {
      if (selectedPreset !== "custom") {
        setSelectedPreset("all");
      }
      return;
    }

    for (const preset of PRESETS) {
      if (preset.key === "custom" || preset.key === "all") continue;

      const presetRange = getPresetRange(preset.key);

      if (
        presetRange.startDate === value.startDate &&
        presetRange.endDate === value.endDate
      ) {
        setSelectedPreset(preset.key);
        return;
      }
    }

    setSelectedPreset("custom");
    // keep custom inputs in sync when value changes externally
    setCustomRange({ startDate: value?.startDate ?? null, endDate: value?.endDate ?? null });
  }, [value]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handlePresetClick = (key: DateRangePreset) => {
    setSelectedPreset(key);

    // setting custom preset—always start blank
    if (key === "custom") {
      setCustomRange({ startDate: null, endDate: null });
      return;
    }

    onChange(getPresetRange(key));
  };

  const isCustom = selectedPreset === "custom";
  const rangeSelected =
    isCustom && value?.startDate && value?.endDate;

  // -------------------------------------------------------------------------
  // UI
  // -------------------------------------------------------------------------

  return (
    <div className="tw:flex tw:flex-col tw:gap-4">
      {/* Preset Row */}
      <div className="tw:flex tw:items-center tw:gap-2.5 tw:flex-wrap">
        {/* Calendar Icon */}
        <div className="tw:p-2.5 tw:bg-slate-50 tw:rounded-xl tw:text-slate-400">
          <Calendar size={18} />
        </div>

        {/* Pills */}
        <div className="tw:flex tw:items-center tw:gap-1.5 tw:flex-wrap">
          {PRESETS.map((p) => {
            const isActive = selectedPreset === p.key;

            return (
              <button
                key={p.key}
                onClick={() => handlePresetClick(p.key)}
                className={`tw:px-4 tw:py-2 tw:rounded-full tw:text-[13px] tw:transition-all tw:border
                  ${
                    isActive
                      ? "tw:bg-[#EEF2FF] tw:text-[#4F46E5] tw:border tw:border-[#818CF8]"
                      : "tw:bg-white tw:text-[#4B5563] tw:border tw:border-[#E5E7EB]"
                  }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Range Indicator */}
        {rangeSelected && (
          <div className="tw:ml-2 tw:flex tw:items-center tw:gap-2 tw:text-indigo-600 tw:text-sm tw:font-bold">
            <ChevronRight size={14} />
            <span>Range Selected</span>
          </div>
        )}
      </div>

      {/* Custom Inputs */}
      {isCustom && (
        <div className="tw:flex tw:items-center tw:gap-4 tw:pl-11 tw:animate-in tw:fade-in tw:slide-in-from-top-2">
          {/* FROM */}
          <div className="tw:flex tw:items-center tw:gap-3">
            <span className="tw:text-[11px] tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-widest">
              From
            </span>

            <input
              type="date"
              value={customRange.startDate || ""}
              onChange={(e) => {
                const start = e.target.value || null;
                setCustomRange((c) => ({ ...c, startDate: start }));
                onChange({ startDate: start, endDate: customRange.endDate });
              }}
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
              value={customRange.endDate || ""}
              min={customRange.startDate || undefined}
              onChange={(e) => {
                const end = e.target.value || null;
                setCustomRange((c) => ({ ...c, endDate: end }));
                onChange({ startDate: customRange.startDate, endDate: end });
              }}
              className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:px-3 tw:py-2 tw:text-[13px] tw:font-bold tw:text-slate-700 tw:outline-none tw:focus:ring-2 tw:focus:ring-indigo-500/20 tw:focus:border-indigo-500 tw:transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;

















































































































// import React from "react";
// import { Calendar, ChevronRight } from "lucide-react";
// import { cn } from "@visitly/ui";

// export type DateRangePreset = "today" | "yesterday" | "7d" | "30d" | "all" | "custom";

// export interface DateRangeValue {
//   preset: DateRangePreset;
//   from?: string;
//   to?: string;
// }

// interface DateRangePickerProps {
//   value: string | DateRangeValue;
//   onChange: (value: DateRangeValue | string) => void;
// }

// const PRESETS: { key: DateRangePreset; label: string }[] = [
//   { key: "today", label: "Today" },
//   { key: "yesterday", label: "Yesterday" },
//   { key: "7d", label: "Last 7 days" },
//   { key: "30d", label: "Last 30 days" },
//   { key: "all", label: "All Time" },
//   { key: "custom", label: "Custom" },
// ];

// export const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
//   // Normalize legacy string values
//   const normalized: DateRangeValue =
//     typeof value === "string" ? { preset: value } : value;

//   const isCustom = normalized.preset === "custom";

//   const handlePresetClick = (key: DateRangePreset) => {
//     if (key === "custom") {
//       onChange({ ...normalized, preset: "custom" });
//     } else {
//       onChange({ preset: key });
//     }
//   };

//   return (
//     <div className="tw:flex tw:flex-col tw:gap-4">
//       {/* Preset Pills */}
//       <div className="tw:flex tw:items-center tw:gap-2.5 tw:flex-wrap">
//         <div className="tw:p-2.5 tw:bg-slate-50 tw:rounded-xl tw:text-slate-400">
//           <Calendar size={18} />
//         </div>

//         <div className="tw:flex tw:items-center tw:gap-1.5 tw:flex-wrap">
//           {PRESETS.map((p) => {
//             const isActive = normalized.preset === p.key;

//             return (
//               <button
//                 key={p.key}
//                 onClick={() => handlePresetClick(p.key)}
//                 className={cn(
//                   "tw:px-4 tw:py-2 tw:rounded-full tw:text-[13px] tw:transition-all tw:border",
//                   isActive
//                     ? "tw:bg-[#EEF2FF] tw:text-[#4F46E5] tw:border-1 tw:border-[#818CF8]!"
//                     : "tw:bg-[#FFFFFF] tw:text-[#4B5563] tw:border-1 tw:border-[#E5E7EB]"
//                 )}
//               >
//                 {p.label}
//               </button>
//             );
//           })}
//         </div>

//         {/* Range Indicator */}
//         {isCustom && normalized.from && normalized.to && (
//           <div className="tw:ml-2 tw:flex tw:items-center tw:gap-2 tw:text-indigo-600 tw:text-sm tw:font-bold">
//             <ChevronRight size={14} />
//             <span>Range Selected</span>
//           </div>
//         )}
//       </div>

//       {/* Custom Inputs */}
//       {isCustom && (
//         <div className="tw:flex tw:items-center tw:gap-4 tw:pl-[44px] tw:animate-in tw:fade-in tw:slide-in-from-top-2">
//           {/* FROM */}
//           <div className="tw:flex tw:items-center tw:gap-3">
//             <span className="tw:text-[11px] tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-widest">
//               From
//             </span>

//             <input
//               type="date"
//               value={normalized.from || ""}
//               onChange={(e) => onChange({ ...normalized, from: e.target.value })}
//               className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:px-3 tw:py-2 tw:text-[13px] tw:font-bold tw:text-slate-700 tw:outline-none tw:focus:ring-2 tw:focus:ring-indigo-500/20 tw:focus:border-indigo-500 tw:transition-all"
//             />
//           </div>

//           <div className="tw:h-px tw:w-4 tw:bg-slate-200" />

//           {/* TO */}
//           <div className="tw:flex tw:items-center tw:gap-3">
//             <span className="tw:text-[11px] tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-widest">
//               To
//             </span>

//             <input
//               type="date"
//               value={normalized.to || ""}
//               min={normalized.from}
//               onChange={(e) => onChange({ ...normalized, to: e.target.value })}
//               className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:px-3 tw:py-2 tw:text-[13px] tw:font-bold tw:text-slate-700 tw:outline-none tw:focus:ring-2 tw:focus:ring-indigo-500/20 tw:focus:border-indigo-500 tw:transition-all"
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };
