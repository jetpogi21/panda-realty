"use client";
import { Label } from "@/components/ui/Label";
import { useField, useFormikContext } from "formik";
import {
  useEffect,
  useRef,
  useState,
  RefObject,
  forwardRef,
  ForwardedRef,
  MutableRefObject,
} from "react";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import { ButtonProps } from "@/components/ui/Button";
import { DateRangePickerProps } from "@/components/ui/DateRangePicker";
import {
  SelectRangeEventHandler,
  SelectSingleEventHandler,
} from "react-day-picker";
import { DateRangePicker } from "@/components/ui/DateRangePicker";
import { convertDateToYYYYMMDD, convertStringToDate } from "@/utils/utilities";

export interface FormikDateRangePickerProps
  extends ButtonProps,
    Pick<DateRangePickerProps, "format"> {
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

const FormikDateRangePicker = forwardRef<any, FormikDateRangePickerProps>(
  (
    {
      name,
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
    const { submitForm, values, setFieldValue } = useFormikContext();

    const fromName = `${name}From`;
    const toName = `${name}To`;
    //@ts-ignore
    const dateFrom: string | null = values[fromName];
    //@ts-ignore
    const dateTo: string | null = values[toName];

    const [localDateFrom, setLocalDateFrom] = useState<string>(dateFrom || "");
    const [localDateTo, setLocalDateTo] = useState<string>(dateTo || "");
    const [open, setOpen] = useState(false);

    const value =
      localDateFrom || localDateTo
        ? {
            from: localDateFrom
              ? convertStringToDate(localDateFrom)
              : undefined,
            to: localDateTo ? convertStringToDate(localDateTo) : undefined,
          }
        : undefined;

    const handleSelect: SelectRangeEventHandler = (
      range,
      selectedDay,
      activeModifiers,
      e
    ) => {
      if (selectedDay) {
        const selectedValue = convertDateToYYYYMMDD(selectedDay);

        if (!localDateFrom) {
          setLocalDateFrom(selectedValue);
          //setLocalDateTo("")
        } else if (!localDateTo) {
          if (new Date(selectedValue) < new Date(localDateFrom)) {
            setLocalDateFrom(selectedValue);
            setLocalDateTo(localDateFrom);
            setFieldValue(fromName, selectedValue);
            setFieldValue(toName, localDateFrom);
          } else {
            setLocalDateTo(selectedValue);
            setFieldValue(fromName, localDateFrom);
            setFieldValue(toName, selectedValue);
          }
          setOpen(false);
        } else {
          setLocalDateFrom(selectedValue);
          setLocalDateTo("");
        }
      } else {
        setLocalDateFrom("");
        setLocalDateTo("");
      }

      setArrayTouched && setArrayTouched();
      props.setHasUpdate && props.setHasUpdate();
      submitOnChange && submitForm();
      //onChange && onChange(newValue);
    };

    const handleCloseAutoFocus = (e: Event) => {
      if (!localDateFrom || !localDateTo) {
        setLocalDateFrom("");
        setLocalDateTo("");
      }
    };

    useEffect(() => {
      setLocalDateFrom(dateFrom || "");
      setLocalDateTo(dateTo || "");
    }, [dateFrom, dateTo]);

    useEffect(() => {
      if (ref && typeof ref !== "function" && setFocusOnLoad) {
        ref.current?.focus();
      }
    }, [setFocusOnLoad]);

    return (
      <div
        className={cn("flex flex-col w-full gap-1.5", containerClassNames)}
        style={style}
      >
        {showLabel && !!label && <Label>{label}</Label>}
        <DateRangePicker
          value={value}
          onSelect={handleSelect}
          onCloseAutoFocus={handleCloseAutoFocus}
          open={open}
          setOpen={setOpen}
        />

        {helperText && (
          <span className="mt-1 text-xs font-bold text-muted-foreground">
            {helperText}
          </span>
        )}
        {/* {hasError && <span className="text-xs text-red-500">{meta.error}</span>} */}
      </div>
    );
  }
);

FormikDateRangePicker.displayName = "FormikDateRangePicker";
export { FormikDateRangePicker };
