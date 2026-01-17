import React from "react";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "./utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHome?: boolean;
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  separator = <ChevronRight className="tw:h-4 tw:w-4 tw:text-gray-400" />,
  showHome = true,
  className,
  onItemClick,
}) => {
  const allItems = showHome
    ? [{ label: "Home", href: "/", icon: <Home className="tw:h-4 tw:w-4" /> }, ...items]
    : items;

  return (
    <nav
      className={cn("tw:flex tw:items-center tw:space-x-2", className)}
      aria-label="Breadcrumb"
    >
      <ol className="tw:flex tw:items-center tw:space-x-2">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1;

          return (
            <li key={index} className="tw:flex tw:items-center">
              {index > 0 && (
                <span className="tw:mx-2 tw:text-gray-400">{separator}</span>
              )}
              {isLast ? (
                <span className="tw:text-gray-500 tw:font-medium">
                  {item.icon && <span className="tw:mr-1 tw:inline-block">{item.icon}</span>}
                  {item.label}
                </span>
              ) : (
                <button
                  onClick={() => onItemClick?.(item, index)}
                  className={cn(
                    "tw:flex tw:items-center tw:text-sm tw:font-medium tw:text-gray-700 hover:tw:text-gray-900",
                    item.href && "tw:cursor-pointer",
                    !item.href && !onItemClick && "tw:cursor-default"
                  )}
                >
                  {item.icon && <span className="tw:mr-1">{item.icon}</span>}
                  {item.label}
                </button>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
