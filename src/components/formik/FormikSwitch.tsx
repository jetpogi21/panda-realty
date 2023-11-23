"use client";
import { Label } from "@/components/ui/Label";
import { useField, useFormikContext } from "formik";
import {
  useEffect,
  useRef,
  useState,
  RefObject,
  FormEventHandler,
  CSSProperties,
} from "react";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import { Switch, SwitchProps } from "@/components/ui/Switch";
import { ButtonProps } from "@/components/ui/Button";

export interface FormikSwitchProps extends SwitchProps {
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
  style?: CSSProperties;
}

export const FormikSwitch: React.FC<FormikSwitchProps> = ({
  containerClassNames = "",
  label = "",
  setArrayTouched,
  setFocusOnLoad = false,
  inputRef: propInputRef,
  onKeyDown,
  helperText,
  submitOnChange = false,
  setHasUpdate,
  onChange,
  style,
  ...props
}) => {
  const { submitForm } = useFormikContext();
  const [field, meta, { setValue }] = useField(props.name);
  const fieldValue = field.value;
  const [internalVal, setInternalVal] = useState(fieldValue);

  const inputRef = useRef<HTMLButtonElement>(null);

  const hasError = meta.touched && meta.error;

  const handleChange = (checked: boolean) => {
    setValue(checked);
    onChange && onChange(checked);

    setHasUpdate && setHasUpdate();
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
        "flex flex-col w-full gap-1.5 items-center",
        containerClassNames
      )}
      style={style}
    >
      <Switch
        checked={fieldValue}
        onCheckedChange={handleChange}
        ref={propInputRef || inputRef}
        id={props.name}
        {...props}
      />
      {!!label && (
        <Label
          htmlFor={props.name}
          className="whitespace-nowrap"
        >
          {label}
        </Label>
      )}
      {helperText && (
        <span className="mt-1 text-xs font-bold text-muted-foreground">
          {helperText}
        </span>
      )}
      {hasError && <span className="text-xs text-red-500">{meta.error}</span>}
    </div>
  );
};
