import { ModelConfig } from "@/interfaces/ModelConfig";
import { getChildModels } from "@/lib/getChildModels";
import { ModelSchema } from "@/schema/ModelSchema";
import { getCreateJSON } from "@/utils/api/ModelLibs";
import handleSequelizeError from "@/utils/errorHandling";
import {
  findModelPrimaryKeyField,
  findRelationshipModelConfig,
} from "@/utils/utilities";

export const getRelatedModelJSON = async (
  modelConfig: ModelConfig,
  res: any,
  newRecords: Record<string, unknown>
) => {
  const relationships = getChildModels(modelConfig);

  for (const relationship of relationships) {
    const childRecords = [];
    const leftModelConfig = findRelationshipModelConfig(
      relationship.seqModelRelationshipID,
      "LEFT"
    );
    const leftPrimaryKeyFieldName =
      findModelPrimaryKeyField(leftModelConfig).databaseFieldName;
    const leftForeignKey = relationship.leftForeignKey;

    const modelPayload = res[leftModelConfig.pluralizedModelName];

    if (modelPayload) {
      for (const item of modelPayload) {
        item[leftForeignKey] = 0;
        try {
          await ModelSchema(leftModelConfig).validate(item);
          const childPrimaryKeyValue = item[leftPrimaryKeyFieldName];
          if (childPrimaryKeyValue === "") {
            childRecords.push(getCreateJSON(leftModelConfig, item));
          } else {
            const createdJSON = getCreateJSON(leftModelConfig, item);
            createdJSON[leftPrimaryKeyFieldName] =
              item[leftPrimaryKeyFieldName];

            childRecords.push(getCreateJSON(leftModelConfig, item));
          }
        } catch (e) {
          return handleSequelizeError(e);
        }
      }
    }

    newRecords[leftModelConfig.tableName] = {
      rows: childRecords,
      primaryKey: leftPrimaryKeyFieldName,
    };
  }
};
