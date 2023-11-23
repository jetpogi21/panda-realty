"use client";
import { Label } from "@/components/ui/Label";
import { useField, useFormikContext } from "formik";
import { useEffect, useRef, useState, RefObject, forwardRef } from "react";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/Button";
import { DatePicker, DatePickerProps } from "@/components/ui/DatePicker";
import { SelectSingleEventHandler } from "react-day-picker";

export interface FormikDatePickerProps
  extends ButtonProps,
    Pick<DatePickerProps, "format"> {
  label?: string;
  name: string;
  setFocusOnLoad?: boolean;
  setArrayTouched?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  inputRef?: RefObject<HTMLInputElement> | undefined;
  helperText?: string;
  submitOnChange?: boolean;
  containerClassNames?: ClassValue;
  showLabel?: boolean;
  setHasUpdate?: () => void;
  onChange?: (newValue: unknown) => void;
  style?: React.CSSProperties;
}

const FormikDatePicker = forwardRef<any, FormikDatePickerProps>(
  (
    {
      containerClassNames = "",
      label = "",
      setArrayTouched,
      setFocusOnLoad = false,
      inputRef: propInputRef,
      onKeyDown,
      helperText,
      submitOnChange = false,
      showLabel = true,
      format,
      onChange,
      style,
      ...props
    },
    ref
  ) => {
    const { submitForm } = useFormikContext();
    const [field, meta, { setValue }] = useField(props.name);

    const fieldValue = field.value
      ? field.value instanceof Date
        ? field.value
        : new Date(field.value)
      : null;

    const inputRef = useRef<HTMLInputElement>(null);

    const hasError = meta.touched && meta.error;

    const handleChange: SelectSingleEventHandler = (newValue) => {
      setValue(newValue);
      setArrayTouched && setArrayTouched();
      props.setHasUpdate && props.setHasUpdate();
      submitOnChange && submitForm();
      onChange && onChange(newValue);
    };

    useEffect(() => {
      if (inputRef && setFocusOnLoad) {
        inputRef.current?.focus();
      }
    }, [inputRef, setFocusOnLoad]);

    return (
      <div
        className={cn("flex flex-col w-full gap-1.5", containerClassNames)}
        style={style}
      >
        {showLabel && !!label && <Label htmlFor={props.name}>{label}</Label>}
        <DatePicker
          value={fieldValue}
          handleChange={handleChange}
        />

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

FormikDatePicker.displayName = "FormikDatePicker";
export { FormikDatePicker };
