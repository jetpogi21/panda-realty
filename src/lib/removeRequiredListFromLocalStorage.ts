import { AppConfig } from "@/lib/app-config";
import { findConfigItemObject } from "@/utils/utilities";

export const removeRequiredListFromLocalStorage = (
  modelPath: string,
  modelsToRequery?: string[]
) => {
  localStorage.removeItem(modelPath);

  if (!modelsToRequery) return;
  for (let i = 0; i < modelsToRequery.length; i++) {
    const modelConfig = findConfigItemObject(
      AppConfig.models,
      "pluralizedModelName",
      modelsToRequery[i]
    );
    const childModelPath = modelConfig.modelPath;

    localStorage.removeItem(childModelPath);
  }
};
