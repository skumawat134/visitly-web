import React from "react";
import { User } from "lucide-react";
import { cn } from "./utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallback?: React.ReactNode;
}

export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt, size = "md", fallback, ...props }, ref) => {
    const sizes = {
      sm: "tw:h-8 tw:w-8 tw:text-xs",
      md: "tw:h-10 tw:w-10 tw:text-sm",
      lg: "tw:h-12 tw:w-12 tw:text-base",
      xl: "tw:h-16 tw:w-16 tw:text-lg",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "tw:relative tw:inline-flex tw:items-center tw:justify-center tw:rounded-full tw:bg-gray-200 tw:text-gray-600 tw:overflow-hidden",
          sizes[size],
          className
        )}
        {...props}
      >
        {src ? (
          <img
            src={src}
            alt={alt || "Avatar"}
            className="tw:h-full tw:w-full tw:object-cover"
          />
        ) : (
          fallback || <User className={cn("tw:h-1/2 tw:w-1/2")} />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  max?: number;
}

export const AvatarGroup = React.forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, children, max = 3, ...props }, ref) => {
    const childrenArray = React.Children.toArray(children);
    const visibleAvatars = childrenArray.slice(0, max);
    const remainingCount = childrenArray.length - max;

    return (
      <div
        ref={ref}
        className={cn("tw:flex tw:items-center -tw:space-x-2", className)}
        {...props}
      >
        {visibleAvatars.map((child, index) => (
          <div key={index} className="tw:ring-2 tw:ring-white tw:rounded-full">
            {child}
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="tw:ring-2 tw:ring-white tw:rounded-full">
            <Avatar
              size="md"
              className="tw:bg-gray-400 tw:text-white"
              fallback={`+${remainingCount}`}
            />
          </div>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = "AvatarGroup";
