import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { ModelSchema } from "@/schema/ModelSchema";
/* import { createModel, deleteModels, updateModel } from "@/utils/api/ModelLibs"; */
import clsJoin from "@/utils/clsJoin";
import clsSQL from "@/utils/clsSQL";
import {
  findConfigItem,
  findConfigItemObject,
  findFielToBeInsertedField,
  findLeftForeignKeyField,
  findModelPrimaryKeyField,
  findRelationshipModelConfig,
  forceCastToNumber,
} from "@/utils/utilities";
import {
  getSort,
  removeDuplicates,
  splitWordByLastHyphen,
} from "@/utils/utils";
/* import { Op, Transaction } from "sequelize"; */

export function getSortedValue(
  sort: string | undefined,
  modelAttributes: string[],
  DEFAULT_SORT_BY: string
): string {
  if (sort) {
    const isSortValid =
      modelAttributes.includes(sort) ||
      modelAttributes.includes(sort.substring(1));

    return isSortValid ? sort : DEFAULT_SORT_BY;
  } else {
    return DEFAULT_SORT_BY;
  }
}

type DataItem = {
  [key: string]: any;
};

export function getCursorString(
  sortField: string,
  PRIMARY_KEY: string,
  data: DataItem[]
): string {
  if (data && data.length > 0) {
    if (sortField !== PRIMARY_KEY) {
      if (data[data.length - 1][sortField] === null) {
        return `-${data[data.length - 1][PRIMARY_KEY].toString()}`;
      } else {
        return `${data[data.length - 1][sortField].toString()}-${data[
          data.length - 1
        ][PRIMARY_KEY].toString()}`;
      }
    } else {
      return `${data[data.length - 1][sortField].toString()}`;
    }
  }

  return "";
}

export function addCursorFilterToQuery(
  cursor: string,
  sort: string,
  sortField: string,
  PRIMARY_KEY: string,
  replacements: Record<string, any>,
  filters: string[],
  tableName?: string
): void {
  const cursorCondition = sort.includes("-") ? "<" : ">";
  const [cursorArray0, cursorArray1] = splitWordByLastHyphen(cursor);

  const realPrimaryKey = tableName
    ? `${tableName}.${PRIMARY_KEY}`
    : PRIMARY_KEY;

  const realSortField = tableName ? `${tableName}.${sortField}` : sortField;

  const addFilter = (
    condition: string,
    clause?: string,
    clauseReplacements?: Record<string, any>
  ) => {
    filters.push(clause ? `(${clause})` : condition);
    if (clauseReplacements) {
      Object.assign(replacements, clauseReplacements);
    }
  };

  if (sortField !== PRIMARY_KEY) {
    if (!cursorArray0) {
      addFilter(
        `${realSortField} IS NULL AND ${realPrimaryKey} > :cursorArray1`,
        cursorCondition === "<"
          ? `(${realSortField} IS NULL AND ${realPrimaryKey} > :cursorArray1)`
          : `NOT ${realSortField} IS NULL OR (${realSortField} IS NULL AND ${realPrimaryKey} > :cursorArray1)`,
        { cursorArray1 }
      );
    } else {
      addFilter(
        `(${realSortField} ${cursorCondition} :cursorArray0 OR (${realSortField} = :cursorArray0 AND ${realPrimaryKey} > :cursorArray1))`,
        undefined,
        { cursorArray0, cursorArray1 }
      );
    }
  } else {
    addFilter(`${realSortField} ${cursorCondition} :cursor`, undefined, {
      cursor,
    });
  }
}

type Field = string | [string, string];

export function appendFieldsToSQL(
  fields: Field[],
  sql: clsSQL,
  table: string
): void {
  fields.forEach((field) => {
    let fieldName, fieldAlias;
    if (Array.isArray(field)) {
      fieldAlias = `"${field[1]}"`;
      fieldName = `"${field[0]}"`;
    } else {
      fieldAlias = `"${field}"`;
      fieldName = `"${field}"`;
    }

    sql.fields.push(`${table}.${fieldName} AS ${fieldAlias}`);
  });
}

