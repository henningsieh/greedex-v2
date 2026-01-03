import type { Column, Table } from "@tanstack/react-table";
import {
  ArrowDown10Icon,
  ArrowDownZAIcon,
  ArrowUp01Icon,
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

const getSortIcon = (state: "asc" | "desc" | false, numeric: boolean) => {
  if (state === "asc") {
    return numeric ? (
      <ArrowUp01Icon className="ml-2 size-5 text-secondary group-hover:text-foreground" />
    ) : (
      <ArrowUpAZIcon className="ml-2 size-5 text-secondary group-hover:text-foreground" />
    );
  }

  if (state === "desc") {
    return numeric ? (
      <ArrowDown10Icon className="ml-2 size-5 text-secondary group-hover:text-foreground" />
    ) : (
      <ArrowDownZAIcon className="ml-2 size-5 text-secondary group-hover:text-foreground" />
    );
  }

  return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
};

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
        "group -ml-4 h-8",
        sortState && "font-medium text-foreground",
        className,
      )}
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      variant="secondaryghost"
    >
      {title}
      {getSortIcon(sortState, isNumeric)}
    </Button>
  );
}
