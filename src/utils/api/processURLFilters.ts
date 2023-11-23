import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { generateQFields, getChildModelSQL } from "@/utils/api/utils";
import {
  findConfigItemObject,
  findLeftForeignKeyField,
  findRelationshipModelConfig,
} from "@/utils/utilities";
import { PostgrestQueryBuilder } from "@supabase/postgrest-js";

export const processURLFilters = (
  query: Record<string, string>,
  modelConfig: ModelConfig,
  supQuery: any,
  parentMode?: boolean,
  filterQueryNameToGet?: string
) => {
  const table = modelConfig.tableName;

  ///people?grade=gte.90&student=is.true&or=(age.eq.14,not.and(age.gte.11,age.lte.17))

  if (parentMode) {
    const q = query.q;
    if (q) {
      const fields: string[] = generateQFields(modelConfig);
      supQuery = supQuery.or(
        `${fields.map((field) => `${field}.ilike.*${q}*`).join(",")}`
      );
      /* filters.push(
        `or(${fields.map((field) => `${field}.ilike.*${q}*`).join(",")})`
      ); */
    }
  }

  modelConfig.filters
    .filter(
      ({ filterQueryName }) =>
        filterQueryName !== "q" &&
        (filterQueryNameToGet ? filterQueryName === filterQueryNameToGet : true)
    )
    .sort((a, b) => a.filterOrder - b.filterOrder)
    .forEach(
      ({
        filterQueryName,
        filterOperator,
        seqModelFieldID,
        seqModelRelationshipID,
        options,
      }) => {
        let queryValue = query[filterQueryName];

        const field = seqModelFieldID
          ? findConfigItemObject(
              modelConfig.fields,
              "seqModelFieldID",
              seqModelFieldID
            )
          : undefined;
        /* const field = modelConfig.fields.find(
          (field) => field.seqModelFieldID === seqModelFieldID
        )!; */
        const databaseFieldName = field?.databaseFieldName;
        const dataType = field?.dataType;
        const alias = filterQueryNameToGet
          ? filterQueryNameToGet + modelConfig.modelName
          : "";

        const isBetweenDatesFilter =
          dataType === "DATEONLY" && filterOperator === "Between";

        if (queryValue || isBetweenDatesFilter) {
          if (filterOperator === "isPresent" && seqModelRelationshipID) {
            //get the leftmodel config
            const leftModelConfig = findRelationshipModelConfig(
              seqModelRelationshipID,
              "LEFT"
            );

            processURLFilters(
              query,
              leftModelConfig,
              supQuery,
              false,
              filterQueryName
            );
          }
          if (filterOperator === "Equal" && dataType === "BOOLEAN" && options) {
            if (queryValue === options[0].fieldValue) {
              supQuery = supQuery.is(databaseFieldName, true);
              /* filters.push(`${databaseFieldName}.is.true`); */
            } else {
              supQuery = supQuery.is(databaseFieldName, false);
              /* filters.push(`${databaseFieldName}.not.is.true`); */
            }

            return;
          }

          if (filterOperator === "Equal") {
            supQuery = supQuery.eq(databaseFieldName, queryValue);
            /* filters.push(`${databaseFieldName}.eq.${filterQueryName}`); */
            return;
          }

          if (isBetweenDatesFilter) {
            const dateFromName = `${filterQueryName}From`;
            const dateToName = `${filterQueryName}To`;
            const dateFrom = query[dateFromName];
            const dateTo = query[dateToName];

            if (dateFrom && dateTo) {
              supQuery = supQuery
                .gte(filterQueryName, dateFrom)
                .lte(filterQueryName, dateTo);
              /* filters.push(
                `${filterQueryName}.gte.${dateFrom},${filterQueryName}.lte.${dateTo}`
              ); */
            }

            return;
          }

          if (filterOperator === "Not is Null") {
            //use alias if the filter is based on relationship
            supQuery = supQuery.not(
              filterQueryNameToGet
                ? `${alias}.${databaseFieldName}`
                : databaseFieldName,
              "is",
              null
            );
            /* filters.push(`${table}.${databaseFieldName}.is.null`); */
            return;
          }

          if (filterOperator === "Is Null") {
            supQuery = supQuery.is(databaseFieldName, null);
            /* filters.push(`${table}.${databaseFieldName}.not.is.null`); */
            return;
          }
        }
      }
    );
};
