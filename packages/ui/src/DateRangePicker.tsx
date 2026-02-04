import { useState, useRef, useEffect } from "react";
import {
  DateRangePicker as RDRDateRangePicker,
  createStaticRanges,
} from "react-date-range";
import type { StaticRange, RangeKeyDict, Range } from "react-date-range";
import { format, subDays, subMonths, subYears } from "date-fns";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { Input } from "./Input";

// ✅ Fix React 18 typing issue
const DateRangePicker = RDRDateRangePicker as unknown as React.FC<any>;

export type DateRangeValue = {
  startDate: string | null;
  endDate: string | null;
};

export type DateRangeProps = {
  value?: DateRangeValue;
  onChange?: (range: DateRangeValue) => void;
  className?: string;
};

// ✅ Static Presets
const staticRanges: StaticRange[] = createStaticRanges([
  { label: "Today", range: () => ({ startDate: new Date(), endDate: new Date() }) },
  { label: "Last Week", range: () => ({ startDate: subDays(new Date(), 7), endDate: new Date() }) },
  { label: "Last 2 Weeks", range: () => ({ startDate: subDays(new Date(), 14), endDate: new Date() }) },
  { label: "Last 30 Days", range: () => ({ startDate: subDays(new Date(), 30), endDate: new Date() }) },
  { label: "Last 3 Months", range: () => ({ startDate: subMonths(new Date(), 3), endDate: new Date() }) },
  { label: "Last 6 Months", range: () => ({ startDate: subMonths(new Date(), 6), endDate: new Date() }) },
  { label: "Last 1 Year", range: () => ({ startDate: subYears(new Date(), 1), endDate: new Date() }) },
]);

export const SharedDateRangePicker = ({
  value,
  onChange,
  className,
}: DateRangeProps) => {
  const today = new Date();

  const initialRange: Range[] = [
    { startDate: today, endDate: today, key: "selection" },
  ];

  const [range, setRange] = useState<Range[]>(initialRange);
  const [tempRange, setTempRange] = useState<Range[]>(initialRange);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [presetLabel, setPresetLabel] = useState<string>("");

  // Sync external value
  useEffect(() => {
    if (value?.startDate && value?.endDate) {
      const newRange: Range = {
        startDate: new Date(value.startDate),
        endDate: new Date(value.endDate),
        key: "selection",
      };
      setRange([newRange]);
      setTempRange([newRange]);
    }
  }, [value]);

  // Handle preset & manual changes
  const handleChange = (item: RangeKeyDict) => {
    const selection = item.selection;
    if (!selection?.startDate || !selection?.endDate) return;

    setTempRange([selection]);

   const matchedPreset = staticRanges.find((s) => {
  const preset = s.range();
  const selStart = selection.startDate;
  const selEnd = selection.endDate;

  if (!preset.startDate || !preset.endDate || !selStart || !selEnd) {
    return false;
  }

  return (
    format(preset.startDate, "yyyy-MM-dd") === format(selStart, "yyyy-MM-dd") &&
    format(preset.endDate, "yyyy-MM-dd") === format(selEnd, "yyyy-MM-dd")
  );
});


    if (matchedPreset) {
      setRange([selection]);
      setPresetLabel(matchedPreset.label ?? "");
      onChange?.({
        startDate: format(selection.startDate, "yyyy-MM-dd"),
        endDate: format(selection.endDate, "yyyy-MM-dd"),
      });
      setOpen(false);
    } else {
      setPresetLabel("");
    }
  };

  const handleApply = () => {
    const selection = tempRange[0];
    if (!selection?.startDate || !selection?.endDate) return;

    setRange(tempRange);
    setOpen(false);

    onChange?.({
      startDate: format(selection.startDate, "yyyy-MM-dd"),
      endDate: format(selection.endDate, "yyyy-MM-dd"),
    });
  };

  const handleCancel = () => {
    setTempRange(range);
    setOpen(false);
  };

  const handleReset = () => {
    const cleared = [{ startDate: today, endDate: today, key: "selection" }];
    setRange(cleared);
    setTempRange(cleared);
    setPresetLabel("");
    onChange?.({ startDate: null, endDate: null });
    setOpen(false);
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        setTempRange(range);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [range]);

  const inputValue =
    presetLabel ||
    (range[0]?.startDate &&
    range[0]?.endDate &&
    range[0].startDate.getTime() !== range[0].endDate.getTime()
      ? `${format(range[0].startDate, "dd MMM yyyy")} - ${format(
          range[0].endDate,
          "dd MMM yyyy"
        )}`
      : "");

  return (
    <div className={`tw:relative ${className}`} ref={wrapperRef}>
      <Input
        type="text"
        readOnly
        value={inputValue}
        onClick={() => setOpen(!open)}
        className="tw:w-full tw:p-2 tw:border tw:rounded"
        placeholder="Select duration"
      />

      {open && (
        <div className="tw:absolute tw:z-50 tw:bg-white tw:shadow-lg tw:rounded tw:mt-1 tw:p-3">
          <DateRangePicker
            {...({
              ranges: tempRange,
              onChange: handleChange,
              staticRanges,
              inputRanges: [],
              moveRangeOnFirstSelection: false,
              retainEndDateOnFirstSelection: false,
              showSelectionPreview: true,
              rangeColors: ["#5E2CED"],
            } as any)}
          />

          <div className="tw:flex tw:justify-end tw:gap-2 tw:mt-2">
            <button
              className="tw:bg-gray-200 tw:text-gray-700 tw:px-3 tw:py-1 tw:rounded hover:tw:bg-gray-300"
              onClick={handleCancel}
            >
              Cancel
            </button>

            <button
              className="tw:bg-[#5E2CED] tw:text-white tw:px-3 tw:py-1 tw:rounded hover:tw:bg-blue-700"
              onClick={handleApply}
            >
              Apply
            </button>

            <button
              className="tw:bg-red-500 tw:text-white tw:px-3 tw:py-1 tw:rounded hover:tw:bg-red-600"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
