"use client";
import { useField, useFormikContext } from "formik";
import { useEffect, useRef, useState, RefObject, CSSProperties } from "react";
import { ClassValue } from "clsx";
import { cn } from "@/lib/utils";
import { SwitchProps } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { SiFoodpanda } from "react-icons/si";
import { GenericTooltip } from "@/components/ui/Tooltip";

export interface FavoriteButtonProps extends SwitchProps {
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

export const FavoriteButton: React.FC<FavoriteButtonProps> = ({
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
        "flex flex-col w-full gap-1.5 items-center self-end",
        containerClassNames
      )}
      style={style}
    >
      <GenericTooltip
        Content={"Toggle Favorite"}
        Trigger={
          <Button
            type="button"
            variant={"ghost"}
            className={cn("w-10 h-10 p-0 rounded-full focus:ring-0", {
              "text-orange-600": fieldValue,
              "hover:text-orange-600": !fieldValue,
            })}
            onClick={() => handleChange(!fieldValue)}
          >
            <SiFoodpanda className="w-10 h-10" />
          </Button>
        }
      />
    </div>
  );
};
