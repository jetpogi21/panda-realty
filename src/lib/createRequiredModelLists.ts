import useModelList from "@/hooks/useModelList";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { extractDataTypeOptionSubstrings } from "@/lib/extractDataTypeOptionSubstrings";
import { getChildModels } from "@/lib/getChildModels";
import { getChildModelsWithSimpleRelationship } from "@/lib/getChildModelsWithSimpleRelationship";
import {
  findConfigItemObject,
  findRelationshipModelConfig,
} from "@/utils/utilities";

export const createRequiredModelLists = (
  modelConfig: ModelConfig,
  childMode: boolean = false
) => {
  let requiredList: Record<string, BasicModel[]> = {};

  modelConfig.fields
    .filter(
      ({ dataTypeOption, dataType }) => dataTypeOption && dataType === "ENUM"
    )
    .forEach(({ fieldName, dataTypeOption }) => {
      const controlOptionArr = extractDataTypeOptionSubstrings(dataTypeOption!);

      requiredList[`${fieldName}List`] = controlOptionArr.map((item) => ({
        id: item,
        name: item,
      }));
    });

  modelConfig.fields
    .filter(({ allowedOptions }) => allowedOptions)
    .forEach(({ fieldName, allowedOptions }) => {
      const controlOptionArr = allowedOptions!
        .split(",")
        .map((item) => item.trim());

      requiredList[`${fieldName}List`] = controlOptionArr.map((item) => ({
        id: item,
        name: item,
      }));
    });

  //Loop through each field having relatedModelID value
  modelConfig.fields
    .filter(({ relatedModelID }) => relatedModelID)
    .forEach(({ relatedModelID }) => {
      const relatedModel = AppConfig.models.find(
        (model) => model.seqModelID === relatedModelID
      );
      if (!relatedModel) return;
      requiredList[`${relatedModel.variableName}List`] =
        useModelList(relatedModel);
    });

  if (!childMode) {
    getChildModelsWithSimpleRelationship(modelConfig).map((relationship) => {
      const throughModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        "TROUGH"
      );

      requiredList[`${throughModelConfig.variableName}List`] =
        useModelList(throughModelConfig);
    });

    getChildModels(modelConfig).map((relationship) => {
      //get the fields of this model that has relatedModelID
      const leftModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        "LEFT"
      );

      requiredList = {
        ...requiredList,
        ...createRequiredModelLists(leftModelConfig, true),
      };
    });
  }

  return requiredList;
};

export const createRequiredModelListsForFilter = (modelConfig: ModelConfig) => {
  const requiredList: Record<string, BasicModel[]> = {};

  modelConfig.filters
    .filter(({ modelListID }) => modelListID)
    .forEach(({ modelListID }) => {
      const relatedModel = findConfigItemObject(
        AppConfig.models,
        "seqModelID",
        modelListID!
      );

      requiredList[`${relatedModel.variableName}List`] =
        useModelList(relatedModel);
    });

  return requiredList;
};
