"use client";
import { Label } from "@/components/ui/Label";
import { useField, useFormikContext } from "formik";
import { useEffect, useRef, useState, RefObject, forwardRef } from "react";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

export interface FormikCheckboxProps extends ButtonProps {
  label?: string;
  name: string;
  setFocusOnLoad?: boolean;
  setArrayTouched?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  inputRef?: RefObject<HTMLButtonElement> | undefined;
  helperText?: string;
  submitOnChange?: boolean;
  containerClassNames?: ClassValue;
  setHasUpdate?: () => void;
  onChange?: (newValue: unknown) => void;
  style?: React.CSSProperties;
}

const FormikCheckbox = forwardRef<any, FormikCheckboxProps>(
  (
    {
      containerClassNames = "",
      label = "",
      setArrayTouched,
      setFocusOnLoad = false,
      onKeyDown,
      helperText,
      submitOnChange = false,
      setHasUpdate,
      onChange,
      style,
      ...props
    },
    ref
  ) => {
    const { submitForm } = useFormikContext();
    const [field, meta, { setValue }] = useField(props.name);
    const fieldValue =
      typeof field.value === "number" ? Boolean(field.value) : field.value;
    const [internalVal, setInternalVal] = useState(fieldValue);

    const inputRef = useRef<HTMLButtonElement>(null);

    const hasError = meta.touched && meta.error;

    const handleChange = (checked: boolean) => {
      setArrayTouched && setArrayTouched();
      setHasUpdate && setHasUpdate();
      setValue(checked);
      onChange && onChange(checked);
      if (submitOnChange) {
        submitForm();
      }
    };

    useEffect(() => {
      if (fieldValue !== internalVal) {
        setInternalVal(fieldValue);
      }
    }, [fieldValue]);

    useEffect(() => {
      if (inputRef && setFocusOnLoad) {
        inputRef.current?.focus();
      }
    }, [inputRef, setFocusOnLoad]);

    return (
      <div
        className={cn(
          "flex gap-1.5 items-center justify-start",
          containerClassNames
        )}
        style={style}
      >
        <Checkbox
          checked={fieldValue}
          onCheckedChange={handleChange}
          ref={ref || inputRef}
          onKeyDown={(e) => {
            onKeyDown && onKeyDown(e);
          }}
          id={props.name}
          {...props}
        />
        {!!label && <Label htmlFor={props.name}>{label}</Label>}
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

FormikCheckbox.displayName = "FormikCheckbox";
export { FormikCheckbox };
