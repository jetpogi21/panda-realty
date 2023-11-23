import { Label } from "@/components/ui/Label";
import MultiselectCombobox from "@/components/ui/MultiselectCombobox";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { useField } from "formik";
import { useEffect, useState } from "react";

export interface FormikMultiselectComboboxProp {
  label: string;
  items: BasicModel[];
  newInputHandler?: (inputValue: string) => void;
  freeSolo: boolean;
  name: string;
  setArrayTouched?: () => void;
  onUpdate?: () => void;
  helperText?: string;
  pluralizedLabel?: string;
  [key: string]: unknown;
}

export const FormikMultiselectCombobox = ({
  label,
  items,
  multiple,
  newInputHandler,
  freeSolo = true,
  setArrayTouched,
  onUpdate,
  helperText,
  pluralizedLabel = `${label}s`,
  ...props
}: FormikMultiselectComboboxProp) => {
  const [field, meta, { setValue }] = useField(props);
  const fieldValue = field.value || [];
  const [internalVal, setInternalVal] = useState<string[]>(fieldValue);

  const hasError = meta.touched && meta.error;

  useEffect(() => {
    if (fieldValue !== internalVal) {
      setInternalVal(fieldValue);
    }
  }, [fieldValue]);

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor={props.name}>{label}</Label>
      <MultiselectCombobox
        value={internalVal}
        onChange={(value) => {
          setInternalVal(value);
        }}
        list={items}
        caption={label}
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
