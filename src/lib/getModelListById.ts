import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { AppConfig } from "@/lib/app-config";
import { findConfigItemObject } from "@/utils/utilities";

export const getModelListById = (
  seqModelID: number | null,
  requiredList: Record<string, BasicModel[]> | undefined
) => {
  const relatedModelConfig =
    seqModelID &&
    findConfigItemObject(AppConfig.models, "seqModelID", seqModelID);
  const modelList = relatedModelConfig
    ? requiredList?.[`${relatedModelConfig.variableName}List`] || []
    : [];

  return modelList;
};