export function resetSQL(sql: clsSQL) {
  sql.limit = 0;
  //sql.orderBy = [];
  sql.filter = "";
  sql.groupBy = [];
}

export function processFields(
  fields: (string | [string, string])[],
  modelName: string,
  table: string,
  fieldAliases: string[],
  sql: clsSQL
): void {
  fields.forEach((field) => {
    let fieldAlias, fieldName;
    if (Array.isArray(field)) {
      fieldAlias = `"${modelName}.${field[1]}"`;
      fieldName = field[0];
    } else {
      fieldAlias = `"${modelName}.${field}"`;
      fieldName = field;
    }

    fieldAliases.push(fieldAlias);
    sql.fields.push(`${table}.${fieldName} AS ${fieldAlias}`);
  });
}

/* export function buildOrConditions(
  sortField: string,
  cursorCondition: symbol,
  cursorArray: [string, string],
  primaryKey: string
) {
  return {
    [Op.or]: {
      [sortField]: {
        [Op.or]: {
          [Op.is]: null,
          [cursorCondition]: cursorArray[0],
        },
      },
      [Op.and]: {
        [sortField]: cursorArray[0],
        [primaryKey]: {
          [Op.gt]: cursorArray[1],
        },
      },
    },
  };
} */

/* export function buildAndConditions(
  sortField: string,
  cursorCondition: symbol,
  cursorArray: [string, string],
  primaryKey: string
) {
  return {
    [Op.and]: {
      [sortField]: {
        [cursorCondition]: cursorArray[0],
      },
      [primaryKey]: {
        [Op.gt]: cursorArray[1],
      },
    },
  };
} */

/* export const appendAndFilters = (
  andFilters: any[],
  sort: string,
  sortField: string,
  primaryKey: string,
  cursor: string
) => {
  //Use less than if the sort is descending
  const cursorCondition = sort.includes("-") ? Op.lt : Op.gt;
  //If sortField is not primary key then do dual cursor
  if (sortField !== primaryKey) {
    const cursorArray = splitWordByLastHyphen(cursor);

    if (cursorArray[0] === "") {
      if (cursorCondition === Op.gt) {
        andFilters.push({
          [Op.or]: {
            [sortField]: {
              [Op.not]: null,
            },
            [Op.and]: {
              [sortField]: { [Op.is]: null },
              [primaryKey]: {
                [Op.gt]: cursorArray[1],
              },
            },
          },
        });
      } else {
        andFilters.push({
          [Op.or]: {
            [Op.and]: {
              [sortField]: { [Op.is]: null },
              [primaryKey]: {
                [Op.gt]: cursorArray[1],
              },
            },
          },
        });
      }
    } else {
      if (cursorCondition === Op.gt) {
        andFilters.push({
          [Op.or]: {
            [sortField]: {
              [cursorCondition]: cursorArray[0],
            },
            [Op.and]: {
              [sortField]: cursorArray[0],
              [primaryKey]: {
                [Op.gt]: cursorArray[1],
              },
            },
          },
        });
      } else {
        andFilters.push({
          [Op.or]: {
            [sortField]: {
              [Op.or]: {
                [Op.is]: null,
                [cursorCondition]: cursorArray[0],
              },
            },
            [Op.and]: {
              [sortField]: cursorArray[0],
              [primaryKey]: {
                [Op.gt]: cursorArray[1],
              },
            },
          },
        });
      }
    }
  } else {
    andFilters.push({
      [sortField]: {
        [cursorCondition]: cursor,
      },
    });
  }
}; */

export const getCursor = (
  data: any[],
  sortField: string,
  primaryKey: string
) => {
  if (data && data.length > 0) {
    //The cursor will have 2 items since there will be 2 cursors to be made
    if (sortField !== primaryKey) {
      if (data[data.length - 1][sortField] === null) {
        return `-${data[data.length - 1][primaryKey].toString()}`;
      } else {
        return `${data[data.length - 1][sortField].toString()}-${data[
          data.length - 1
        ][primaryKey].toString()}`;
      }
    } else {
      return `${data[data.length - 1][sortField].toString()}`;
    }
  }
};

