import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./Button";

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  disabled = false,
  className,
  triggerClassName,
  contentClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={dropdownRef} className={cn("tw:relative tw:w-full", className)}>
      <Button
        variant="outline"
        className={cn(
          "tw:w-full tw:justify-between",
          !selectedOption && "tw:text-gray-500",
          triggerClassName
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        rightIcon={<ChevronDown className="tw:h-4 tw:w-4" />}
      >
        {selectedOption ? selectedOption.label : placeholder}
      </Button>
      {isOpen && (
        <div
          className={cn(
            "tw:absolute tw:z-50 tw:mt-1 tw:w-full tw:rounded-md tw:bg-white tw:shadow-lg tw:border tw:border-gray-200 tw:py-1 tw:max-h-60 tw:overflow-auto",
            contentClassName
          )}
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "tw:w-full tw:text-left tw:px-4 tw:py-2 tw:text-sm tw:transition-colors",
                "hover:tw:bg-gray-100",
                value === option.value && "tw:bg-blue-50 tw:text-blue-600",
                option.disabled && "tw:opacity-50 tw:cursor-not-allowed",
                !option.disabled && "tw:cursor-pointer"
              )}
              onClick={() => {
                if (!option.disabled) {
                  onChange?.(option.value);
                  setIsOpen(false);
                }
              }}
              disabled={option.disabled}
            >
              <div className="tw:flex tw:items-center tw:gap-2">
                {option.icon && <span>{option.icon}</span>}
                <span>{option.label}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
