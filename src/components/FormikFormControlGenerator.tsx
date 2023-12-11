import { FormikAutocomplete } from "@/components/formik/FormikAutocomplete";
import { FormikCheckbox } from "@/components/formik/FormikCheckbox";
import { FormikCombobox } from "@/components/formik/FormikCombobox";
import { FormikDate } from "@/components/formik/FormikDate";
import { FormikDateAndTime } from "@/components/formik/FormikDateAndTime";
import { FormikDatePicker } from "@/components/formik/FormikDatePicker";
import { FormikDateRangePicker } from "@/components/formik/FormikDateRangePicker";
import { FormikFacetedControl } from "@/components/formik/FormikFacetedControl";
import { FormikFileInput } from "@/components/formik/FormikFileInput";
import { FormikInput } from "@/components/formik/FormikInput";
import { FormikSelect } from "@/components/formik/FormikSelect";
import { FormikSwitch } from "@/components/formik/FormikSwitch";
import { FormikTextArea } from "@/components/formik/FormikTextArea";
import { FormikToggle } from "@/components/formik/FormikToggle";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { findNextItem } from "@/lib/findNextItem";
import { getChildModelsWithSimpleRelationship } from "@/lib/getChildModelsWithSimpleRelationship";
import { getFirstAndLastFieldInForm } from "@/lib/getFirstAndLastFieldInForm";
import { getModelListById } from "@/lib/getModelListById";
import {
  GetSortedFormikFormControlFieldsOptions,
  getSortedFormikFormControlFields,
} from "@/lib/getSortedFormikFormControlFields";
import { cn } from "@/lib/utils";
import {
  findConfigItemObject,
  findRelationshipModelConfig,
} from "@/utils/utilities";
import { ClassValue } from "clsx";
import { CSSProperties, ReactNode } from "react";

interface RequiredList {
  [key: string]: BasicModel[];
}

interface FormikFormControlGeneratorProps {
  modelConfig: ModelConfig;
  options?: {
    requiredList?: RequiredList;
    setHasUpdate?: () => void;
    onChange?: Record<string, (newValue: unknown) => void>;
    styles?: Record<string, React.CSSProperties>;
    containerClassName?: Record<string, ClassValue>;
    hiddenField?: string;
    seqModelFieldGroupID?: GetSortedFormikFormControlFieldsOptions["seqModelFieldGroupID"];
  };
  controlsToOverride?: Record<string, React.FC<any>>;
}

import { forwardRef } from "react";

export const FormikFormControlGenerator = forwardRef<
  HTMLElement,
  FormikFormControlGeneratorProps