export function getDatabaseFieldName(key: string, COLUMNS: any): string {
  let sortField = key.includes("-") ? key.substring(1) : key;
  const column = COLUMNS[sortField];

  if (column?.db_name) {
    return column.db_name;
  }
  return sortField;
}

export function getDatabaseFieldNameConfig(
  key: string,
  config: ModelConfig
): string {
  let sortField = key.includes("-") ? key.substring(1) : key;
  const column = config.fields.find(
    (field) => field.fieldName === sortField
  )?.databaseFieldName;

  return column!;
}

export function getColumnKeyByDbName(fieldName: string, COLUMNS: any) {
  for (const key in COLUMNS) {
    if (COLUMNS[key].db_name === fieldName) {
      return key;
    }
  }
  return fieldName;
}

export function getMappedKeys(columns: {
  [key: string]: { type: string; db_name?: string };
}): string[] {
  const mappedKeys: string[] = [];

  for (const key in columns) {
    if (columns.hasOwnProperty(key)) {
      const column = columns[key];
      const columnName = column.db_name || key;
      mappedKeys.push(columnName);
    }
  }

  return mappedKeys;
}

export const generateFieldsForSQL = (
  config: ModelConfig
): ([string, string] | string)[] => {
  const field = [];
  if (config.slugField) {
    field.push("slug");
  }
  config.fields
    .sort((a, b) => a.fieldOrder - b.fieldOrder)
    .forEach(({ fieldName, databaseFieldName }) => {
      if (fieldName === databaseFieldName) {
        field.push(fieldName);
      } else {
        field.push([databaseFieldName, fieldName]);
      }
    });
  return field;
};

export const generateQFields = (config: ModelConfig) => {
  return config.filters
    .filter(
      ({ filterQueryName, seqModelFieldID }) =>
        filterQueryName === "q" && seqModelFieldID
    )
    .map(({ seqModelFieldID }) =>
      findConfigItem(
        config.fields,
        "seqModelFieldID",
        seqModelFieldID!,
        "databaseFieldName"
      )
    ) as string[];
};

export const getSortedValueSimplified = (
  sortQuery: string | undefined,
  config: ModelConfig
): string => {
  let sort: string | undefined = config.sortString;

  if (sortQuery) {
    const sortField = sortQuery.startsWith("-")
      ? sortQuery.slice(1)
      : sortQuery;

    const sortFieldObject = findConfigItemObject(
      config.fields,
      "fieldName",
      sortField
    );

    const sortObject =
      sortFieldObject &&
      findConfigItemObject(
        config.sorts,
        "seqModelFieldID",
        sortFieldObject.seqModelFieldID
      );

    if (sortFieldObject && sortObject) {
      sort =
        (sortQuery.startsWith("-") ? "-" : "") +
        getDatabaseFieldNameConfig(sortQuery, config);
    }
  }

  const modelFields = config.fields.map((field) => field.databaseFieldName);
  return getSortedValue(sort, modelFields, config.sortString);
};

