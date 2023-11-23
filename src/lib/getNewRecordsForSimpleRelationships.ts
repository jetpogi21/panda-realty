import { UnknownObject } from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import {
  findFielToBeInsertedField,
  findModelPrimaryKeyField,
  findRelationshipModelConfig,
} from "@/utils/utilities";

export const getNewRecordsForSimpleRelationships = (
  modelConfig: ModelConfig,
  data: Record<string, any>
) => {
  const relationships = AppConfig.relationships.filter(
    ({ rightModelID, isSimpleRelationship, excludeInForm }) =>
      rightModelID === modelConfig.seqModelID &&
      isSimpleRelationship &&
      !excludeInForm
  );

  const newRecords: UnknownObject = {};
  for (const {
    seqModelRelationshipID,
    fieldToBeInserted,
    leftForeignKey,
  } of relationships) {
    const leftModelConfig = findRelationshipModelConfig(
      seqModelRelationshipID,
      "LEFT"
    );

    const primaryKeyField =
      findModelPrimaryKeyField(leftModelConfig).databaseFieldName;

    const fieldToBeInsertedField = findFielToBeInsertedField(
      seqModelRelationshipID
    );

    const inserted = data[leftModelConfig.pluralizedModelName].inserted;
    const newChildRecords: UnknownObject[] = [];
    for (const item of inserted) {
      newChildRecords.push({
        [fieldToBeInserted!]: item[fieldToBeInsertedField.databaseFieldName],
        [primaryKeyField]: item[primaryKeyField],
      });
    }

    newRecords[leftModelConfig.pluralizedModelName] = newChildRecords;
  }

  return newRecords;
};
