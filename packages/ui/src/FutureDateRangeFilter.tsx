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
  { key: "all", label: "All Future" },
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
  const todayStr = format(today, "yyyy-MM-dd");

  const [selectedPreset, setSelectedPreset] =
    useState<FutureDateRangePreset>("all");

  // when the user is in "custom" mode we keep a local copy of the
  // start/end values so that clicking the preset button itself doesn't
  // fire `onChange`.  the parent is only notified when the inputs change.
  const [customRange, setCustomRange] =
    useState<DateRangeValue>({ startDate: null, endDate: null });

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  const getPresetRange = (
    preset: FutureDateRangePreset
  ): DateRangeValue => {
    switch (preset) {
      case "today":
        return { startDate: todayStr, endDate: todayStr };

      case "tomorrow": {
        const t = addDays(today, 1);
        const tStr = format(t, "yyyy-MM-dd");
        return { startDate: tStr, endDate: tStr };
      }

      case "7d":
        return {
          startDate: todayStr,
          endDate: format(addDays(today, 6), "yyyy-MM-dd"),
        };

      case "all":
        return { startDate: todayStr, endDate: null };

      default:
        return { startDate: null, endDate: null };
    }
  };

  // -------------------------------------------------------------------------
  // Sync preset only when value changes externally
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (!value) return;

    const { startDate, endDate } = value;

    // All Future
    if (startDate === todayStr && endDate === null) {
      setSelectedPreset("all");
      return;
    }

    // Today
    if (startDate === todayStr && endDate === todayStr) {
      setSelectedPreset("today");
      return;
    }

    // Tomorrow
    const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");
    if (startDate === tomorrowStr && endDate === tomorrowStr) {
      setSelectedPreset("tomorrow");
      return;
    }

    // Next 7 Days
    if (
      startDate === todayStr &&
      endDate === format(addDays(today, 6), "yyyy-MM-dd")
    ) {
      setSelectedPreset("7d");
      return;
    }

    // Otherwise Custom
    setSelectedPreset("custom");

    // keep local inputs in sync when value changes externally
    setCustomRange({ startDate, endDate });
  }, [value]); // 🔥 only depends on value

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------

  const handlePresetClick = (key: FutureDateRangePreset) => {
    setSelectedPreset(key);

    if (key === "custom") {
      // always start with empty inputs; user will type the dates manually
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

      {/* Custom Date Inputs */}
      {isCustom && (
        <div className="tw:flex tw:items-center tw:gap-4 tw:pl-[44px] tw:animate-in tw:fade-in tw:slide-in-from-top-2">
          {/* FROM */}
          <div className="tw:flex tw:items-center tw:gap-3">
            <span className="tw:text-[11px] tw:font-bold tw:text-slate-400 tw:uppercase tw:tracking-widest">
              From
            </span>

            <input
              type="date"
              value={customRange.startDate || ""}
              min={todayStr}
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
              min={customRange.startDate || todayStr}
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

export default FutureDateRangeFilter;