export const processQueryFilters = (
  sql: clsSQL,
  filters: string[],
  query: Record<string, string>,
  modelConfig: ModelConfig,
  replacements: Record<string, string>,
  parentMode?: boolean
) => {
  const table = modelConfig.tableName;

  if (parentMode) {
    const q = query.q;
    if (q) {
      const fields: string[] = generateQFields(modelConfig);
      replacements["q"] = `%${q}%`;
      filters.push(
        `(${fields.map((field) => `(${table}.${field} LIKE :q)`).join(" OR ")})`
      );
    }
  }

  modelConfig.filters
    .filter(({ filterQueryName }) => filterQueryName !== "q")
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

        const isBetweenDatesFilter =
          dataType === "DATEONLY" && filterOperator === "Between";

        if (queryValue || isBetweenDatesFilter) {
          if (filterOperator === "Equal" && dataType === "BOOLEAN" && options) {
            if (queryValue === options[0].fieldValue) {
              filters.push(`${table}.${databaseFieldName}`);
            } else {
              filters.push(`NOT ${table}.${databaseFieldName}`);
            }

            return;
          }

          if (filterOperator === "Equal") {
            filters.push(`${table}.${databaseFieldName} = :${filterQueryName}`);
            replacements[filterQueryName] = queryValue;
            return;
          }

          if (isBetweenDatesFilter) {
            const dateFromName = `${filterQueryName}From`;
            const dateToName = `${filterQueryName}To`;
            const dateFrom = query[dateFromName];
            const dateTo = query[dateToName];

            if (dateFrom && dateTo) {
              filters.push(
                `${filterQueryName} BETWEEN :${dateFromName} AND :${dateToName}`
              );
              replacements[dateFromName] = dateFrom;
              replacements[dateToName] = dateTo;
            }

            return;
          }

          if (filterOperator === "Not is Null") {
            filters.push(`NOT ${table}.${databaseFieldName} IS NULL`);
            return;
          }

          if (filterOperator === "Is Null") {
            filters.push(`${table}.${databaseFieldName} IS NULL`);
            return;
          }

          if (
            filterOperator === "isPresent" &&
            queryValue === "true" &&
            seqModelRelationshipID
          ) {
            const modelRelationship = findConfigItemObject(
              AppConfig.relationships,
              "seqModelRelationshipID",
              seqModelRelationshipID
            );

            const relatedModelConfig = findRelationshipModelConfig(
              seqModelRelationshipID,
              "LEFT"
            );

            const leftForeignKeyField = findLeftForeignKeyField(
              seqModelRelationshipID
            );

            const relatedModelSQL = getChildModelSQL(
              query,
              false,
              relatedModelConfig
            );

            const relatedModelJoin = new clsJoin(
              relatedModelSQL.sql.sql(),
              modelRelationship.rightForeignKey,
              `"${relatedModelSQL.modelName}.${leftForeignKeyField.fieldName}"`,
              `temp${relatedModelSQL.modelName}FilterQuery`,
              "INNER"
            );

            sql.joins = [relatedModelJoin];
            return;
          }
        }
      }
    );
};

const processLeftModelRelationships = (
  query: Record<string, string>,
  dontFilter: boolean,
  modelConfig: ModelConfig,
  replacements: Record<string, unknown>,
  joinFields: string[],
  sql: clsSQL,
  leftJoins: clsJoin[]
) => {
  const leftModelRelationships = AppConfig.relationships.filter(
    (relationship) =>
      relationship.leftModelID === modelConfig.seqModelID &&
      !relationship.excludeInTable
  );

  leftModelRelationships.forEach((relationship) => {
    const rightModelConfig = findRelationshipModelConfig(
      relationship.seqModelRelationshipID,
      "RIGHT"
    );

    const {
      sql: childSQL,
      fieldAliases,
      replacements: rightModelReplacements,
      subqueryAlias,
      modelName,
      filtered,
    } = getChildModelSQL(query, dontFilter, rightModelConfig);

    replacements = { ...replacements, ...rightModelReplacements };

    fieldAliases.forEach((field) => {
      joinFields.push(`${subqueryAlias}.${field}`);
    });

    const join = createJoin(
      childSQL.sql(),
      relationship.leftForeignKey,
      `"${modelName}.${relationship.rightForeignKey}"`,
      subqueryAlias,
      "INNER"
    );

    if (filtered) {
      sql.joins.push(join);
    }

    const leftSQL = getChildModelSQL(query, true, rightModelConfig).sql;
    const leftJoin = createJoin(
      leftSQL.sql(),
      relationship.leftForeignKey,
      `"${modelName}.${relationship.rightForeignKey}"`,
      subqueryAlias,
      "LEFT"
    );

    leftJoins.push(leftJoin);
  });
};

