import { ModelConfig } from "@/interfaces/ModelConfig";

export const getSortedFormikFormControlFields = (modelConfig: ModelConfig) => {
  return modelConfig.fields
    .filter(({ controlType }) => controlType !== "Hidden")
    .sort((a, b) => a.fieldOrder - b.fieldOrder);
};
