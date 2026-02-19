import React from "react";
import { Check } from "lucide-react";
import { cn } from "./utils";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  label?: string;
  error?: string;
  onChange?: (checked: boolean) => void;
  className?: string;
}

export const Checkbox = React.forwardRef<HTMLDivElement, CheckboxProps>(
  (
    {
      checked,
      defaultChecked = false,
      disabled = false,
      label,
      error,
      onChange,
      className,
    },
    ref
  ) => {
    const [internalChecked, setInternalChecked] =
      React.useState(defaultChecked);

    const isControlled = checked !== undefined;
    const isChecked = isControlled ? checked : internalChecked;

    const toggle = () => {
      if (disabled) return;
      const next = !isChecked;
      if (!isControlled) setInternalChecked(next);
      onChange?.(next);
    };

    return (
      <div
        ref={ref}
        className="tw:flex tw:items-center tw:gap-2 tw:w-full"
      >
        {/* CHECKBOX BOX */}
        <div
          role="checkbox"
          aria-checked={isChecked}
          aria-disabled={disabled}
          tabIndex={disabled ? -1 : 0}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              toggle();
            }
          }}
          className={cn(
            "tw:h-5 tw:w-5 tw:flex tw:items-center tw:justify-center",
            "tw:rounded tw:border tw:transition-colors",
            // unchecked
            !isChecked && !disabled && "tw:bg-white tw:border-gray-300",
            // checked (enabled)
            isChecked && !disabled && "tw:bg-indigo-600 tw:border-indigo-600",
            // disabled unchecked
            disabled && !isChecked && "tw:bg-gray-100 tw:border-gray-200",
            // ✅ disabled + checked (THIS IS THE FIX)
            disabled &&
            isChecked &&
            "tw:bg-gray-200 tw:border-gray-300",
            !disabled && "tw:cursor-pointer",
            disabled && "tw:cursor-not-allowed"
          )}

        >
          <Check
            className={cn(
              "tw:h-3.5 tw:w-3.5 tw:transition-opacity",
              isChecked ? "tw:opacity-100" : "tw:opacity-0",
              disabled ? "tw:text-gray-600" : "tw:text-white"
            )}
            strokeWidth={3}
          />
        </div>

        {/* LABEL */}
        {label && (
          <span
            onClick={toggle}
            className={cn(
              "tw:text-sm tw:font-medium",
              disabled
                ? "tw:text-gray-400"
                : "tw:text-gray-700 tw:cursor-pointer",
              error && "tw:text-red-600"
            )}
          >
            {label}
          </span>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";