const processRightModelRelationships = (
  query: Record<string, string>,
  dontFilter: boolean,
  modelConfig: ModelConfig,
  replacements: Record<string, unknown>,
  joinFields: string[],
  sql: clsSQL,
  leftJoins: clsJoin[]
) => {
  const rightModelRelationships = AppConfig.relationships.filter(
    (relationship) =>
      relationship.rightModelID === modelConfig.seqModelID &&
      !relationship.excludeInTable &&
      !relationship.excludeInForm
  );

  rightModelRelationships.forEach((relationship) => {
    const leftModelConfig = findRelationshipModelConfig(
      relationship.seqModelRelationshipID,
      "LEFT"
    );

    const leftModelField = findLeftForeignKeyField(
      relationship.seqModelRelationshipID
    );

    const {
      sql: childSQL,
      fieldAliases,
      replacements: leftModelReplacements,
      subqueryAlias,
      modelName,
      filtered,
    } = getChildModelSQL(query, dontFilter, leftModelConfig);

    replacements = { ...replacements, ...leftModelReplacements };

    fieldAliases.forEach((field) => {
      joinFields.push(`${subqueryAlias}.${field}`);
    });

    const join = createJoin(
      childSQL.sql(),
      relationship.rightForeignKey,
      `"${modelName}.${leftModelField.fieldName}"`,
      subqueryAlias,
      "INNER"
    );

    if (filtered) {
      sql.joins.push(join);
    }

    const leftSQL = getChildModelSQL(query, true, leftModelConfig).sql;
    const leftJoin = createJoin(
      leftSQL.sql(),
      relationship.rightForeignKey,
      `"${modelName}.${leftModelField.fieldName}"`,
      subqueryAlias,
      "LEFT"
    );

    leftJoins.push(leftJoin);
  });
};

const createJoin = (
  sql: string,
  leftKey: string,
  rightKey: string,
  alias: string,
  type: "LEFT" | "INNER"
) => {
  return new clsJoin(sql, leftKey, rightKey, alias, type);
};

export const processQueryJoins = (
  query: Record<string, string>,
  dontFilter: boolean,
  modelConfig: ModelConfig,
  replacements: Record<string, unknown>,
  joinFields: string[],
  sql: clsSQL,
  leftJoins: clsJoin[]
) => {
  // Process joins for relationships where the current model is on the left side
  processLeftModelRelationships(
    query,
    dontFilter,
    modelConfig,
    replacements,
    joinFields,
    sql,
    leftJoins
  );

  // Process joins for relationships where the current model is on the right side
  processRightModelRelationships(
    query,
    dontFilter,
    modelConfig,
    replacements,
    joinFields,
    sql,
    leftJoins
  );
};

export const getChildModelSQL = (
  query: Record<string, string>,
  dontFilter: boolean,
  modelConfig: ModelConfig
) => {
  const table = `${AppConfig.sanitizedAppName}.${modelConfig.tableName}`;
  const fields: ([string, string] | string)[] =
    generateFieldsForSQL(modelConfig);
  const fieldAliases: string[] = [];
  const modelName = modelConfig.modelName;
  let filtered = false;
  let replacements: Record<string, string> = {};

  let sql = new clsSQL();
  sql.source = table;

  //build the sql field name and aliases (aliases are used to destructure the object)
  processFields(fields, modelName, table, fieldAliases, sql);

  const filters: string[] = [];

  if (!dontFilter) {
    processQueryFilters(sql, filters, query, modelConfig, replacements);
  }

  if (filters.length > 0) {
    filtered = true;
    sql.filter = filters.join(" AND ");
  }

  return {
    sql,
    fieldAliases,
    replacements,
    subqueryAlias: `temp${modelName}`,
    modelName,
    filtered,
  };
};

