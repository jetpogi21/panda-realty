import { Column } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {
  ArrowDown,
  ArrowDownIcon,
  ArrowDownUp,
  ArrowUp,
  ArrowUpIcon,
  EyeOffIcon,
} from "lucide-react";

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  //@ts-ignore
  const alignment = column.columnDef.meta.alignment;

  if (!column.getCanSort()) {
    return (
      <div
        className={cn(className, {
          "flex justify-center": alignment === "center",
          "flex justify-end": alignment === "right",
        })}
      >
        {title}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center space-x-2",
        {
          "justify-center": alignment === "center",
          "justify-start": alignment === "left",
          "justify-end": alignment === "right",
        },
        className
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8 data-[state=open]:bg-accent"
          >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
              <ArrowDown className="w-4 h-4 ml-2" />
            ) : column.getIsSorted() === "asc" ? (
              <ArrowUp className="w-4 h-4 ml-2" />
            ) : (
              <ArrowDownUp className="w-4 h-4 ml-2" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
            <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Asc
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
            <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Desc
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
