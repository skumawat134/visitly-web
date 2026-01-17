import React from "react";
import { cn } from "./utils";

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="tw:relative tw:w-full tw:overflow-auto">
        <table
          ref={ref}
          className={cn("tw:w-full tw:caption-bottom tw:text-sm", className)}
          {...props}
        />
      </div>
    );
  }
);

Table.displayName = "Table";

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={cn("[&_tr]:tw:border-b", className)}
      {...props}
    />
  );
});

TableHeader.displayName = "TableHeader";

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(({ className, ...props }, ref) => {
  return (
    <tbody
      ref={ref}
      className={cn("[&_tr:last-child]:tw:border-0", className)}
      {...props}
    />
  );
});

TableBody.displayName = "TableBody";

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn(
          "tw:border-b tw:transition-colors hover:tw:bg-gray-50 data-[state=selected]:tw:bg-gray-100",
          className
        )}
        {...props}
      />
    );
  }
);

TableRow.displayName = "TableRow";

export interface TableHeadProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHead = React.forwardRef<HTMLTableCellElement, TableHeadProps>(
  ({ className, ...props }, ref) => {
    return (
      <th
        ref={ref}
        className={cn(
          "tw:h-12 tw:px-4 tw:text-left tw:align-middle tw:font-medium tw:text-gray-500 [&:has([role=checkbox])]:tw:pr-0",
          className
        )}
        {...props}
      />
    );
  }
);

TableHead.displayName = "TableHead";

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          "tw:p-4 tw:align-middle [&:has([role=checkbox])]:tw:pr-0",
          className
        )}
        {...props}
      />
    );
  }
);

TableCell.displayName = "TableCell";

export interface TableCaptionProps
  extends React.HTMLAttributes<HTMLTableCaptionElement> {}

export const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  TableCaptionProps
>(({ className, ...props }, ref) => {
  return (
    <caption
      ref={ref}
      className={cn("tw:mt-4 tw:text-sm tw:text-gray-500", className)}
      {...props}
    />
  );
});

TableCaption.displayName = "TableCaption";
