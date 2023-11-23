import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { getChildModelsWithSimpleRelationship } from "@/lib/getChildModelsWithSimpleRelationship";
import { getCreateJSON } from "@/utils/api/ModelLibs";
import {
  findModelPrimaryKeyField,
  findRelationshipModelConfig,
} from "@/utils/utilities";

export const getRelatedSimpleModelJSON = (
  modelConfig: ModelConfig,
  res: Record<string, unknown>,
  newRecords: Record<string, unknown>
) => {
  //should return an array of records to be inserted or updated -->
  const relationships = getChildModelsWithSimpleRelationship(modelConfig);

  for (const relationship of relationships) {
    const leftModelConfig = findRelationshipModelConfig(
      relationship.seqModelRelationshipID,
      "LEFT"
    );
    const leftPrimaryKeyField = findModelPrimaryKeyField(leftModelConfig);
    const leftForeignKey = relationship.leftForeignKey;
    const throughModelConfig = findRelationshipModelConfig(
      relationship.seqModelRelationshipID,
      "TROUGH"
    );

    const newIDs = res[
      `new${throughModelConfig.pluralizedVerboseModelName}`
    ] as number[];

    //Actually assign to newRecords object
    newRecords[leftModelConfig.tableName] = newIDs.map((item) => {
      return getCreateJSON(leftModelConfig, {
        [leftPrimaryKeyField.databaseFieldName]: "",
        [leftForeignKey]: 0,
        [relationship.fieldToBeInserted!]: item,
      });
    });
  }
};
