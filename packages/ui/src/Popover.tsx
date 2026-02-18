import React, { useState, useRef, useEffect, type ReactNode } from "react";
import { cn } from "./utils";

export interface PopoverProps {
  trigger: ReactNode;
  content: ReactNode | ((props: { close: () => void }) => ReactNode);
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
  contentClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  content,
  placement = "bottom",
  className,
  contentClassName,
  open: controlledOpen,
  onOpenChange,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const popoverRef = useRef<HTMLDivElement>(null);

  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    }
    if (!isControlled) {
      setInternalOpen(value);
    }
  };

  const close = () => setIsOpen(false);

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
      <div onClick={() => setIsOpen(!isOpen)} className="tw:cursor-pointer">{trigger}</div>
      {isOpen && (
        <div
          className={cn(
            "tw:absolute tw:z-50 tw:min-w-[200px] tw:rounded-md tw:bg-white tw:shadow-lg tw:border tw:border-gray-200 tw:p-2",
            placements[placement],
            contentClassName
          )}
        >
          {typeof content === "function" ? content({ close }) : content}
        </div>
      )}
    </div>
  );
};
