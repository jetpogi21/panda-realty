import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import {
  findRelationshipModelConfig,
  findModelPrimaryKeyField,
} from "@/utils/utilities";

export const updateSimpleModelsBasedOnRelationships = (
  modelConfig: ModelConfig,
  originalSimpleModels: Record<string, Record<string, unknown>[]>,
  setOriginalSimpleModels: React.Dispatch<
    React.SetStateAction<Record<string, Record<string, unknown>[]>>
  >,
  data: Record<string, unknown>,
  deletedAndNewSimpleRecords: Record<string, unknown>
) => {
  AppConfig.relationships
    .filter(
      ({ rightModelID, isSimpleRelationship }) =>
        rightModelID === modelConfig.seqModelID && isSimpleRelationship
    )
    .forEach((relationship) => {
      const leftModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        "LEFT"
      );

      const leftPluralizedModelName = leftModelConfig.pluralizedModelName;
      const leftPrimaryKeyFieldName =
        findModelPrimaryKeyField(leftModelConfig).fieldName;

      const newOriginalChildModels = [
        ...originalSimpleModels[leftPluralizedModelName],
        //@ts-ignore
        ...data[leftPluralizedModelName].map((item) => ({
          [leftPrimaryKeyFieldName]: item[leftPrimaryKeyFieldName],
          [relationship.fieldToBeInserted!]:
            item[relationship.fieldToBeInserted!],
        })),
      ].filter(
        (item) =>
          //@ts-ignore
          !deletedAndNewSimpleRecords[
            `deleted${leftPluralizedModelName}`
          ].includes(item[leftPrimaryKeyFieldName].toString())
      );

      setOriginalSimpleModels({
        ...originalSimpleModels,
        [leftPluralizedModelName]: newOriginalChildModels,
      });
    });
};
