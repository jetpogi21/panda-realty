"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Label } from "@/components/ui/Label";
import { useField, useFormikContext } from "formik";
import { useEffect, useRef, useState, RefObject, forwardRef } from "react";
import _ from "lodash";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { Button, ButtonProps } from "@/components/ui/Button";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { ChevronDown, X } from "lucide-react";

export interface FormikSelectProps extends ButtonProps {
  label?: string;
  name: string;
  setFocusOnLoad?: boolean;
  setArrayTouched?: () => void;
  helperText?: string;
  submitOnChange?: boolean;
  containerClassNames?: ClassValue;
  options: BasicModel[];
  showLabel: boolean;
  allowBlank: boolean;
  setHasUpdate?: () => void;
  onChange?: (newValue: unknown) => void;
  style?: React.CSSProperties;
}

export const FormikSelect = forwardRef<HTMLButtonElement, FormikSelectProps>(
  (
    {
      containerClassNames = "",
      label = "",
      setArrayTouched,
      setFocusOnLoad = false,
      helperText,
      submitOnChange = false,
      options,
      showLabel = true,
      allowBlank = false,
      onChange,
      style,
      ...props
    },
    ref
  ) => {
    const { submitForm } = useFormikContext();
    const [field, meta, { setValue }] = useField(props.name);
    const fieldValue = field.value || "";

    const [internalVal, setInternalVal] = useState(fieldValue);

    const hasError = meta.touched && meta.error;

    const handleChange = (newValue: string) => {
      setValue(newValue);
      setArrayTouched && setArrayTouched();
      onChange && onChange(newValue);

      props.setHasUpdate && props.setHasUpdate();
      submitOnChange && submitForm();
    };

    useEffect(() => {
      if (fieldValue !== internalVal) {
        setInternalVal(fieldValue);
      }
    }, [fieldValue]);

    return (
      <div
        className={cn("flex flex-col w-full gap-1.5", containerClassNames)}
        style={style}
      >
        {showLabel && !!label && <Label htmlFor={props.name}>{label}</Label>}
        <div
          className={cn("flex", {
            "-mr-4": allowBlank && fieldValue,
          })}
        >
          <Select
            onValueChange={handleChange}
            defaultValue={fieldValue}
            value={
              typeof fieldValue === "number"
                ? fieldValue.toString()
                : fieldValue
            }
          >
            <SelectTrigger
              className="whitespace-nowrap"
              id={props.name}
              ref={ref}
            >
              {fieldValue ? (
                <>
                  <SelectValue />
                  <SelectPrimitive.Icon asChild>
                    <ChevronDown className="w-4 h-4 ml-6 opacity-50" />
                  </SelectPrimitive.Icon>
                </>
              ) : (
                <>
                  <span className="text-muted-foreground">{label}</span>
                  <SelectPrimitive.Icon asChild>
                    <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                  </SelectPrimitive.Icon>
                </>
              )}
            </SelectTrigger>
            <SelectContent>
              {options?.map(({ id, name }) => (
                <SelectItem
                  value={id.toString()}
                  key={id}
                >
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {allowBlank && fieldValue && (
            <Button
              type="button"
              variant={"link"}
              size={"sm"}
              className="relative self-center w-auto h-4 p-0 right-12 hover:bg-accent"
              onClick={(e) => {
                e.stopPropagation();
                setValue("");
              }}
            >
              <X className="w-4 h-4 text-destructive" />
            </Button>
          )}
        </div>

        {helperText && (
          <span className="mt-1 text-xs font-bold text-muted-foreground">
            {helperText}
          </span>
        )}
        {hasError && <span className="text-xs text-red-500">{meta.error}</span>}
      </div>
    );
  }
);

FormikSelect.displayName = "FormikSelect";
