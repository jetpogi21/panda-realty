import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { findModelUniqueFieldName } from "@/lib/findModelUniqueFieldName";
import { getListItemFromLocalStorage } from "@/lib/getListItemFromLocalStorage";
import { findModelPrimaryKeyField, formatCurrency } from "@/utils/utilities";
import { format } from "date-fns";
import { Check, X } from "lucide-react";
import { ReactNode } from "react";

const CaptionAndValue = ({
  caption,
  value,
}: {
  caption: string;
  value: any;
}) => {
  return value ? (
    <div className="flex gap-1">
      <span className="font-bold">{caption}:</span>
      {value}
    </div>
  ) : null;
};

type OverrideFields = Record<string, ReactNode>;

const generateCaptionAndValueOfFields = <T,>(
  modelConfig: ModelConfig,
  data: T,
  overrideFields?: OverrideFields,
  options?: {
    seqModelFieldGroupID?: number;
    relationshipConfig?: (typeof AppConfig)["relationships"][number];
  }
) => {
  const { relationshipConfig, seqModelFieldGroupID } = options || {};
  const controls = modelConfig.fields
    .filter(
      (field) =>
        !field.hideInTable &&
        !field.primaryKey &&
        (seqModelFieldGroupID
          ? field.seqModelFieldGroupID === seqModelFieldGroupID
          : !field.seqModelFieldGroupID) &&
        (relationshipConfig
          ? field.databaseFieldName !== relationshipConfig.leftForeignKey
          : true)
    )
    .sort(({ fieldOrder: sortA }, { fieldOrder: sortB }) => sortA - sortB)
    .map(
      ({
        fieldName,
        verboseFieldName,
        controlType,
        seqModelFieldID,
        relatedModelID,
        dataType,
        dataTypeInterface,
        summarizedBy,
        allowedOptions,
      }) => {
        if (overrideFields?.[fieldName]) {
          return overrideFields?.[fieldName];
        }

        let result;
        const relatedModel = AppConfig.models.find(
          (model) => model.seqModelID === relatedModelID
        );

        if (relatedModel) {
          const uniqueFieldName = findModelUniqueFieldName(relatedModel);
          const relatedPrimaryKey =
            findModelPrimaryKeyField(relatedModel).databaseFieldName;
          //@ts-ignore
          let parentData = data[relatedModel.modelName];

          if (!parentData) {
            parentData = getListItemFromLocalStorage(
              relatedModel.modelPath,
              relatedPrimaryKey,
              parentData,
              uniqueFieldName
            );
          }

          result = parentData?.[uniqueFieldName] || "";
        } else {
          //@ts-ignore
          const fieldValue = data[fieldName];

          if (dataType === "BOOLEAN") {
            result = fieldValue ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <X className="w-4 h-4 text-destructive" />
            );
          } else if (fieldValue) {
            if (dataType === "DATEONLY") {
              result = format(
                new Date(fieldValue as string),
                "MM/dd/yyyy, EEE"
              );
            } else if (dataType === "DATE") {
              result = format(
                new Date(fieldValue as string),
                "M/d/yyyy hh:mm a"
              );
            } else if (dataType === "DECIMAL") {
              result = formatCurrency(fieldValue);
            } else {
              result = fieldValue;
            }
          } else {
            result = fieldValue;
          }
        }

        return result ? (
          <CaptionAndValue
            key={fieldName}
            caption={verboseFieldName}
            value={result}
          />
        ) : null;
      }
    );

  const notAllIsNull = controls.some((control) => control !== null);

  return notAllIsNull ? (
    <div className="flex flex-wrap items-center gap-4">{controls}</div>
  ) : null;
};

export const generateModelSingleColumnFromFields = <T,>(
  modelConfig: ModelConfig,
  data: T,
  relationshipConfig?: (typeof AppConfig)["relationships"][number],
  overrideFields?: OverrideFields
) => {
  let elements: ReactNode[] = [];
  const fieldGroups = modelConfig.fieldGroups.sort(
    (a, b) => a.groupOrder - b.groupOrder
  );

  for (const fieldGroup of fieldGroups) {
    const controlGroup = generateCaptionAndValueOfFields(
      modelConfig,
      data,
      overrideFields,
      {
        seqModelFieldGroupID: fieldGroup.seqModelFieldGroupID,
        relationshipConfig,
      }
    );

    if (controlGroup) {
      elements = [...elements, controlGroup];
    }
  }

  elements = [
    generateCaptionAndValueOfFields(modelConfig, data, overrideFields, {
      relationshipConfig,
    }),
    ...elements,
  ];
  return elements;
};
