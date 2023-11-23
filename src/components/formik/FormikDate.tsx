"use client";
import { Label } from "@/components/ui/Label";
import { useField, useFormikContext } from "formik";
import {
  useEffect,
  useRef,
  useState,
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
} from "react";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/Button";
import { DatePickerProps } from "@/components/ui/DatePicker";
import { Input } from "@/components/ui/Input";
import { isValidDate, toValidDateTime } from "@/utils/utilities";
import { convertDateStringToYYYYMMDD } from "@/utils/utils";

export interface FormikDateProps
  extends ButtonProps,
    Pick<DatePickerProps, "format"> {
  label?: string;
  name: string;
  setFocusOnLoad?: boolean;
  setArrayTouched?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  helperText?: string;
  submitOnChange?: boolean;
  containerClassNames?: ClassValue;
  showLabel?: boolean;
  setHasUpdate?: () => void;
  onChange?: (newValue: unknown) => void;
  style?: React.CSSProperties;
}

const FormikDate = forwardRef<HTMLInputElement, FormikDateProps>(
  (
    {
      containerClassNames = "",
      label = "",
      setArrayTouched,
      setFocusOnLoad = false,
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
      ? convertDateStringToYYYYMMDD(field.value)
      : "";

    const [internal, setInternal] = useState(fieldValue);

    const inputRef = useRef<HTMLInputElement>(null);

    const hasError = meta.touched && meta.error;

    const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
      const newValue = e.currentTarget.value;
      setInternal(newValue);
      onChange && onChange(newValue);
      submitOnChange && submitForm();
    };

    const didValueChange = internal && fieldValue !== internal;

    const handleBlur: FocusEventHandler<HTMLInputElement> = (e) => {
      didValueChange && setArrayTouched && setArrayTouched();
      didValueChange && props.setHasUpdate && props.setHasUpdate();

      //Check if the internal is a valid date..
      if (isValidDate(internal)) {
        fieldValue !== internal && setValue(internal);
      } else {
        setInternal("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        //@ts-ignore
        setValue(e.target.value);
      }

      if (onKeyDown) {
        onKeyDown(e);
      }
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
        <Input
          type="date"
          value={internal}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          ref={ref || inputRef}
          id={props.name}
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

FormikDate.displayName = "FormikDate";
export { FormikDate };
