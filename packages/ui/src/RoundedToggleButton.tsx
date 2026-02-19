import React from "react";

export interface RoundedToggleButtonProps {
  /** Text displayed inside the button */
  label: string;

  /** Whether the button is in active (selected) state */
  isActive: boolean;

  /** Click handler */
  onClick: () => void;

  /** Optional additional Tailwind classes */
  className?: string;

  /** Disable button interaction */
  disabled?: boolean;

  /** Optional button type (default: button) */
  type?: "button" | "submit" | "reset";
}

export const RoundedToggleButton: React.FC<RoundedToggleButtonProps> = ({
  label,
  isActive,
  onClick,
  className = "",
  disabled = false,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        tw:px-4 
        tw:py-2 
        tw:rounded-full 
        tw:text-[13px] 
        tw:font-medium
        tw:transition-all 
        tw:duration-200
        tw:border
        ${disabled ? "tw:opacity-50 tw:cursor-not-allowed" : "tw:cursor-pointer"}
        ${
          isActive
            ? "tw:bg-[#e8e5ef] tw:text-[#5E2CED] tw:border-[#5E2CED]"
            : "tw:bg-white tw:text-[#4B5563] tw:border-[#E5E7EB] hover:tw:bg-gray-50"
        }
        ${className}
      `}
    >
      {label}
    </button>
  );
};
