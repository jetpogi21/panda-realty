import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { getURLORder } from "@/lib/getURLOrder";
import { addCursorFilterToURL } from "@/utils/api/addCursorFilterToURL";
import { appendFieldsToColumn } from "@/utils/api/appendFieldsToColumn";
import { processURLFilters } from "@/utils/api/processURLFilters";
import {
  generateFieldsForSQL,
  getSortedValueSimplified,
} from "@/utils/api/utils";
import { findModelPrimaryKeyField } from "@/utils/utilities";
import { getSort } from "@/utils/utils";
import { createSupabaseRoute } from "@/lib/supabase/supabase";
import { getRelatedTableFields } from "@/utils/api/getRelatedTableFields";

export function getMainModelURL(
  query: Record<string, string>,
  dontFilter: boolean = false,
  modelConfig: ModelConfig,
  supabase: ReturnType<typeof createSupabaseRoute>,
  options?: {
    primaryKeyValue?: string | number;
    useSlug?: boolean;
  }
) {
  const simpleOnly = query["simpleOnly"] === "true";
  const cursor = query["cursor"];
  const limit = query["limit"] || modelConfig.limit || AppConfig.limit || 10;

  const sort = getSortedValueSimplified(query["sort"], modelConfig); //-date

  const sortField = sort.includes("-") ? sort.substring(1) : sort; //date

  //Declare the variables
  const table = modelConfig.tableName;

  const primaryKeyField = findModelPrimaryKeyField(modelConfig);
  const fields: ([string, string] | string)[] =
    generateFieldsForSQL(modelConfig);

  //build the sql field name and aliases (aliases are used to destructure the object)
  const columns: string[] = [];
  appendFieldsToColumn(fields, columns);

  if (!simpleOnly) {
    getRelatedTableFields(modelConfig, query, options?.primaryKeyValue).forEach(
      (field) => {
        columns.push(field);
      }
    );
  }

  let supQuery: any = supabase.schema(AppConfig.sanitizedAppName).from(table);

  const fetchCount = query["fetchCount"] === "true";

  if (fetchCount) {
    supQuery = supQuery.select(columns.join(","), { count: "exact" });
  } else {
    supQuery = supQuery.select(columns.join(","));
  }

  //This will be used to store the fields to be used from the joins

  //should produce like this
  //actors!inner()&actors.first_name=eq.Jehanne&actors=not.is.null --> if there's a filter involved
  if (!simpleOnly) {
    if (!dontFilter) {
      //After this function there will be new supQuery
      processURLFilters(query, modelConfig, supQuery, true);
    }
  }

  //This is for the detailed view wether find the id or the slug
  if (options?.primaryKeyValue) {
    const id = options.primaryKeyValue;
    if (options?.useSlug) {
      supQuery = supQuery.eq("slug", id);
    } else {
      supQuery = supQuery.eq(primaryKeyField.databaseFieldName, id);
    }
  }

  const orderBy = getSort(
    sort,
    modelConfig.sortString,
    primaryKeyField.databaseFieldName
  );

  if (cursor) {
    addCursorFilterToURL(
      cursor,
      sort,
      sortField,
      primaryKeyField.databaseFieldName,
      supQuery,
      table
    );
  }

  if (options?.primaryKeyValue) {
    supQuery.limit(1);
  } else {
    getURLORder(orderBy, supQuery);
    if (!simpleOnly) {
      supQuery.limit(limit);
    }
  }

  //TO DO: JOINS (filtering, ordering etc.)
  const joins = "";
  /* sql.fields = sql.fields.concat(joinFields);

  sql.joins = [distinctJoin, ...leftJoins];

  //Insert joins here LEFT joins e.g. cardCardKeywordJoin, distincJoin or
  //new clsJoin("marvelduel_belongsto", "deck_id", "id", null)
  resetSQL(sql); */

  //rowURL should be `tableName`
  //columns --> fieldName:databaseFIeldName to rename
  //append filterString only if it's not null
  /* const rowURL = `${countURL}&limit=${limit}`; */

  return supQuery;
}