>(({ modelConfig, options, controlsToOverride }, ref) => {
  const controls = getSortedFormikFormControlFields(modelConfig, {
    seqModelFieldGroupID: options?.seqModelFieldGroupID,
  })
    .filter(
      ({ databaseFieldName }) => databaseFieldName !== options?.hiddenField
    )
    .map(
      (
        {
          fieldName,
          verboseFieldName,
          controlType,
          relatedModelID,
          allowNull,
          columnsOccupied,
          dataTypeOption,
          dataType,
          allowedOptions,
        },
        index
      ) => {
        const style: CSSProperties = {
          ...options?.styles?.[fieldName],
          gridArea: fieldName,
        };

        const willFocusOnLoad = index === 0 && !options?.seqModelFieldGroupID;

        const commonProps = {
          name: fieldName,
          label: verboseFieldName,
          setHasUpdate: options?.setHasUpdate,
          onChange: options?.onChange?.[fieldName],
          style: style,
          containerClassNames: cn(
            { "col-span-1": columnsOccupied === 1 },
            { "col-span-2": columnsOccupied === 2 },
            { "col-span-3": columnsOccupied === 3 },
            { "col-span-4": columnsOccupied === 4 },
            { "col-span-5": columnsOccupied === 5 },
            { "col-span-6": columnsOccupied === 6 },
            { "col-span-7": columnsOccupied === 7 },
            { "col-span-8": columnsOccupied === 8 },
            { "col-span-9": columnsOccupied === 9 },
            { "col-span-10": columnsOccupied === 10 },
            { "col-span-11": columnsOccupied === 11 },
            { "col-span-12": columnsOccupied === 12 },
            options?.containerClassName?.[fieldName]
          ),
        };

        let controlOptions;
        if ((dataTypeOption && dataType === "ENUM") || allowedOptions) {
          controlOptions = options?.requiredList?.[`${fieldName}List`] || [];
        } else {
          controlOptions = getModelListById(
            relatedModelID,
            options?.requiredList
          );
        }

        const ControlToOverride = controlsToOverride?.[fieldName];
        if (ControlToOverride)
          return (
            //@ts-ignore
            <ControlToOverride
              key={fieldName}
              {...commonProps}
            />
          );

        switch (controlType) {
          case "Switch":
            return (
              <FormikSwitch
                size={"sm"}
                key={fieldName}
                {...commonProps}
              />
            );
          case "Toggle":
            return (
              <FormikToggle
                key={fieldName}
                {...commonProps}
              />
            );
          case "ComboBox":
            const [a, b, visibleFields] = getFirstAndLastFieldInForm(
              modelConfig.fields
            );
            return (
              <FormikCombobox
                items={controlOptions}
                showLabel={true}
                key={fieldName}
                setFocusOnLoad={willFocusOnLoad}
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
                {...commonProps}
              />
            );

          case "Select":
            return (
              <FormikSelect
                options={controlOptions}
                showLabel={true}
                allowBlank={allowNull}
                key={fieldName}
                {...commonProps}
              />
            );
          case "Autocomplete":
            const relatedModelConfig = findConfigItemObject(
              AppConfig.models,
              "seqModelID",
              relatedModelID!
            );
            return (
              <FormikAutocomplete
                {...commonProps}
                modelConfig={relatedModelConfig}
              />
            );
          case "Textarea":
            return (
              <FormikTextArea
                setFocusOnLoad={willFocusOnLoad}
                rows={6}
                key={fieldName}
                {...commonProps}
              />
            );
          case "DateRangePicker":
            return (
              <FormikDateRangePicker
                key={fieldName}
                {...commonProps}
              />
            );
          case "WholeNumber":
            return (
              <FormikInput
                isNumeric={true}
                wholeNumberOnly={true}
                nullAllowed={allowNull}
                key={fieldName}
                {...commonProps}
              />
            );
          case "Decimal":
            return (
              <FormikInput
                isNumeric={true}
                wholeNumberOnly={false}
                nullAllowed={allowNull}
                key={fieldName}
                {...commonProps}
              />
            );
          case "Checkbox":
            return (
              <FormikCheckbox
                key={fieldName}
                {...commonProps}
              />
            );
          case "DatePicker":
            return (
              <FormikDatePicker
                key={fieldName}
                {...commonProps}
              />
            );
          case "DateAndTime":
            return (
              <FormikDateAndTime
                key={fieldName}
                setFocusOnLoad={willFocusOnLoad}
                {...commonProps}
              />
            );
          case "Date":
            return (
              <FormikDate
                key={fieldName}
                setFocusOnLoad={willFocusOnLoad}
                {...commonProps}
              />
            );
          case "Currency":
            return (
              <FormikInput
                isNumeric={true}
                wholeNumberOnly={false}
                currency={"₱"}
                nullAllowed={allowNull}
                key={fieldName}
                {...commonProps}
              />
            );
          case "FileInput":
            return (
              <FormikFileInput
                key={fieldName}
                {...commonProps}
              />
            );
          default:
            return (
              <FormikInput
                key={fieldName}
                placeholder={verboseFieldName}
                setFocusOnLoad={willFocusOnLoad}
                {...commonProps}
              />
            );
        }
      }
    );

  const relatedControls = getChildModelsWithSimpleRelationship(modelConfig).map(
    ({ seqModelRelationshipID }) => {
      const leftModelConfig = findRelationshipModelConfig(
        seqModelRelationshipID,
        "LEFT"
      );

      const throughModelConfig = findRelationshipModelConfig(
        seqModelRelationshipID,
        "TROUGH"
      );
      const fieldName = leftModelConfig.pluralizedModelName;
      const caption = throughModelConfig.pluralizedVerboseModelName;

      const style: CSSProperties = {
        ...options?.styles?.[fieldName],
        gridArea: fieldName,
      };

      return (
        <FormikFacetedControl
          key={fieldName}
          name={fieldName}
          label={caption}
          options={
            options?.requiredList?.[`${throughModelConfig.variableName}List`] ||
            []
          }
          containerClassNames={cn(
            "col-span-12",
            options?.containerClassName?.[fieldName]
          )}
          limit={10}
          setHasUpdate={options?.setHasUpdate}
          onChange={options?.onChange?.[fieldName]}
          style={style}
        />
      );
    }
  );

  const combinedControls = [...controls, ...relatedControls];
  return combinedControls.map((control) => control);
});

FormikFormControlGenerator.displayName = "FormikFormControlGenerator";
