import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/Command";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Popover, PopoverContent } from "@/components/ui/Popover";
import { fetchModelList } from "@/hooks/useModelList";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { findModelUniqueFieldName } from "@/lib/findModelUniqueFieldName";
import { cn } from "@/lib/utils";
import { CellOption } from "@/types/tanstack-table";
import { findModelPrimaryKeyField } from "@/utils/utilities";
import { PopoverAnchor } from "@radix-ui/react-popover";
import { ClassValue } from "clsx";
import { useField, useFormikContext } from "formik";
import { Check, LoaderIcon, Search } from "lucide-react";
import { ChangeEventHandler, useEffect, useState } from "react";
import { useDebounce } from "usehooks-ts";

export type FormikAutocompleteProps = {
  label?: string;
  name: string;
  setFocusOnLoad?: boolean;
  setArrayTouched?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  helperText?: string;
  submitOnChange?: boolean;
  containerClassNames?: ClassValue;
  isNumeric?: boolean;
  wholeNumberOnly?: boolean;
  allowNegative?: boolean;
  disabled?: boolean;
  setHasUpdate?: () => void;
  currency?: string;
  nullAllowed?: boolean;
  onChange?: CellOption["handleChange"];
  onBlur?: CellOption["handleBlur"];
  style?: React.CSSProperties;
  modelConfig: ModelConfig;
};

const FormikAutocompleteLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 p-20">
      <LoaderIcon className="w-3 h-3 animate-spin" />
      <div className="text-xs whitespace-nowrap">Fetching data</div>
    </div>
  );
};

export const FormikAutocomplete = (props: FormikAutocompleteProps) => {
  const { label, name, modelConfig, containerClassNames, style } = props;
  const { submitForm, values } = useFormikContext();
  const modelName = modelConfig.modelName;
  //@ts-ignore
  const parentValue = values[modelName];
  const identifier = findModelUniqueFieldName(modelConfig);
  const defaultSearchTerm = parentValue[identifier];
  const primaryKeyField = findModelPrimaryKeyField(modelConfig).fieldName;

  //@ts-ignore
  const pkValue = values[primaryKeyField];
  const defaultResultItem = { id: pkValue, name: defaultSearchTerm };

  const [field, meta, { setValue }] = useField(props.name);

  const value = field.value;

  const [searchTerm, setSearchTerm] = useState(defaultSearchTerm || "");
  const [results, setResults] = useState<BasicModel[]>([defaultResultItem]);
  const [isSearching, setIsSearching] = useState(false);
  const [isItemSelected, setIsItemSelected] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<null | number>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredResults = results.filter((item) => {
    const itemName = item.name.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();

    return (
      itemName.includes(searchTermLower.toLowerCase()) ||
      itemName === searchTermLower
    );
  });

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const currentValue = e.currentTarget.value;
    if (currentValue === "") {
      setDropdownOpen(false);
    }
    setSearchTerm(currentValue);
    /* setValue(currentValue); */
  };

  const handleItemSelect = (value: string) => {
    if (value) {
      setValue(value);
      //Lookup and place at search term
      const caption = results.find((result) => result.id == value)?.name;
      setSearchTerm(caption);
      setDropdownOpen(false);
      setIsItemSelected(true);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex(
        (prevIndex) => ((prevIndex || 0) + 1) % results.length
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex(
        (prevIndex) => ((prevIndex || 0) - 1) % results.length
      );
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (highlightedIndex !== null) {
      const highlightedItem = results[highlightedIndex];
      const { id, name } = highlightedItem;
      setValue(id);
      setSearchTerm(name);
      setDropdownOpen(false);
      setIsItemSelected(true);
    }
  };

  useEffect(() => {
    const searchHN = async () => {
      if (
        debouncedSearchTerm &&
        debouncedSearchTerm !== defaultSearchTerm &&
        debouncedSearchTerm.length > 1 &&
        !isItemSelected
      ) {
        /* const data = await searchHackerNews(debouncedSearchTerm);
        results = data?.hits || []; */

        setIsSearching(true);
        setDropdownOpen(true);

        const data = await fetchModelList(
          modelConfig,
          modelConfig.modelPath,
          false,
          {
            q: debouncedSearchTerm,
          }
        );
        setResults(data);
        setHighlightedIndex(data.length > 0 ? 0 : null);
      }

      setIsSearching(false);
    };

    //This is necessary so that succeeding change after the isItemSelected turned to true will be shown
    if (isItemSelected) {
      setIsItemSelected(false);
    }
    searchHN();
  }, [debouncedSearchTerm]);

  return (
    <div
      className={cn("flex flex-col w-full gap-1.5", containerClassNames)}
      style={style}
    >
      {!!label && <Label htmlFor={props.name}>{label}</Label>}
      <Popover open={dropdownOpen}>
        <PopoverAnchor asChild>
          <div
            className="relative flex"
            style={{ gridArea: name }}
          >
            <Search className="absolute self-center w-4 h-4 left-3" />
            <Input
              className="pl-10"
              value={searchTerm}
              onChange={handleInputChange}
              onKeyDown={handleInputKeyDown}
              onBlur={handleInputBlur}
              /* onClick={() => setOpen(true)} */
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          onInteractOutside={() => setDropdownOpen(false)}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="p-0 PopoverContent"
        >
          <Command shouldFilter={false}>
            {isSearching ? (
              <FormikAutocompleteLoader />
            ) : (
              <>
                <CommandEmpty>
                  No {modelConfig.verboseModelName} found.
                </CommandEmpty>
                <CommandGroup>
                  {filteredResults.length > 0 ? (
                    filteredResults.map((item, index) => (
                      <CommandItem
                        key={item.id}
                        value={item.id.toString()}
                        onSelect={handleItemSelect}
                        className={cn(
                          index === highlightedIndex &&
                            "bg-accent text-accent-foreground"
                        )}
                        aria-selected={index === highlightedIndex}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            // Check if current internalValue is in the array
                            value && value === item.name.toLowerCase()
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {item.name}
                      </CommandItem>
                    ))
                  ) : (
                    <CommandItem
                      className="flex items-center justify-center py-6 text-sm"
                      disabled
                    >
                      No {modelConfig.verboseModelName} found.
                    </CommandItem>
                  )}
                </CommandGroup>
              </>
            )}
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
