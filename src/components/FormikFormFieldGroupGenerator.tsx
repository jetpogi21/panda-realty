import { FormikFormControlGenerator } from "@/components/FormikFormControlGenerator";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";
import {
  OverrideRowProp,
  generateGridTemplateAreas,
} from "@/lib/generateGridTemplateAreas";
import { ClassValue } from "clsx";
import { CSSProperties, ReactNode } from "react";

interface RequiredList {
  [key: string]: BasicModel[];
}

type GridTemplateOptionsType = Record<
  string,
  | {
      overrideRow?: OverrideRowProp;
      rowsToDelete?: number[];
      rowsToAdd?: Record<number, string[]>;
      fieldsToExclude?: string[];
      seqModelFieldGroupID?: number;
    }
  | undefined
>;

type FormikFormFieldGroupGeneratorOptionsType = {
  requiredList?: RequiredList;
  setHasUpdate?: () => void;
  onChange?: Record<string, (newValue: unknown) => void>;
  styles?: Record<string, React.CSSProperties>;
  containerClassName?: Record<string, ClassValue>;
  hiddenField?: string;
};

interface FormikFormFieldGroupGeneratorProps {
  modelConfig: ModelConfig;
  gridTemplateOptions?: GridTemplateOptionsType;
  options?: FormikFormFieldGroupGeneratorOptionsType;
}

import { forwardRef } from "react";
import slugify from "slugify";

type FormikFormFieldGroupGridProps = {
  modelConfig: ModelConfig;
  fieldGroup: ModelConfig["fieldGroups"][number];
  gridTemplateOptions?: GridTemplateOptionsType;
  options?: FormikFormFieldGroupGeneratorOptionsType;
};

export const FormikFormFieldGroupGrid = (
  props: FormikFormFieldGroupGridProps
) => {
  const { modelConfig, fieldGroup, gridTemplateOptions, options } = props;
  const gridTemplateOption = gridTemplateOptions?.[fieldGroup.groupName];
  return (
    <div
      className="grid grid-cols-12 gap-4"
      style={{
        gridTemplateAreas: generateGridTemplateAreas(modelConfig, {
          seqModelFieldGroupID: fieldGroup.seqModelFieldGroupID,
          ...gridTemplateOption,
        }),
      }}
    >
      <FormikFormControlGenerator
        modelConfig={modelConfig}
        options={{
          ...options,
          seqModelFieldGroupID: fieldGroup.seqModelFieldGroupID,
        }}
      />
    </div>
  );
};

export const FormikFormFieldGroupGenerator = forwardRef<
  HTMLElement,
  FormikFormFieldGroupGeneratorProps
>(({ modelConfig, gridTemplateOptions, options }, ref) => {
  const fieldGroups = modelConfig.fieldGroups
    .filter((fieldGroup) => !fieldGroup.asTab)
    .sort((a, b) => a.groupOrder - b.groupOrder);

  const controls: ReactNode[] = [];
  for (const fieldGroup of fieldGroups) {
    const groupControls = (
      <div
        key={fieldGroup.groupName}
        className="flex flex-col gap-4"
        style={{ gridArea: slugify(fieldGroup.groupName) }}
      >
        <h1 className="text-xl font-bold">{fieldGroup.groupName}</h1>
        <FormikFormFieldGroupGrid
          modelConfig={modelConfig}
          fieldGroup={fieldGroup}
          gridTemplateOptions={gridTemplateOptions}
          options={options}
        />
      </div>
    );

    controls.push(groupControls);
  }

  return controls;
});

FormikFormFieldGroupGenerator.displayName = "FormikFormFieldGroupGenerator";
