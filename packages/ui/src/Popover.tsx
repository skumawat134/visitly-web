import React, { useState, useRef, useEffect, ReactNode } from "react";
import { cn } from "./utils";

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
  contentClassName?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  placement = "bottom",
  className,
  contentClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const placements = {
    top: "tw:bottom-full tw:left-1/2 -tw:translate-x-1/2 tw:mb-2",
    bottom: "tw:top-full tw:left-1/2 -tw:translate-x-1/2 tw:mt-2",
    left: "tw:right-full tw:top-1/2 -tw:translate-y-1/2 tw:mr-2",
    right: "tw:left-full tw:top-1/2 -tw:translate-y-1/2 tw:ml-2",
  };

  return (
    <div ref={popoverRef} className={cn("tw:relative tw:inline-block", className)}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            "tw:absolute tw:z-50 tw:min-w-[200px] tw:rounded-md tw:bg-white tw:shadow-lg tw:border tw:border-gray-200 tw:p-2",
            placements[placement],
            contentClassName
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