export function getMainModelSQL(
  query: Record<string, string>,
  dontFilter: boolean = false,
  modelConfig: ModelConfig,
  options?: {
    primaryKeyValue?: string | number;
    useSlug?: boolean;
  }
) {
  const simpleOnly = query["simpleOnly"];
  const cursor = query["cursor"];
  const limit = query["limit"] || modelConfig.limit || AppConfig.limit || 10;

  const sort = getSortedValueSimplified(query["sort"], modelConfig);
  const sortField = sort.includes("-") ? sort.substring(1) : sort;

  //Declare the variables
  /* const table = `${AppConfig.sanitizedAppName}_${modelConfig.tableName}`; */
  const table = modelConfig.tableName;
  const primaryKeyField = findModelPrimaryKeyField(modelConfig);
  const fields: ([string, string] | string)[] =
    generateFieldsForSQL(modelConfig);

  //This will be used to store the fields to be used from the joins
  const joinFields: string[] = [];

  //This will be used to store the replacements needed
  let replacements: Record<string, string> = {};

  const sql = new clsSQL();
  sql.source = table;

  const filters: string[] = [];

  if (!simpleOnly || simpleOnly !== "true") {
    if (!dontFilter) {
      processQueryFilters(sql, filters, query, modelConfig, replacements, true);
    }
  }

  if (options?.primaryKeyValue) {
    if (options?.useSlug) {
      filters.push(`${table}.slug = :id`);
    } else {
      filters.push(`${table}.${primaryKeyField.databaseFieldName} = :id`);
    }
    replacements["id"] = options.primaryKeyValue as string;
  }

  const leftJoins: clsJoin[] = [];

  processQueryJoins(
    query,
    dontFilter,
    modelConfig,
    replacements,
    joinFields,
    sql,
    leftJoins
  );

  //Count should be pre-cursor
  //This part would return the count SQL
  sql.fields = [
    `COUNT(DISTINCT ${AppConfig.sanitizedAppName}.${table}.${primaryKeyField.databaseFieldName}) AS count`,
  ];
  if (filters.length > 0) {
    sql.filter = filters.join(" AND ");
  }
  const countSQL = sql.sql();

  sql.filter = "";

  sql.orderBy = getSort(
    sort,
    modelConfig.sortString,
    primaryKeyField.databaseFieldName
  );
  if (cursor) {
    addCursorFilterToQuery(
      cursor,
      sort,
      sortField,
      primaryKeyField.databaseFieldName,
      replacements,
      filters,
      table
    );
  }

  if (filters.length > 0) {
    sql.filter = filters.join(" AND ");
  }

  sql.limit = simpleOnly === "true" ? 0 : forceCastToNumber(limit);

  //This part will produce the distinct SQL
  sql.fields = [`${table}.${primaryKeyField.databaseFieldName}`];
  sql.groupBy = [primaryKeyField.databaseFieldName];

  const distinctSQL = sql.sql();

  const distinctJoin = new clsJoin(
    distinctSQL,
    primaryKeyField.databaseFieldName,
    primaryKeyField.databaseFieldName,
    "tempDistinct",
    "INNER"
  );

  sql.fields = [];

  //build the sql field name and aliases (aliases are used to destructure the object)
  appendFieldsToSQL(fields, sql, table);

  sql.fields = sql.fields.concat(joinFields);

  sql.joins = [distinctJoin, ...leftJoins];

  //Insert joins here LEFT joins e.g. cardCardKeywordJoin, distincJoin or
  //new clsJoin("marvelduel_belongsto", "deck_id", "id", null)
  resetSQL(sql);

  const sqlString: string = sql.sql();

  return {
    sqlString,
    countSQL,
    replacements,
  };
}

export const getLeftConfigNamesFromRightModelId = (
  modelConfig: ModelConfig
): [string, string][] => {
  return AppConfig.relationships
    .filter(
      (relationship) =>
        relationship.rightModelID === modelConfig.seqModelID &&
        !relationship.excludeInForm &&
        !relationship.excludeInTable
    )
    .map((relationship) => {
      const leftModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        "LEFT"
      );
      return [leftModelConfig.modelName, leftModelConfig.pluralizedModelName];
    });
};

export const removeDuplicatesFromRightModelRelationships = (
  data: Record<string, unknown>[],
  modelConfig: ModelConfig
) => {
  AppConfig.relationships
    .filter(
      (relationship) =>
        relationship.rightModelID === modelConfig.seqModelID &&
        !relationship.excludeInForm &&
        !relationship.excludeInTable
    )
    .forEach((relationship) => {
      const leftModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        "LEFT"
      );
      removeDuplicates(
        data,
        leftModelConfig.pluralizedModelName,
        findModelPrimaryKeyField(leftModelConfig).databaseFieldName
      );
    });
};

