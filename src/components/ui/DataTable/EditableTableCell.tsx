import { FormikCheckbox } from "@/components/formik/FormikCheckbox";
import { FormikCombobox } from "@/components/formik/FormikCombobox";
import { FormikDate } from "@/components/formik/FormikDate";
import { FormikDateAndTime } from "@/components/formik/FormikDateAndTime";
import { FormikDatePicker } from "@/components/formik/FormikDatePicker";
import { FormikFileInput } from "@/components/formik/FormikFileInput";
import { FormikInput } from "@/components/formik/FormikInput";
import { FormikLocalFileInput } from "@/components/formik/FormikLocalFileInput";

import { FormikSelect } from "@/components/formik/FormikSelect";
import { FormikSwitch } from "@/components/formik/FormikSwitch";
import { FormikTextArea } from "@/components/formik/FormikTextArea";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { findNextItem } from "@/lib/findNextItem";
import { CellOption } from "@/types/tanstack-table";
import { CellContext } from "@tanstack/react-table";
import { RefObject, useRef } from "react";

// Define a custom type for the column definition meta
type ColumnDefMeta = {
  type:
    | "Textarea"
    | "Checkbox"
    | "Input"
    | "Select"
    | "ComboBox"
    | "Decimal"
    | "DateAndTime"
    | "DatePicker"
    | "Date"
    | "FileInput"
    | "LocalFileInput"
    | "Currency"
    | "Switch";
  options: BasicModel[];
  isNumeric: boolean;
  isWholeNumber: boolean;
  label: string;
};

type EditableCellProps<TData, TValue> = {
  cell: CellContext<TData, TValue>;
  options?: BasicModel[];
  fieldName: string;
  option?: CellOption;
};

export const EditableTableCell = <TData, TValue>({
  cell,
  options,
  fieldName,
  option,
}: EditableCellProps<TData, TValue>) => {
  const { getValue, row, column, table } = cell;

  const dataRows = table.getFilteredRowModel().rows.length;

  // Use type assertion to access the column definition meta
  const type = (column.columnDef.meta as ColumnDefMeta).type;
  const isNumeric = (column.columnDef.meta as ColumnDefMeta).isNumeric;
  const isWholeNumber = (column.columnDef.meta as ColumnDefMeta).isWholeNumber;
  const label = (column.columnDef.meta as ColumnDefMeta).label;

  const {
    name,
    setTouchedRows,
    addRow,
    firstFieldInForm,
    lastFieldInForm,
    editable,
    forwardedRef,
    setHasUpdate,
    visibleFields,
  } = table.options.meta || {};

  const index = row.index;
  const controlName = `${name}[${index}].${column.id}`;

  // Define a common function to handle the key down event
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Tab") {
      if (dataRows === index + 1 && column.id === lastFieldInForm) {
        e.preventDefault();
        addRow && addRow();
      }
    }
  };

  const setArrayTouched = () => {
    setTouchedRows && setTouchedRows(index);
  };

  // Define a common prop object for the formik components
  const commonProps = {
    name: controlName,
    onKeyDown: handleKeyDown,
    setArrayTouched: setTouchedRows ? setArrayTouched : undefined,
    setHasUpdate: setHasUpdate ? setHasUpdate : undefined,
  };

  // Return the appropriate formik component based on the type
  switch (type) {
    case "Textarea":
      return (
        <FormikTextArea
          {...commonProps}
          placeholder={label}
          ref={
            dataRows === index + 1 && column.id === firstFieldInForm
              ? (forwardedRef as RefObject<HTMLTextAreaElement>)
              : undefined
          }
        />
      );

    case "Checkbox":
      return (
        <FormikCheckbox
          {...commonProps}
          ref={
            dataRows === index + 1 && column.id === firstFieldInForm
              ? (forwardedRef as RefObject<HTMLButtonElement>)
              : undefined
          }
        />
      );
    case "Switch":
      return <FormikSwitch {...commonProps} />;
    case "Select":
      return (
        <FormikSelect
          {...commonProps}
          options={options || []}
          showLabel={false}
          allowBlank={false}
        />
      );
    case "ComboBox":
      return (
        <FormikCombobox
          {...commonProps}
          freeSolo={false}
          items={options || []}
          label={label}
          showLabel={false}
          onTabKeyDown={(name: string) => {
            const nextField = findNextItem(visibleFields!, fieldName);
            const nextControlName = name.replace(fieldName, nextField);
            const elementWithNextControlName = document.querySelector(
              `[name="${nextControlName}"]`
            );

            if (elementWithNextControlName) {
              //@ts-ignore
              elementWithNextControlName.focus();
            }

            //Find the next control's name from the visibleFields meta option
          }}
          ref={
            dataRows === index + 1 && column.id === firstFieldInForm
              ? (forwardedRef as RefObject<HTMLButtonElement>)
              : undefined
          }
        />
      );
    case "Decimal":
      return (
        <FormikInput
          placeholder={label}
          isNumeric={true}
          wholeNumberOnly={false}
          {...commonProps}
          ref={
            dataRows === index + 1 && column.id === firstFieldInForm
              ? (forwardedRef as RefObject<HTMLInputElement>)
              : undefined
          }
        />
      );
    case "Currency":
      return (
        <FormikInput
          placeholder={label}
          isNumeric={true}
          wholeNumberOnly={false}
          onChange={option?.handleChange || undefined}
          onBlur={option?.handleBlur || undefined}
          {...commonProps}
          ref={
            dataRows === index + 1 && column.id === firstFieldInForm
              ? (forwardedRef as RefObject<HTMLInputElement>)
              : undefined
          }
        />
      );
    case "DateAndTime":
      return (
        <FormikDateAndTime
          ref={
            dataRows === index + 1 && column.id === firstFieldInForm
              ? (forwardedRef as RefObject<HTMLInputElement>)
              : undefined
          }
          {...commonProps}
        />
      );
    case "Date":
      return (
        <FormikDate
          ref={
            dataRows === index + 1 && column.id === firstFieldInForm
              ? (forwardedRef as RefObject<HTMLInputElement>)
              : undefined
          }
          {...commonProps}
        />
      );
    case "DatePicker":
      return (
        <FormikDatePicker
          ref={
            dataRows === index + 1 && column.id === firstFieldInForm
              ? (forwardedRef as RefObject<HTMLInputElement>)
              : undefined
          }
          {...commonProps}
        />
      );
    case "FileInput":
      return (
        <FormikFileInput
          {...commonProps}
          index={row.index}
          parent={name}
          fieldName={column.id}
        />
      );
    case "LocalFileInput":
      return (
        <FormikLocalFileInput
          {...commonProps}
          index={row.index}
          parent={name}
          fieldName={column.id}
        />
      );
    default:
      return (
        <FormikInput
          placeholder={label}
          isNumeric={isNumeric}
          wholeNumberOnly={isWholeNumber}
          {...commonProps}
          ref={
            dataRows === index + 1 && column.id === firstFieldInForm
              ? (forwardedRef as RefObject<HTMLInputElement>)
              : undefined
          }
        />
      );
      break;
  }
};
