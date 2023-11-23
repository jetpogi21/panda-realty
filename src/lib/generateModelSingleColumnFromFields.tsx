import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { findModelUniqueFieldName } from "@/lib/findModelUniqueFieldName";
import { getLocalStorage } from "@/lib/getLocalStorage";
import { findModelPrimaryKeyField, formatCurrency } from "@/utils/utilities";
import { format } from "date-fns";
import { Check, X } from "lucide-react";

export const generateModelSingleColumnFromFields = <T,>(
  modelConfig: ModelConfig,
  data: T,
  relationshipConfig?: (typeof AppConfig)["relationships"][number]
) => {
  return modelConfig.fields
    .filter(
      (field) =>
        !field.primaryKey &&
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
        let result;
        const relatedModel = AppConfig.models.find(
          (model) => model.seqModelID === relatedModelID
        );

        if (relatedModel) {
          const uniqueFieldName = findModelUniqueFieldName(relatedModel);
          //@ts-ignore
          let parentData = data[relatedModel.modelName];
          if (!parentData) {
            const relatedList = getLocalStorage(
              relatedModel.modelPath
            ) as any[];

            const relatedModelPk =
              findModelPrimaryKeyField(relatedModel).databaseFieldName;

            parentData = relatedList.find(
              (list) =>
                list[relatedModelPk] === data[fieldName as keyof typeof data]
            );
          }

          result = parentData[uniqueFieldName];
        } else {
          //@ts-ignore
          const fieldValue = data[fieldName];

          if (dataType === "BOOLEAN") {
            result = fieldValue ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <X className="w-4 h-4 text-destructive" />
            );
          } else if (fieldValue || fieldValue === 0) {
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

        return (
          <div key={fieldName}>
            <span className="font-bold">{verboseFieldName}:</span>{" "}
            <span className="ml-2">{result}</span>
          </div>
        );
      }
    );
};
