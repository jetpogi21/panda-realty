import { ModelConfig } from "@/interfaces/ModelConfig";
import { findConfigItem, findModelPrimaryKeyField } from "@/utils/utilities";

export const findModelUniqueFieldName = (modelConfig: ModelConfig) => {
  const primaryKeyFieldName = findModelPrimaryKeyField(modelConfig).fieldName;
  return (findConfigItem(modelConfig.fields, "unique", true, "fieldName") ||
    primaryKeyFieldName) as string;
};
