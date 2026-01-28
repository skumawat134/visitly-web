import React, { useState, type ReactNode } from "react";
import { cn } from "./utils";

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: "top" | "bottom" | "left" | "right";
  className?: string;
  contentClassName?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  placement = "top",
  className,
  contentClassName,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const placements = {
    top: "tw:bottom-full tw:left-1/2 -tw:translate-x-1/2 tw:mb-2",
    bottom: "tw:top-full tw:left-1/2 -tw:translate-x-1/2 tw:mt-2",
    left: "tw:right-full tw:top-1/2 -tw:translate-y-1/2 tw:mr-2",
    right: "tw:left-full tw:top-1/2 -tw:translate-y-1/2 tw:ml-2",
  };

  return (
    <div
      className={cn("tw:relative tw:inline-block", className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "tw:absolute tw:z-50 tw:px-2 tw:py-1 tw:text-sm tw:text-white tw:bg-gray-900 tw:rounded tw:whitespace-nowrap",
            placements[placement],
            "before:tw:content-[''] before:tw:absolute",
            placement === "top" &&
              "before:tw:top-full before:tw:left-1/2 before:-tw:translate-x-1/2 before:tw:border-4 before:tw:border-transparent before:tw:border-t-gray-900",
            placement === "bottom" &&
              "before:tw:bottom-full before:tw:left-1/2 before:-tw:translate-x-1/2 before:tw:border-4 before:tw:border-transparent before:tw:border-b-gray-900",
            placement === "left" &&
              "before:tw:left-full before:tw:top-1/2 before:-tw:translate-y-1/2 before:tw:border-4 before:tw:border-transparent before:tw:border-l-gray-900",
            placement === "right" &&
              "before:tw:right-full before:tw:top-1/2 before:-tw:translate-y-1/2 before:tw:border-4 before:tw:border-transparent before:tw:border-r-gray-900",
            contentClassName
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
};
