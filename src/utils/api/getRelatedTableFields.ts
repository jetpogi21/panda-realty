import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { findRelationshipModelConfig } from "@/utils/utilities";

export const getRelatedTableFields = (
  modelConfig: ModelConfig,
  query: Record<string, string>,
  primaryKeyValue?: string | number
) => {
  const columns: string[] = [];

  const processRelationships = (
    relationships: (typeof AppConfig)["relationships"],
    side: "LEFT" | "RIGHT"
  ) => {
    relationships.forEach((relationship) => {
      const relatedModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        side
      );

      const { modelName, tableName, fields, pluralizedModelName } =
        relatedModelConfig;

      let column = "";

      const isPrimaryKey = primaryKeyValue !== undefined;

      const excludeCondition =
        isPrimaryKey && side === "LEFT"
          ? relationship.excludeInForm
          : relationship.excludeInTable;

      if (!excludeCondition) {
        const fieldStr = fields.map(({ databaseFieldName, fieldName }) =>
          fieldName !== databaseFieldName
            ? `${fieldName}:${databaseFieldName}`
            : databaseFieldName
        );

        const name = side === "LEFT" ? pluralizedModelName : modelName;
        column += `${name}:${tableName}(${fieldStr})`;

        columns.push(column);
      }

      modelConfig.filters
        .filter(
          (filter) =>
            filter.seqModelRelationshipID ===
            relationship.seqModelRelationshipID
        )
        .forEach((filterConfig) => {
          const { filterQueryName } = filterConfig;
          const alias = filterQueryName + modelName;
          const queryValue = query[filterQueryName];

          if (queryValue) {
            columns.push(`${alias}:${tableName}!inner()`);
          }
        });
    });
  };

  const leftModelRelationships = AppConfig.relationships.filter(
    (relationship) =>
      relationship.leftModelID === modelConfig.seqModelID &&
      //Why the primaryKeyValue is needed here?
      /* (primaryKeyValue
        ? !relationship.excludeInForm
        : !relationship.excludeInTable) */
      (primaryKeyValue ? true : !relationship.excludeInTable)
  );

  processRelationships(leftModelRelationships, "RIGHT");

  const rightModelRelationships = AppConfig.relationships.filter(
    (relationship) => relationship.rightModelID === modelConfig.seqModelID
  );

  processRelationships(rightModelRelationships, "LEFT");

  return columns;
};
