"use client";

import { Input, InputProps } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { useField, useFormikContext } from "formik";
import { useEffect, useRef, useState, RefObject, forwardRef } from "react";
import _ from "lodash";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import { formatCurrency, isValidCurrency } from "@/utils/utilities";
import { convertStringToFloat } from "@/utils/utils";
import Decimal from "decimal.js";
import { formatDecimal } from "@/lib/formatDecimal";
import { CellOption } from "@/types/tanstack-table";

export interface FormikInputProps extends InputProps {
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
}

const getFieldValue = (
  isNumeric: boolean,
  wholeNumberOnly: boolean,
  value: string | null | undefined
) => {
  if (isNumeric) {
    if (wholeNumberOnly) {
      return value;
    } else {
      //@ts-ignore
      if (!value && value !== 0) {
        return null;
      }
      const decimalValue = new Decimal(value as string);
      return formatDecimal(decimalValue);
    }
  } else {
    return value ? value : "";
  }
};

const FormikInput = forwardRef<HTMLInputElement, FormikInputProps>(
  (
    {
      containerClassNames = "",
      label = "",
      setArrayTouched,
      setFocusOnLoad = false,
      onKeyDown,
      helperText,
      submitOnChange = false,
      wholeNumberOnly = true,
      allowNegative = false,
      isNumeric = false,
      nullAllowed = false,
      setHasUpdate,
      onChange,
      onBlur,
      style,
      ...props
    },
    ref
  ) => {
    const { submitForm, values } = useFormikContext();

    const [field, meta, { setValue }] = useField(props.name);
    const fieldValue = getFieldValue(isNumeric, wholeNumberOnly, field.value);
    const [internalVal, setInternalVal] = useState(fieldValue);

    const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | undefined>(
      undefined
    );

    const inputRef = useRef<HTMLInputElement>(null);

    const hasError = meta.touched && meta.error;

    let inputType = "text";
    if (isNumeric && wholeNumberOnly) {
      inputType = "number";
    }

    const handleTyping = () => {
      clearTimeout(typingTimer);

      const timer = setTimeout(() => {
        // Invoke the desired function or perform other actions here
        submitForm();
      }, 500);
      setTypingTimer(timer);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const targetValue = e.target.value;

      setInternalVal(targetValue);

      if (submitOnChange) {
        setValue(targetValue);
        handleTyping();
      }
      if (submitOnChange) {
        setValue(targetValue);
      }

      onChange && onChange(targetValue);
    };

    const setStates = ({
      wholeNumberOnly,
      internalValStr,
    }: {
      wholeNumberOnly: boolean;
      internalValStr: string;
    }) => {
      if (!wholeNumberOnly) {
        const converted = convertStringToFloat(internalValStr);

        if (isNaN(converted)) {
          setInternalVal("0.00");
          setValue("0.00");
        } else {
          setInternalVal(converted.toFixed(2));
          setValue(converted.toFixed(2));
        }
      } else {
        //@ts-ignore
        if (isNaN(internalVal)) {
          setInternalVal("0");
          setValue("0");
        } else {
          setInternalVal(internalVal);
          setValue(internalVal);
        }
      }
    };

    const handleBlur = () => {
      internalVal &&
        fieldValue !== internalVal &&
        setArrayTouched &&
        setArrayTouched();
      internalVal &&
        fieldValue !== internalVal &&
        setHasUpdate &&
        setHasUpdate();

      if (isNumeric) {
        const internalValStr: string = internalVal
          ? internalVal.toString()
          : "";

        if (internalVal && internalValStr.includes("+")) {
          //@ts-ignore
          const values = internalValStr
            .split("+")
            .map((val) => parseFloat(val));

          //@ts-ignore
          const sum = values.reduce((acc, curr) => acc + curr, 0);

          setValue(sum.toFixed(2));
        } else if (isValidCurrency(internalValStr)) {
          setStates({ wholeNumberOnly, internalValStr });
        } else {
          if (nullAllowed) {
            setValue("");
          } else {
            setStates({ wholeNumberOnly, internalValStr });
          }
        }
      } else {
        fieldValue !== internalVal && setValue(internalVal);
      }

      onBlur && onBlur(internalVal, values);
    };

    const isNumericInput = (
      e: React.KeyboardEvent<HTMLInputElement>,
      wholeNumberOnly: boolean,
      allowNegative: boolean
    ) => {
      const key = e.code;

      // Allow numbers 0-9 (main keyboard and NumKeypad)
      if (
        /Digit\d/.test(key) ||
        /Numpad\d/.test(key) ||
        /NumpadAdd/.test(key) ||
        /NumpadSubtract/.test(key) ||
        /NumpadMultiply/.test(key) ||
        /NumpadDivide/.test(key)
      ) {
        return true;
      }

      // Allow backspace, tab, enter, escape, arrow keys, home, end, and minus (-)
      if (
        (!wholeNumberOnly && key === "Period") ||
        (!wholeNumberOnly && /NumpadDecimal/.test(key)) ||
        key === "Plus" ||
        key === "Equal" ||
        key === "Backspace" ||
        key === "Tab" ||
        key === "Enter" ||
        key === "Escape" ||
        key.startsWith("Arrow") ||
        key === "Home" ||
        key === "End" ||
        (allowNegative && key === "Minus") // Minus (-) if allowed
      ) {
        return true;
      }

      // Allow negative sign only at the start if it's allowed
      if (
        allowNegative &&
        e.currentTarget.selectionStart === 0 &&
        key === "Minus"
      ) {
        return true;
      }

      // Prevent the period (decimal point) if wholeNumberOnly is true
      if (wholeNumberOnly && key === "Period") {
        return false;
      }

      return false;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        //@ts-ignore
        setValue(e.target.value);
        setArrayTouched && setArrayTouched();
      }

      if (onKeyDown) {
        onKeyDown(e);
      }

      if (isNumeric && !isNumericInput(e, wholeNumberOnly, allowNegative)) {
        e.preventDefault();
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

    useEffect(() => {
      return () => {
        clearTimeout(typingTimer);
      };
    }, [typingTimer]);

    return (
      <div
        className={cn("flex flex-col w-full gap-1.5", containerClassNames)}
        style={style}
      >
        {!!label && <Label htmlFor={props.name}>{label}</Label>}
        <div className="relative flex items-center">
          {props.currency && (
            <div className="absolute left-4">{props.currency}</div>
          )}
          <Input
            className={cn({
              "text-right pr-2": isNumeric,
              "pl-4": props.currency,
            })}
            type={inputType}
            ref={ref || inputRef}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            value={internalVal!}
            disabled={props.disabled}
            onFocus={(e) => e.target.select()}
            id={props.name}
            onDragStart={(e) => e.preventDefault()}
            {...props}
          />
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

FormikInput.displayName = "FormikInput";
export { FormikInput };
