import React, { useEffect, useState } from "react";
import { format, addDays, isBefore, isAfter, isEqual } from "date-fns";
import { Calendar, ChevronRight } from "lucide-react";
// import { useToastStore } from '@visitly/app-store';

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
// Simple toast (you can replace with react-hot-toast, sonner, etc.)
// ---------------------------------------------------------------------------
const showToast = (message: string, type: "error" | "success" = "error") => {
  // For production → use a real toast library
  const bg = type === "error" ? "bg-red-500" : "bg-green-500";
  const el = document.createElement("div");
  el.className = `fixed bottom-4 right-4 ${bg} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-5`;
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => {
    el.classList.add("animate-out", "fade-out", "slide-out-to-bottom-5");
    setTimeout(() => el.remove(), 300);
  }, 3200);
};

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

  const [customRange, setCustomRange] = useState<DateRangeValue>({
    startDate: null,
    endDate: null,
  });

//   const toast = useToastStore((s)=>s.showToast)

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------
  const getPresetRange = (preset: FutureDateRangePreset): DateRangeValue => {
    switch (preset) {
      case "today":
        return { startDate: todayStr, endDate: todayStr };
      case "tomorrow": {
        const t = addDays(today, 1);
        return { startDate: format(t, "yyyy-MM-dd"), endDate: format(t, "yyyy-MM-dd") };
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

  const isValidRange = (start: string | null, end: string | null): boolean => {
    if (!start || !end){
    // toast({message: 'Start date must be smaller than end date!'})
     return false;
    }
    const startD = new Date(start);
    const endD = new Date(end);
    return !isBefore(endD, startD) || isEqual(startD, endD);
  };

  // -------------------------------------------------------------------------
  // Sync from external value → internal state
  // -------------------------------------------------------------------------
  useEffect(() => {
    if (!value) return;

    const { startDate, endDate } = value;

    if (startDate === todayStr && endDate === null) {
      setSelectedPreset("all");
      return;
    }
    if (startDate === todayStr && endDate === todayStr) {
      setSelectedPreset("today");
      return;
    }
    const tomorrowStr = format(addDays(today, 1), "yyyy-MM-dd");
    if (startDate === tomorrowStr && endDate === tomorrowStr) {
      setSelectedPreset("tomorrow");
      return;
    }
    if (
      startDate === todayStr &&
      endDate === format(addDays(today, 6), "yyyy-MM-dd")
    ) {
      setSelectedPreset("7d");
      return;
    }

    // custom
    setSelectedPreset("custom");
    setCustomRange({ startDate, endDate });
  }, [value, todayStr]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handlePresetClick = (key: FutureDateRangePreset) => {
    setSelectedPreset(key);

    if (key === "custom") {
      // Reset local state — wait for user input
      setCustomRange({ startDate: null, endDate: null });
      // Optionally: you can also call onChange({ startDate: null, endDate: null })
      // but many UIs keep previous valid value until user confirms new range
      return;
    }

    onChange(getPresetRange(key));
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value || null;
    setCustomRange((prev) => {
      const updated = { ...prev, startDate: newStart };

      // Only propagate if both dates are now present **and** valid
      if (newStart && prev.endDate && isValidRange(newStart, prev.endDate)) {
        onChange({ startDate: newStart, endDate: prev.endDate });
      } else if (newStart && prev.endDate) {
        showToast("Start date must be before or equal to end date");
      }

      return updated;
    });
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEnd = e.target.value || null;
    setCustomRange((prev) => {
      const updated = { ...prev, endDate: newEnd };

      // Only propagate if both dates are now present **and** valid
      if (prev.startDate && newEnd && isValidRange(prev.startDate, newEnd)) {
        onChange({ startDate: prev.startDate, endDate: newEnd });
      } else if (prev.startDate && newEnd) {
        showToast("End date must be after or equal to start date");
      }

      return updated;
    });
  };

  const isCustom = selectedPreset === "custom";
  const rangeSelected = isCustom && value?.startDate && value?.endDate;

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
            //   min={todayStr}
              onChange={handleStartChange}
              className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:px-3 tw:py-2 tw:text-[13px] tw:font-bold tw:text-slate-700 tw:outline-none focus:tw:ring-2 focus:tw:ring-indigo-500/20 focus:tw:border-indigo-500 tw:transition-all"
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
            //   min={customRange.startDate || todayStr}
              onChange={handleEndChange}
              className="tw:bg-white tw:border tw:border-slate-200 tw:rounded-xl tw:px-3 tw:py-2 tw:text-[13px] tw:font-bold tw:text-slate-700 tw:outline-none focus:tw:ring-2 focus:tw:ring-indigo-500/20 focus:tw:border-indigo-500 tw:transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FutureDateRangeFilter;