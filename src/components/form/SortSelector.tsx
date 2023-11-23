import { Button } from "@/components/ui/Button";
import React from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/DropdownMenu";
import { SortingState } from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { SortItem } from "@/interfaces/GeneralInterfaces";
import { iconSize } from "@/lib/tailwind-combo";

interface SortSelectorProps {
  onSortChange: (sortingState: SortingState) => void;
  sortItems: SortItem[];
  sorting: SortingState;
}

const SortSelector: React.FC<SortSelectorProps> = ({
  onSortChange,
  sortItems,
  sorting,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={"sm"}
          className={cn("center gap-2")}
        >
          {sortItems.find((item) => item.value === sorting[0].id)?.caption}{" "}
          {sorting[0].desc ? (
            <ArrowDown className={cn(iconSize)} />
          ) : (
            <ArrowUp className={cn(iconSize)} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[200px]">
        <DropdownMenuGroup>
          {sortItems.map((item) => (
            <DropdownMenuItem
              key={item.value}
              className={cn("flex justify-between text-sm", {
                "bg-accent": sorting[0].id === item.value,
              })}
              onSelect={() => {
                onSortChange([
                  {
                    id: item.value,
                    desc: sorting[0].id === item.value && !sorting[0].desc,
                  },
                ]);
              }}
            >
              {item.caption}
              {sorting[0].id === item.value ? (
                sorting[0].desc ? (
                  <ArrowDown className={cn(iconSize)} />
                ) : (
                  <ArrowUp className={cn(iconSize)} />
                )
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SortSelector;
