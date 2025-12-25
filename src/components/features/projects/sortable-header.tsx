import type { Column, Table } from "@tanstack/react-table";
import {
  ArrowDown10,
  ArrowDownZAIcon,
  ArrowUp01,
  ArrowUpAZIcon,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SortableHeaderProps<TData, TValue> {
  column: Column<TData, TValue>;
  table: Table<TData>;
  title: string;
  isNumeric?: boolean;
  className?: string;
}

export function SortableHeader<TData, TValue>({
  column,
  table,
  title,
  isNumeric = false,
  className,
}: SortableHeaderProps<TData, TValue>) {
  // Get the current sorting state for this column
  const sorting = table.getState().sorting;
  const currentSort = sorting.find((sort) => sort.id === column.id);
  let sortState: "asc" | "desc" | false = false;
  if (currentSort) {
    sortState = currentSort.desc ? "desc" : "asc";
  }

  const getSortIcon = (state: string | false, numeric: boolean) => {
    if (state === "asc") {
      return numeric ? (
        <ArrowUp01 className="ml-2 h-4 w-4 text-primary" />
      ) : (
        <ArrowUpAZIcon className="ml-2 h-4 w-4 text-primary" />
      );
    }

    if (state === "desc") {
      return numeric ? (
        <ArrowDown10 className="ml-2 h-4 w-4 text-primary" />
      ) : (
        <ArrowDownZAIcon className="ml-2 h-4 w-4 text-primary" />
      );
    }

    return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
  };

  // Compute accessible sort state
  let sortDirection: "ascending" | "descending" | "none";
  if (sortState === "asc") {
    sortDirection = "ascending";
  } else if (sortState === "desc") {
    sortDirection = "descending";
  } else {
    sortDirection = "none";
  }

  return (
    <Button
      aria-label={
        sortDirection === "none" ? title : `${title}, sorted ${sortDirection}`
      }
      aria-sort={sortDirection}
      className={cn(
        "-ml-4 h-8 hover:bg-transparent",
        sortState && "sorted font-medium text-foreground",
        className,
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      variant="ghost"
    >
      {title}
      {getSortIcon(sortState, isNumeric)}
    </Button>
  );
}
