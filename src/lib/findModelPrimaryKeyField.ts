import { ModelConfig } from "@/interfaces/ModelConfig";
import { findConfigItemObject } from "@/utils/findConfigItemObject";

export const findModelPrimaryKeyField = (modelConfig: ModelConfig) => {
  return findConfigItemObject(modelConfig.fields, "primaryKey", true);
};
