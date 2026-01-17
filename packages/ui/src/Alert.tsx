import React from "react";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./Button";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "error" | "info";
  dismissible?: boolean;
  onDismiss?: () => void;
}

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", dismissible, onDismiss, children, ...props }, ref) => {
    const variants = {
      default: "tw:bg-gray-50 tw:text-gray-900 tw:border-gray-200",
      success: "tw:bg-green-50 tw:text-green-900 tw:border-green-200",
      warning: "tw:bg-yellow-50 tw:text-yellow-900 tw:border-yellow-200",
      error: "tw:bg-red-50 tw:text-red-900 tw:border-red-200",
      info: "tw:bg-blue-50 tw:text-blue-900 tw:border-blue-200",
    };

    const icons = {
      default: AlertCircle,
      success: CheckCircle2,
      warning: AlertCircle,
      error: XCircle,
      info: Info,
    };

    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "tw:relative tw:flex tw:items-start tw:gap-3 tw:rounded-lg tw:border tw:p-4",
          variants[variant],
          className
        )}
        {...props}
      >
        <Icon className={cn(
          "tw:h-5 tw:w-5 tw:shrink-0",
          variant === "success" && "tw:text-green-600",
          variant === "warning" && "tw:text-yellow-600",
          variant === "error" && "tw:text-red-600",
          variant === "info" && "tw:text-blue-600",
          variant === "default" && "tw:text-gray-600"
        )} />
        <div className="tw:flex-1">{children}</div>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            className="tw:h-6 tw:w-6 tw:p-0 tw:shrink-0"
            onClick={onDismiss}
          >
            <X className="tw:h-4 tw:w-4" />
          </Button>
        )}
      </div>
    );
  }
);

Alert.displayName = "Alert";

export interface AlertTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h5
        ref={ref}
        className={cn("tw:mb-1 tw:font-medium tw:leading-none", className)}
        {...props}
      />
    );
  }
);

AlertTitle.displayName = "AlertTitle";

export interface AlertDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  AlertDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("tw:text-sm [&_p]:tw:leading-relaxed", className)}
      {...props}
    />
  );
});

AlertDescription.displayName = "AlertDescription";
