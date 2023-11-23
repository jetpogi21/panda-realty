"use client";
import { Label } from "@/components/ui/Label";
import { useField, useFormikContext } from "formik";
import { useEffect, useRef, useState, RefObject } from "react";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/Button";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { FacetedControl } from "@/components/ui/FacetedControl";

export interface FormikFacetedControlProps extends ButtonProps {
  label: string;
  name: string;
  setFocusOnLoad?: boolean;
  setArrayTouched?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  inputRef?: RefObject<HTMLInputElement> | undefined;
  helperText?: string;
  submitOnChange?: boolean;
  containerClassNames?: ClassValue;
  options: BasicModel[];
  limit?: number;
  setHasUpdate?: () => void;
  onChange?: (newValue: unknown) => void;
}

export const FormikFacetedControl: React.FC<FormikFacetedControlProps> = ({
  containerClassNames = "",
  label = "",
  setArrayTouched,
  setFocusOnLoad = false,
  inputRef: propInputRef,
  onKeyDown,
  helperText,
  submitOnChange = false,
  options,
  onChange,
  style,
  ...props
}) => {
  const { submitForm } = useFormikContext();
  const [field, meta, { setValue }] = useField(props.name);
  const fieldValue = field.value?.map((item: number) => item.toString()) || [];

  const inputRef = useRef<HTMLInputElement>(null);

  const hasError = meta.touched && meta.error;

  const handleValueChange = (newValue: string[]) => {
    setValue(newValue);
    onChange && onChange(newValue);

    setArrayTouched && setArrayTouched();
    props.setHasUpdate && props.setHasUpdate();
    submitOnChange && submitForm();
  };

  useEffect(() => {
    if (inputRef && setFocusOnLoad) {
      inputRef.current?.focus();
    }
  }, [inputRef, setFocusOnLoad]);

  return (
    <div
      className={cn(containerClassNames)}
      style={style}
    >
      <FacetedControl
        value={fieldValue}
        onValueChange={handleValueChange}
        options={options}
        title={label}
        limit={props.limit || 4}
      />
      {helperText && (
        <span className="mt-1 text-xs font-bold text-muted-foreground">
          {helperText}
        </span>
      )}
      {hasError && <span className="text-xs text-red-500">{meta.error}</span>}
    </div>
  );
};
