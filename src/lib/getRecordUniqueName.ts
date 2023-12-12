import { ModelConfig } from "@/interfaces/ModelConfig";
import { findModelPrimaryKeyField } from "@/lib/findModelPrimaryKeyField";
import { replacePlaceholders } from "@/lib/replacePlaceholders";

export const getRecordUniqueName = <T>(row: T, modelConfig: ModelConfig) => {
  const uniqueNameTemplate = modelConfig.uniqueNameTemplate;

  if (uniqueNameTemplate) {
    //@ts-ignore
    const val = replacePlaceholders(uniqueNameTemplate, row);
    return val;
  }
  const slugField = modelConfig.slugField;
  const primaryKeyField =
    findModelPrimaryKeyField(modelConfig).databaseFieldName;
  //Modify this return value as you may see fit
  return modelConfig.slugField
    ? row[slugField as keyof T]
    : row[primaryKeyField as keyof T]?.toString();
};
