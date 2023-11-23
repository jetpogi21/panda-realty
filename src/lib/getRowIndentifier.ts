import { ModelConfig } from "@/interfaces/ModelConfig";
import { findModelPrimaryKeyField } from "@/utils/utilities";

export const getRowIndentifier = (modelConfig: ModelConfig) => {
  const slugField = modelConfig.slugField;
  return slugField ? "slug" : findModelPrimaryKeyField(modelConfig).fieldName;
};
