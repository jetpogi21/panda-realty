import { ArrayOfUnknownObject } from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { ChildSQL } from "@/interfaces/interface";
import { AppConfig } from "@/lib/app-config";
import { ModelSchema } from "@/schema/ModelSchema";
import { getInsertSQL, getUpdateSQL } from "@/utils/api/ModelLibs";
import {
  findModelPrimaryKeyField,
  findRelationshipModelConfig,
} from "@/utils/utilities";

export const getRelatedSQLs = async (
  modelConfig: ModelConfig,
  body: Record<string, unknown>
) => {
  const relationships = AppConfig.relationships.filter(
    ({ rightModelID, isSimpleRelationship, excludeInForm }) =>
      rightModelID === modelConfig.seqModelID &&
      !isSimpleRelationship &&
      !excludeInForm
  );

  const sqls: ChildSQL = {};

  for (const { seqModelRelationshipID, leftForeignKey } of relationships) {
    const leftModelConfig = findRelationshipModelConfig(
      seqModelRelationshipID,
      "LEFT"
    );

    const primaryKeyField =
      findModelPrimaryKeyField(leftModelConfig).databaseFieldName;

    const modelPayload = body[
      leftModelConfig.pluralizedModelName
    ] as ArrayOfUnknownObject;

    const insertStatements: Record<number, string> = {};
    const updateStatements: Record<number, string> = {};

    if (modelPayload && modelPayload.length > 0) {
      //if disableAPIDelete then all the payload are submitted even if they don't contain any changes so we need to filter records to those touched only
      for (const item of modelPayload.filter((item) =>
        leftModelConfig.disableAPIDelete ? item.touched : true
      )) {
        try {
          await ModelSchema(leftModelConfig).validate(item);

          const childPrimaryKeyValue = item[primaryKeyField];

          if (childPrimaryKeyValue === "") {
            insertStatements[item.index as keyof typeof insertStatements] =
              getInsertSQL(leftModelConfig, item, { fkField: leftForeignKey });
          } else {
            //TODO: Update method -> for not new only
            updateStatements[item.index as keyof typeof updateStatements] =
              getUpdateSQL(leftModelConfig, item, {
                fkField: leftForeignKey,
                pkValue: childPrimaryKeyValue as string,
              });
          }
        } catch (e) {
          console.log(e);
        }
      }
    }

    const deletedIDs = body[
      `deleted${leftModelConfig.pluralizedModelName}`
    ] as number[];

    const deleteStatements =
      deletedIDs?.map((item) => {
        return `DELETE FROM "${AppConfig.sanitizedAppName}"."${leftModelConfig.tableName}" WHERE "${primaryKeyField}" = ${item}`;
      }) || [];

    sqls[leftModelConfig.pluralizedModelName] = {
      insertStatements,
      updateStatements,
      deleteStatements,
    };
  }

  return sqls;
};
