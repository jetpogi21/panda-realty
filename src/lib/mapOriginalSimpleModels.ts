import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import {
  findModelPrimaryKeyField,
  findRelationshipModelConfig,
} from "@/utils/utilities";

/**
 * This function maps original simple models based on the provided properties and model configuration.
 *
 * @param prop - An object containing properties to be mapped.
 * @param modelConfig - The configuration of the model to be mapped.
 *
 * @returns A record of original simple models (primary key and the field to insert field).
 *
 * @example
 * // { TaskTags: [ { id: 92, tagID: 6 }, { id: 91, tagID: 10 } ] }
 */
export const mapOriginalSimpleModels = (
  prop: Record<string, unknown>,
  modelConfig: ModelConfig
) => {
  const originalSimpleModels: Record<string, Record<string, unknown>[]> = {};

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

      const leftModelPrimaryFieldName =
        findModelPrimaryKeyField(leftModelConfig).fieldName;

      const leftModelDataPropItems: string[] | number[] = prop.data
        ? //@ts-ignore
          prop.data[leftPluralizedModelName]
        : [];

      originalSimpleModels[leftPluralizedModelName] =
        leftModelDataPropItems.map((item) => ({
          //@ts-ignore
          [leftModelPrimaryFieldName]: item[leftModelPrimaryFieldName],
          //@ts-ignore
          [relationship.fieldToBeInserted]:
            //@ts-ignore
            item[relationship.fieldToBeInserted],
        }));
    });

  return originalSimpleModels;
};
