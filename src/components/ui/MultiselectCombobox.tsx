import { Button } from "@/components/ui/Button";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/Popover";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/Command";
import { ChevronsUpDown, Check } from "lucide-react";
import React from "react";

interface MultiselectComboboxProps {
  value: string[];
  onChange?: (internalValue: string[]) => void;
  list: BasicModel[];
  caption: string;
  pluralizedCaption?: string;
}

const MultiselectCombobox: React.FC<MultiselectComboboxProps> = ({
  value,
  onChange,
  list,
  caption,
  pluralizedCaption = `${caption}s`,
}) => {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string[]>(value);

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between w-full"
        >
          {/* Display selected internalValues or default text */}
          {internalValue.length > 0
            ? internalValue
                .map((val) => list.find((item) => item.id === val)?.name)
                .join(", ")
            : `Select ${pluralizedCaption}...`}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 PopoverContent">
        <Command>
          <CommandInput placeholder={`Search ${caption}...`} />
          <CommandEmpty>No {caption} found.</CommandEmpty>
          <CommandGroup>
            {list.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={(currentinternalValue) => {
                  // Toggle selected internalValues in the array
                  setInternalValue((previnternalValue) =>
                    previnternalValue.includes(currentinternalValue)
                      ? previnternalValue.filter(
                          (val) => val !== currentinternalValue
                        )
                      : [...previnternalValue, currentinternalValue]
                  );
                  //setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    // Check if current internalValue is in the array
                    internalValue.includes(item.id.toString())
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {item.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiselectCombobox;
