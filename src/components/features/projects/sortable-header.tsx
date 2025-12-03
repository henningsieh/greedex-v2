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
  const sortState = currentSort?.desc ? "desc" : currentSort ? "asc" : false;

  return (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className={cn(
        "-ml-4 h-8 hover:bg-transparent",
        sortState && "sorted font-medium text-foreground",
        className,
      )}
    >
      {title}
      {sortState === "asc" ? (
        isNumeric ? (
          <ArrowUp01 className="ml-2 h-4 w-4 text-primary" />
        ) : (
          <ArrowUpAZIcon className="ml-2 h-4 w-4 text-primary" />
        )
      ) : sortState === "desc" ? (
        isNumeric ? (
          <ArrowDown10 className="ml-2 h-4 w-4 text-primary" />
        ) : (
          <ArrowDownZAIcon className="ml-2 h-4 w-4 text-primary" />
        )
      ) : (
        <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
      )}
    </Button>
  );
}
