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
import { ChevronsUpDown, Check, Scroll } from "lucide-react";
import React, { KeyboardEventHandler, forwardRef, useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/ScrollArea";

interface Combobox {
  name?: string;
  value: string | number;
  onChange?: (internalValue: string) => void;
  onTabKeyDown?: (name: string) => void;
  list: BasicModel[];
  caption: string;
}

const Combobox = forwardRef<HTMLButtonElement, Combobox>((props, ref) => {
  const { value, onChange, list, caption, name, onTabKeyDown } = props;
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [withSelected, setWithSelected] = useState(false);

  const filteredOptions = list.filter((item) =>
    item.name.toLowerCase().includes(input.toLowerCase())
  );

  const handeInputChange = (newInput: string) => {
    setInput(newInput);
  };

  const handleKeyDown: KeyboardEventHandler<HTMLButtonElement> = (event) => {
    const key = event.key;
    const nonAlphanumericKeys = [
      "Tab",
      "Alt",
      "Shift",
      "Control",
      "Meta",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Enter",
      "Escape",
      "Backspace",
      "Delete",
    ];

    if (
      !nonAlphanumericKeys.includes(key) &&
      ((key >= "A" && key <= "Z") || // A-Z
        (key >= "a" && key <= "z") || // a-z
        (key >= "0" && key <= "9")) // 0-9
    ) {
      setInput(input + key);
      setOpen(true);
    }
  };

  const handleTabKeyDown: KeyboardEventHandler<HTMLInputElement> = (event) => {
    const key = event.key;

    if (key === "Tab") {
      event.preventDefault();
      if (onTabKeyDown && name) {
        if (input && filteredOptions.length > 0) {
          onChange && onChange(filteredOptions[0].id as string);
        }
        onTabKeyDown(name);
      }
      return;
    }
  };

  return (
    <Popover
      open={open}
      onOpenChange={(open) => {
        //meaning this is closed
        if (!open && filteredOptions.length === 0) {
          setInput("");
        }
        setOpen(open);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size={"sm"}
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between w-full whitespace-nowrap text-ellipsis",
            !value && "text-muted-foreground"
          )}
          name={name || ""}
          ref={ref}
          id={name}
          onBlur={() => {
            setWithSelected(false);
          }}
          onKeyDown={handleKeyDown}
        >
          {/* Display selected internalValues or default text */}
          {value
            ? list.find(
                (item) => item.id.toString().toLowerCase() === value.toString()
              )?.name
            : `Select ${caption}`}
          <ChevronsUpDown className="w-4 h-4 ml-2 opacity-50 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 PopoverContent">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={`Search ${caption}`}
            value={input}
            onValueChange={handeInputChange}
            onKeyDown={handleTabKeyDown}
          />
          <CommandEmpty>No {caption} found.</CommandEmpty>
          {filteredOptions.length > 0 && (
            <ScrollArea className="h-[200px]">
              <CommandGroup>
                {filteredOptions.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.id.toString()}
                    onSelect={(value) => {
                      onChange && onChange(value);
                      setWithSelected(true);
                      setOpen(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        // Check if current internalValue is in the array
                        value &&
                          value.toString() === item.id.toString().toLowerCase()
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </ScrollArea>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
});

export default Combobox;

Combobox.displayName = "Combobox";
