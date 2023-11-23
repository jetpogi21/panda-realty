import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { removeItem } from "@/utils/utils";
import { Popover, PopoverContent } from "@/components/ui/Popover";
import { Pill } from "@/components/ui/Pill";
import { Command, CommandGroup, CommandItem } from "@/components/ui/Command";
import { X, Check } from "lucide-react";
import { PopoverAnchor } from "@radix-ui/react-popover";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { useEffect, useRef, useState } from "react";

interface AutocompleteProps {
  list: BasicModel[];
  value: string[];
  onChange?: (value: string[]) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({
  list,
  value,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [internalValue, setInternalValue] = useState(value);
  const [hasFocus, setHasFocus] = useState(false);

  const floatLabel = internalValue.length > 0 || hasFocus;

  //This code filters a list based on case-insensitive name matching and exclusion of IDs present in internalValue.
  const filteredList = list.filter(
    (item) =>
      item.name.toLowerCase().includes(inputValue.toLowerCase()) &&
      !internalValue.includes(item.id.toString())
  );

  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const setInputFocus = () => {
    inputRef.current && inputRef.current.focus();
  };

  const selectElement = (element: Element, select: boolean = true): void => {
    if (select) {
      element.setAttribute("data-selected", "true");
      element.setAttribute("aria-selected", "true");
      return;
    }

    element.removeAttribute("data-selected");
    element.removeAttribute("aria-selected");
  };

  const focusOneItem = () => {
    const hasFocus = document.querySelector("[aria-selected]");
    if (!hasFocus) {
      const item = document.querySelector(
        "[cmdk-item][data-value]:not([aria-disabled])"
      );

      item && selectElement(item);
    }
  };

  const deleteOneItem = (item: string) => {
    setInternalValue(removeItem(internalValue, item) as string[]);
    inputRef.current && inputRef.current.select();
  };

  useEffect(() => {
    //setInputValue("");
    focusOneItem();
    onChange && onChange(internalValue);
  }, [internalValue]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        autocompleteRef.current &&
        !autocompleteRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    //@ts-ignore
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      //@ts-ignore
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Popover open={open}>
      <PopoverAnchor asChild>
        <div
          className={cn(
            "anchor flex gap-2 border border-input min-h-maxh-10 items-center px-3 py-2 mt-2"
          )}
          ref={autocompleteRef}
        >
          <div className="relative flex flex-wrap w-full gap-2">
            {internalValue.map((item, i) => (
              <Pill
                key={item}
                caption={list.find((listItem) => listItem.id === item)?.name!}
                value={item}
                handleDelete={() => deleteOneItem(item)}
              />
            ))}
            <input
              type="text"
              className="z-20 flex-1 text-sm bg-transparent focus:outline-none"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={() => {
                setOpen(true);
                setHasFocus(true);
              }}
              onBlur={() => {
                if (!open) {
                  setHasFocus(false);
                  setInputValue("");
                }
              }}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === "Tab") {
                  if (filteredList.length > 0) {
                    e.preventDefault();
                    const hasFocus = document.querySelector("[aria-selected]");
                    const hasFocusValue = hasFocus?.getAttribute("data-value");
                    if (hasFocusValue) {
                      setInternalValue([...internalValue, hasFocusValue]);
                      //setInputValue("");
                    }
                    return;
                    //setInputFocus();
                  }

                  setOpen(false);
                  setInputValue("");
                }

                if (e.key === "ArrowUp") {
                  const hasFocus = document.querySelector("[aria-selected]");
                  const previousElement = hasFocus?.previousElementSibling;
                  if (previousElement) {
                    selectElement(hasFocus, false);
                    selectElement(previousElement);
                  }
                }

                if (e.key === "ArrowDown") {
                  const hasFocus = document.querySelector("[aria-selected]");
                  const nextElement = hasFocus?.nextElementSibling;
                  if (nextElement) {
                    selectElement(hasFocus, false);
                    selectElement(nextElement);
                  }
                }
              }}
              ref={inputRef}
            />
            {/* <Label className="absolute z-10 font-normal transform -translate-y-1/2 text-muted-foreground top-1/2">
              Some long label here brother
            </Label> */}
            <span
              className={cn(
                "absolute z-10 transition-all duration-200 ease-in-out transform -translate-y-1/2 text-sm text-muted-foreground top-1/2",
                {
                  "z-30 px-2 -top-[12px] text-xxs bg-background -left-2":
                    floatLabel,
                }
              )}
            >
              Some long label here brother
            </span>
          </div>
          {internalValue.length > 0 && (
            <Button
              tabIndex={-1}
              variant="ghost"
              className="flex items-center justify-center w-4 h-4 px-0 rounded-full"
              onClick={() => {
                setInternalValue([]);
                setInputFocus();
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
          <PopoverContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            sideOffset={-1}
            className="px-0 py-0 rounded-t-none PopoverContent"
            ref={popoverRef}
          >
            <Command>
              <CommandGroup>
                {filteredList.length > 0 ? (
                  filteredList.map((listItem) => (
                    <CommandItem
                      className="cursor-pointer"
                      key={listItem.id}
                      onSelect={(currentValue) => {
                        const newValue = internalValue.includes(currentValue)
                          ? removeItem(value, currentValue)
                          : [...internalValue, currentValue];
                        setInternalValue(newValue as string[]);

                        setInputFocus();
                        //setOpen(false);
                      }}
                    >
                      {listItem.name}
                    </CommandItem>
                  ))
                ) : (
                  <CommandItem disabled={true}>No options</CommandItem>
                )}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </div>
      </PopoverAnchor>
    </Popover>
  );
};

export { Autocomplete };
