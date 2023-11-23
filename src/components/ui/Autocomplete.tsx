import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { Input } from "@/components/ui/Input";
import { Popover, PopoverContent } from "@/components/ui/Popover";
import { cn } from "@/lib/utils";
import { PopoverAnchor } from "@radix-ui/react-popover";
import { Check, LoaderIcon, Search } from "lucide-react";
import { ChangeEventHandler, useState } from "react";

export const Autocomplete = () => {
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const currentValue = e.currentTarget.value;
    setOpen(currentValue.length > 0);
    setValue(currentValue);
  };

  const handleItemSelect = (item: string) => {
    setValue(item);
    setOpen(false);
  };

  const list = [
    "Spider-Man",
    "Iron Man",
    "Thor",
    "Captain America",
    "Hulk",
    "Black Widow",
    "Doctor Strange",
    "Black Panther",
    "Scarlet Witch",
    "Ant-Man",
  ];

  return (
    <Popover open={open}>
      <PopoverAnchor>
        <div className="relative flex">
          <Search className="absolute self-center w-4 h-4 left-3" />
          <Input
            className="pl-10"
            value={value}
            onChange={handleInputChange}
            onClick={() => setOpen(true)}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent
        onInteractOutside={() => setOpen(false)}
        onOpenAutoFocus={(e) => e.preventDefault()}
        className="p-0 PopoverContent"
      >
        <Command shouldFilter={false}>
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-2 p-20">
              <LoaderIcon className="w-3 h-3 animate-spin" />
              <div className="text-xs whitespace-nowrap">Fetching data</div>
            </div>
          ) : (
            <>
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {list
                  .filter((item) =>
                    item.toLowerCase().includes(value.toLowerCase())
                  )
                  .map((item) => (
                    <CommandItem
                      key={item}
                      value={item}
                      onSelect={(value) => {
                        setValue(value);
                        setOpen(false);
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          // Check if current internalValue is in the array
                          value && value === item.toLowerCase()
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {item}
                    </CommandItem>
                  ))}
              </CommandGroup>
            </>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
};
