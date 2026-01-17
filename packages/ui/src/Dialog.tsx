import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./Button";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  onOpenChange,
  children,
}) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="tw:fixed tw:inset-0 tw:z-50 tw:flex tw:items-center tw:justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div className="tw:fixed tw:inset-0 tw:bg-black/50" />
      <div
        className="tw:relative tw:z-50 tw:w-full tw:max-w-lg tw:mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export interface DialogContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onClose?: () => void;
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(({ className, children, onClose, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "tw:bg-white tw:rounded-lg tw:shadow-xl tw:p-6 tw:max-h-[90vh] tw:overflow-y-auto",
        className
      )}
      {...props}
    >
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          className="tw:absolute tw:top-4 tw:right-4 tw:h-6 tw:w-6 tw:p-0"
          onClick={onClose}
        >
          <X className="tw:h-4 tw:w-4" />
        </Button>
      )}
      {children}
    </div>
  );
});

DialogContent.displayName = "DialogContent";

export interface DialogHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("tw:flex tw:flex-col tw:space-y-1.5 tw:mb-4", className)}
        {...props}
      />
    );
  }
);

DialogHeader.displayName = "DialogHeader";

export interface DialogTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className, ...props }, ref) => {
    return (
      <h2
        ref={ref}
        className={cn(
          "tw:text-lg tw:font-semibold tw:leading-none tw:tracking-tight",
          className
        )}
        {...props}
      />
    );
  }
);

DialogTitle.displayName = "DialogTitle";

export interface DialogDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

export const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  DialogDescriptionProps
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("tw:text-sm tw:text-gray-500", className)}
      {...props}
    />
  );
});

DialogDescription.displayName = "DialogDescription";

export interface DialogFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "tw:flex tw:flex-col-reverse sm:tw:flex-row sm:tw:justify-end sm:tw:space-x-2 tw:mt-4",
          className
        )}
        {...props}
      />
    );
  }
);

DialogFooter.displayName = "DialogFooter";
