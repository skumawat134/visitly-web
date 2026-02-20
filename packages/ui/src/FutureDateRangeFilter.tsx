import React, { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { Calendar, ChevronRight } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FutureDateRangePreset =
  | "today"
  | "tomorrow"
  | "7d"
  | "all"
  | "custom";

export interface DateRangeValue {
  startDate: string | null;
  endDate: string | null;
}

interface FutureDateRangeFilterProps {
  value?: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
}

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

const PRESETS: { key: FutureDateRangePreset; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "tomorrow", label: "Tomorrow" },
  { key: "7d", label: "Next 7 Days" },
  { key: "all", label: "All Time" },
  { key: "custom", label: "Custom" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const FutureDateRangeFilter: React.FC<FutureDateRangeFilterProps> = ({
  value,
  onChange,
}) => {
  const today = new Date();
  const [selectedPreset, setSelectedPreset] =
    useState<FutureDateRangePreset>("all");

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const getPresetRange = (
    preset: FutureDateRangePreset
  ): DateRangeValue => {
    switch (preset) {
      case "today":
        return {
          startDate: format(today, "yyyy-MM-dd"),
          endDate: format(today, "yyyy-MM-dd"),
        };

      case "tomorrow": {
        const t = addDays(today, 1);
        return {
          startDate: format(t, "yyyy-MM-dd"),
          endDate: format(t, "yyyy-MM-dd"),
        };
      }

      case "7d":
        return {
          startDate: format(today, "yyyy-MM-dd"),
          endDate: format(addDays(today, 6), "yyyy-MM-dd"),
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
      setSelectedPreset("all");
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
  }, [value]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handlePresetClick = (key: FutureDateRangePreset) => {
    setSelectedPreset(key);

    if (key === "custom") {
      onChange({
        startDate: value?.startDate ?? null,
        endDate: value?.endDate ?? null,
      });
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
      {/* Presets */}
      <div className="tw:flex tw:items-center tw:gap-2.5 tw:flex-wrap">
        <div className="tw:p-2.5 tw:bg-slate-50 tw:rounded-xl tw:text-slate-400">
          <Calendar size={18} />
        </div>

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
                      ? "tw:bg-[#EEF2FF] tw:text-[#4F46E5] tw:border-[#818CF8]"
                      : "tw:bg-white tw:text-[#4B5563] tw:border-[#E5E7EB]"
                  }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {rangeSelected && (
          <div className="tw:ml-2 tw:flex tw:items-center tw:gap-2 tw:text-indigo-600 tw:text-sm tw:font-bold">
            <ChevronRight size={14} />
            <span>Range Selected</span>
          </div>
        )}
      </div>

      {/* Custom */}
      {isCustom && (
        <div className="tw:flex tw:items-center tw:gap-4 tw:pl-[44px] tw:animate-in tw:fade-in tw:slide-in-from-top-2">
          {/* FROM */}
          <div className="tw:flex tw:items-center tw:gap-3">
            <span className="tw:text-[11px] tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-widest">
              From
            </span>

            <input
              type="date"
              value={value?.startDate || ""}
              min={format(today, "yyyy-MM-dd")}
              onChange={(e) =>
                onChange({
                  startDate: e.target.value || null,
                  endDate: value?.endDate ?? null,
                })
              }
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
              value={value?.endDate || ""}
              min={value?.startDate || format(today, "yyyy-MM-dd")}
              onChange={(e) =>
                onChange({
                  startDate: value?.startDate ?? null,
                  endDate: e.target.value || null,
                })
              }
              className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:px-3 tw:py-2 tw:text-[13px] tw:font-bold tw:text-slate-700 tw:outline-none tw:focus:ring-2 tw:focus:ring-indigo-500/20 tw:focus:border-indigo-500 tw:transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureDateRangeFilter;