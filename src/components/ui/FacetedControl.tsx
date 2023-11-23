import * as React from "react";
import { CheckIcon, PlusCircleIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/Command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/Popover";
import { Separator } from "@/components/ui/Separator";
import { useEffect, useState } from "react";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { center } from "@/lib/tailwind-combo";
import useScreenSize from "@/hooks/useScreenSize";

interface FacetedControlProps {
  value: string[];
  onValueChange?: (newSelectedValues: string[]) => void;
  title?: string;
  limit?: number;
  options: BasicModel[];
}

export const FacetedControl: React.FC<FacetedControlProps> = ({
  onValueChange,
  value,
  title,
  options,
  limit = 4,
}) => {
  const isMedium = useScreenSize("md");
  const [internalVal, setInternalVal] = useState(value);
  const [input, setInput] = useState("");
  const filteredOptions = options.filter((item) =>
    item.name.toLowerCase().includes(input.toLowerCase())
  );

  const handleChange = (newInternalVal: string[]) => {
    onValueChange && onValueChange(newInternalVal);
    setInternalVal(newInternalVal);
  };

  const handeInputChange = (newInput: string) => {
    setInput(newInput);
  };

  useEffect(() => {
    setInternalVal(value);
  }, [value]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex flex-col w-full h-auto gap-2 p-2 border-2 border-dashed md:flex-row md:w-auto"
        >
          <div className={cn(center, "gap-1")}>
            <PlusCircleIcon className="w-4 h-4 mr-2" />
            {title}
          </div>

          {internalVal.length > 0 && (
            <>
              <Separator
                orientation={isMedium ? "horizontal" : "vertical"}
                className="w-full md:w-[1px] md:mx-2 md:h-4"
              />
              {/* <Badge
                variant="secondary"
                className="px-1 font-normal rounded-sm lg:hidden"
              >
                {internalVal.length}
              </Badge> */}
              <div className="flex flex-wrap justify-center gap-2 md:flex-nowrap">
                {internalVal.length > limit ? (
                  <Badge
                    variant="secondary"
                    className="px-1 font-normal rounded-sm whitespace-nowrap"
                  >
                    {internalVal.length} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) =>
                      internalVal.includes(option.id.toString())
                    )
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.name}
                        className="px-1 font-normal rounded-sm whitespace-nowrap"
                      >
                        {option.name}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[200px] p-0"
        align="start"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={title}
            value={input}
            onValueChange={handeInputChange}
          />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => {
                const isSelected = internalVal.includes(option.id.toString());
                return (
                  <CommandItem
                    key={option.id}
                    onSelect={() => {
                      if (isSelected) {
                        const newInternalVal = internalVal.filter(
                          (item) => item !== option.id.toString()
                        );

                        handleChange(newInternalVal);
                      } else {
                        const newInternalVal = [
                          ...internalVal,
                          option.id.toString(),
                        ];
                        handleChange(newInternalVal);
                      }
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>
                    {option.icon && (
                      <option.icon className="w-4 h-4 mr-2 text-muted-foreground" />
                    )}
                    <span>{option.name}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {internalVal.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      const newInternalVal: string[] = [];
                      handleChange(newInternalVal);
                    }}
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