/* export const deleteRelatedSimpleModels = async (
  modelConfig: ModelConfig,
  res: Record<string, unknown>,
  t: Transaction
) => {
  const relationships = AppConfig.relationships.filter(
    ({ rightModelID, isSimpleRelationship }) =>
      rightModelID === modelConfig.seqModelID && isSimpleRelationship
  );

  await Promise.all(
    relationships.map(async (relationship) => {
      const leftModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        "LEFT"
      );

      //@ts-ignore
      const deletedIDs: number[] =
        res[`deleted${leftModelConfig.pluralizedModelName}`];

      if (deletedIDs && deletedIDs.length > 0) {
        await deleteModels(leftModelConfig, deletedIDs, t);
      }
    })
  );
}; */

/* export const createNewRecordsForModelAndSimpleRelationships = async (
  modelConfig: ModelConfig,
  parentPrimaryKeyValue: string | number,
  res: Record<string, unknown>,
  t: Transaction,
  newRecords: Record<string, unknown>
) => {
  const relationships = AppConfig.relationships.filter(
    ({ rightModelID, isSimpleRelationship }) =>
      rightModelID === modelConfig.seqModelID && isSimpleRelationship
  );

  await Promise.all(
    relationships.map(async (relationship) => {
      const leftModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        "LEFT"
      );

      const leftPrimaryKeyField = findModelPrimaryKeyField(leftModelConfig);

      //the foreign key (fieldname) of the main model
      const leftField = findLeftForeignKeyField(
        relationship.seqModelRelationshipID
      );

      const throughModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        "TROUGH"
      );

      //@ts-ignore
      const newIDs: number[] =
        res[`new${throughModelConfig.pluralizedVerboseModelName}`];

      const newChildRecords: Record<string, unknown>[] = [];

      await Promise.all(
        newIDs.map(async (item) => {
          const newRecord = await createModel(
            leftModelConfig,
            {
              [leftField.fieldName]: parentPrimaryKeyValue,
              [relationship.fieldToBeInserted!]: item,
            },
            t
          );

          const newChildID: number | string =
            //@ts-ignore
            newRecord[leftPrimaryKeyField.fieldName];

          //TO DO newChildRecords push to childRecords
          newChildRecords.push({
            [relationship.fieldToBeInserted!]: item,
            [findModelPrimaryKeyField(leftModelConfig).fieldName]: newChildID,
          });
        })
      );

      newRecords[leftModelConfig.pluralizedModelName] = newChildRecords;
    })
  );
}; */

/* export const updateOrCreateRelatedRecords = async (
  modelConfig: ModelConfig,
  res: any,
  parentPrimaryKeyValue: number | string,
  t: Transaction,
  newRecords: Record<string, unknown>
) => {
  const relationships = AppConfig.relationships.filter(
    (relationship) =>
      relationship.rightModelID === modelConfig.seqModelID &&
      !relationship.isSimpleRelationship
  );

  await Promise.all(
    relationships.map(async (relationship) => {
      const newChildRecords: Record<string, unknown>[] = [];
      const leftModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        "LEFT"
      );
      const primaryKeyField = findModelPrimaryKeyField(leftModelConfig);
      const leftField = findLeftForeignKeyField(
        relationship.seqModelRelationshipID
      );
      const modelPayload = res[leftModelConfig.pluralizedModelName];

      if (modelPayload) {
        for (const item of modelPayload) {
          item[leftField.fieldName] = parentPrimaryKeyValue;
          try {
            await ModelSchema(leftModelConfig).validate(item);
            const childPrimaryKeyValue = item[primaryKeyField.fieldName];
            if (childPrimaryKeyValue === "") {
              const newChildRecord = await createModel(
                leftModelConfig,
                item,
                t
              );
              //@ts-ignore
              const newChildID = newChildRecord[primaryKeyField.fieldName];

              newChildRecords.push({
                index: item.index,
                [primaryKeyField.fieldName]: newChildID,
              });
            } else {
              await updateModel(
                modelConfig,
                modelPayload,
                childPrimaryKeyValue,
                t
              );
            }
          } catch (error) {
            console.log(error);
          }
        }
      }
      newRecords[leftModelConfig.pluralizedModelName] = newChildRecords;
    })
  );
}; */
