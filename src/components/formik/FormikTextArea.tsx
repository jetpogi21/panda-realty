"use client";

import { Label } from "@/components/ui/Label";
import { useField } from "formik";
import {
  useEffect,
  useRef,
  useState,
  RefObject,
  ChangeEventHandler,
  FocusEventHandler,
  forwardRef,
} from "react";
import _ from "lodash";
import { Textarea, TextareaProps } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { ClassValue } from "clsx";

export interface FormikTextAreaProps extends TextareaProps {
  label?: string;
  name: string;
  setFocusOnLoad?: boolean;
  setArrayTouched?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  containerClassNames?: ClassValue;
  helperText?: string;
  setHasUpdate?: () => void;
  onChange?: (newValue: unknown) => void;
  nullAllowed?: boolean;
  style?: React.CSSProperties;
}

const FormikTextArea = forwardRef<any, FormikTextAreaProps>(
  (
    {
      containerClassNames = "",
      label = "",
      setArrayTouched,
      setFocusOnLoad = false,
      onKeyDown,
      helperText,
      setHasUpdate,
      onChange,
      nullAllowed,
      style,
      ...props
    },
    ref
  ) => {
    const [field, meta, { setValue }] = useField(props.name);
    const fieldValue = field.value || "";
    const [internalVal, setInternalVal] = useState(fieldValue);

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const hasError = meta.touched && meta.error;

    const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e) => {
      const targetValue = e.target.value;
      setInternalVal(targetValue);
      onChange && onChange(targetValue);
    };

    const handleBlur: FocusEventHandler<HTMLTextAreaElement> = () => {
      if (fieldValue !== internalVal) {
        internalVal &&
          fieldValue !== internalVal &&
          setArrayTouched &&
          setArrayTouched();
        internalVal &&
          fieldValue !== internalVal &&
          setHasUpdate &&
          setHasUpdate();
        setValue(internalVal);
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        //@ts-ignore
        setValue(e.target.value);
      }

      if (onKeyDown) {
        onKeyDown(e);
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
        className={cn("flex flex-col w-full gap-1.5", containerClassNames)}
        style={style}
      >
        {!!label && <Label htmlFor={props.name}>{label}</Label>}
        <Textarea
          ref={ref || inputRef}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          value={internalVal}
          id={props.name}
          {...props}
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

FormikTextArea.displayName = "FormikTextArea";
export { FormikTextArea };
