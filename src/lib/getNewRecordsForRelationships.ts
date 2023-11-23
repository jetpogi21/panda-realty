import { UnknownObject } from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import {
  findFielToBeInsertedField,
  findModelPrimaryKeyField,
  findRelationshipModelConfig,
} from "@/utils/utilities";

export const getNewRecordsForRelationships = (
  modelConfig: ModelConfig,
  data: Record<string, any>
) => {
  const relationships = AppConfig.relationships.filter(
    ({ rightModelID, isSimpleRelationship, excludeInForm }) =>
      rightModelID === modelConfig.seqModelID &&
      !isSimpleRelationship &&
      !excludeInForm
  );

  const newRecords: UnknownObject = {};
  for (const { seqModelRelationshipID } of relationships) {
    const leftModelConfig = findRelationshipModelConfig(
      seqModelRelationshipID,
      "LEFT"
    );

    const primaryKeyField =
      findModelPrimaryKeyField(leftModelConfig).databaseFieldName;

    const inserted = data[leftModelConfig.pluralizedModelName].inserted;
    const newChildRecords: UnknownObject[] = [];
    for (const idx of Object.keys(inserted)) {
      newChildRecords.push({
        index: idx,
        [primaryKeyField]: inserted[idx][primaryKeyField],
      });
    }

    newRecords[leftModelConfig.pluralizedModelName] = newChildRecords;
  }

  return newRecords;
};
