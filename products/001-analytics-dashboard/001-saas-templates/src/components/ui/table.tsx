import * as React from "react"

import { cn } from "@/lib/utils"
import { figma } from "@/lib/figma-dev"

/**
 * SprouX Table
 *
 * Figma: [SprouX - DS] Foundation & Component
 *
 * Data table with composable sub-components:
 * Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption
 */
function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div data-slot="table-container" className="relative w-full overflow-auto">
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b border-border transition-colors hover:bg-muted data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      scope="col"
      className={cn(
        "h-3xl px-md text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pl-sm [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-md align-middle [&:has([role=checkbox])]:pl-sm [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-md text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

/**
 * TableCard — Mobile card representation of a table row.
 * Use below `md` breakpoint as a responsive alternative to the full table.
 */
function TableCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-card"
      {...figma("Table Card", { State: "Default" })}
      className={cn(
        "rounded-xl border border-border-subtle p-md flex flex-col gap-sm transition-colors cursor-pointer hover:bg-surface-raised",
        className,
      )}
      {...props}
    />
  )
}

/**
 * TableCardRow — A justify-between flex row inside TableCard.
 */
function TableCardRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="table-card-row"
      {...figma("Table Card Row", { State: "Default" })}
      className={cn("flex items-center justify-between", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableCard,
  TableCardRow,
}
