import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { findModelPrimaryKeyField, forceCastToNumber } from "@/utils/utilities";

const createParsedPayload = (
  modelConfig: ModelConfig,
  payload: Record<string, unknown>
) => {
  const parsedPayload: Record<string, unknown> = {};
  const payloadKeys = Object.keys(payload).map((key) => key);

  //This should also just get the fields which is on the payload since it will be replaced by a
  //default (e.g. null if it's not provided as a payload)
  //Useful for updating selected fields only.
  modelConfig.fields
    .filter(
      (field) => !field.primaryKey && payloadKeys.includes(field.fieldName)
    )
    .forEach(({ dataType, fieldName, allowNull }) => {
      const value = payload[fieldName];

      let parsedValue;
      if ((value === null || value === "") && allowNull) {
        parsedValue = null;
      } else if (value === null && dataType === "BOOLEAN") {
        parsedValue = false;
      } else if (dataType === "BIGINT") {
        parsedValue = forceCastToNumber(payload[fieldName] as string);
      } else {
        parsedValue = payload[fieldName];
      }

      parsedPayload[fieldName] = parsedValue;
    });

  return parsedPayload;
};

export const getCreateJSON = (
  modelConfig: ModelConfig,
  payload: Record<string, unknown>
) => {
  const parsedPayload = createParsedPayload(modelConfig, payload);

  return parsedPayload;
};

export const getInsertSQL = (
  modelConfig: ModelConfig,
  payload: Record<string, unknown>,
  options?: {
    returnPKOnly?: boolean;
    fkField?: string;
  }
) => {
  const parsedPayload = createParsedPayload(modelConfig, payload);

  const schema = AppConfig.sanitizedAppName;
  const table = modelConfig.tableName;
  const primaryKeyField =
    findModelPrimaryKeyField(modelConfig).databaseFieldName;

  const qualifiedFields: string[] = [];
  const qualifiedValues: string[] = [];

  const fields = modelConfig.fields.filter(({ databaseFieldName }) =>
    options?.fkField ? databaseFieldName !== options.fkField : true
  );
  for (const { databaseFieldName, dataTypeInterface, fieldName } of fields) {
    const value = parsedPayload[fieldName];

    if (value !== undefined) {
      qualifiedFields.push(`"${databaseFieldName}"`);
      if (value === null) {
        qualifiedValues.push(`NULL`);
      } else if (dataTypeInterface === "boolean") {
        qualifiedValues.push(value === "true" ? "TRUE" : "FALSE");
      } else if (dataTypeInterface !== "number") {
        qualifiedValues.push(`'${value}'`);
      } else {
        qualifiedValues.push(`${value}`);
      }
    }
  }

  const fkField = options?.fkField;
  if (fkField) {
    qualifiedFields.push(`"${fkField}"`);
    qualifiedValues.push("$1");
  }

  const sql = `INSERT INTO "${schema}"."${table}" (${qualifiedFields}) VALUES (${qualifiedValues}) RETURNING ${
    options?.returnPKOnly ? primaryKeyField : "*"
  }`;

  return sql;
};

export const getUpdateSQL = (
  modelConfig: ModelConfig,
  payload: Record<string, unknown>,
  options?: {
    pkValue?: string;
    returnPKOnly?: boolean;
    fkField?: string;
  }
) => {
  const parsedPayload = createParsedPayload(modelConfig, payload);

  const schema = AppConfig.sanitizedAppName;
  const table = modelConfig.tableName;
  const primaryKeyField =
    findModelPrimaryKeyField(modelConfig).databaseFieldName;

  const qualifiedFields: string[] = [];
  const qualifiedValues: string[] = [];

  const payloadKeys = Object.keys(parsedPayload);

  //Filter the fields to only show all the fields that are on the payload
  const fields = modelConfig.fields
    .filter(
      ({ fieldName, databaseFieldName }) =>
        payloadKeys.includes(fieldName) && databaseFieldName !== primaryKeyField
    )
    .filter(({ databaseFieldName }) =>
      options?.fkField ? databaseFieldName !== options.fkField : true
    );
  for (const { databaseFieldName, dataTypeInterface, fieldName } of fields) {
    const value = parsedPayload[fieldName];

    if (value !== undefined) {
      qualifiedFields.push(`"${databaseFieldName}"`);
      if (value === null) {
        qualifiedValues.push(`NULL`);
      } else if (dataTypeInterface === "boolean") {
        qualifiedValues.push(value === true ? "TRUE" : "FALSE");
      } else if (dataTypeInterface !== "number") {
        qualifiedValues.push(`'${value}'`);
      } else {
        qualifiedValues.push(`${value}`);
      }
    }
  }

  const primaryKeyValue =
    options?.pkValue || (parsedPayload[primaryKeyField] as string);

  /* const fkField = options?.fkField;
  if (fkField) {
    qualifiedFields.push(`"${fkField}"`);
    qualifiedValues.push(primaryKeyValue);
  } */

  const setStatements: string[] = qualifiedFields.map((field, idx) => {
    return `${field} = ${qualifiedValues[idx]}`;
  });

  const sql = `UPDATE "${schema}"."${table}" SET ${setStatements.join(
    ","
  )} WHERE ${primaryKeyField} = ${primaryKeyValue} RETURNING ${
    options?.returnPKOnly ? primaryKeyField : "*"
  }`;

  return sql;
};

/* export const getUpdateSQL = (
  modelConfig: ModelConfig,
  payload: Record<string, unknown>,
  primaryKeyValue: string
) => {
  const parsedPayload = createParsedPayload(modelConfig, payload);

  const schema = AppConfig.sanitizedAppName;
  const table = modelConfig.tableName;
  const primaryKeyField =
    findModelPrimaryKeyField(modelConfig).databaseFieldName;
  const setStatements = Object.entries(parsedPayload)
    .filter(([key, _]) => key !== primaryKeyField)
    .map(([key, value]) => `"${key}"='${value}'`);

  const sql = `UPDATE "${schema}"."${table}" SET ${setStatements.join(
    ","
  )} WHERE "${primaryKeyField}" = '${primaryKeyValue}' RETURNING *`;

  return sql;
}; */

/* export const createModel = async (
  modelConfig: ModelConfig,
  payload: Record<string, unknown>,
  t: Transaction
) => {
  const parsedPayload = createParsedPayload(modelConfig, payload);
  const Model =
    backendModels[modelConfig.modelName as keyof typeof backendModels];

  //@ts-ignore
  return await Model.create(parsedPayload as any, { transaction: t });
};

export const updateModel = async (
  modelConfig: ModelConfig,
  payload: Record<string, unknown>,
  primaryKeyValue: number | string,
  t: Transaction
) => {
  const parsedPayload = createParsedPayload(modelConfig, payload);

  const primaryKeyField = findModelPrimaryKeyField(modelConfig);
  const Model =
    backendModels[modelConfig.modelName as keyof typeof backendModels];

  //@ts-ignore
  await Model.update(parsedPayload as any, {
    where: {
      [primaryKeyField.fieldName]:
        primaryKeyValue || payload[primaryKeyField.fieldName],
    },
    transaction: t,
    individualHooks: true,
  });
};

export const deleteModels = async (
  modelConfig: ModelConfig,
  deletedIds: string[] | number[],
  t: Transaction
) => {
  const primaryKeyField = findModelPrimaryKeyField(modelConfig);
  const Model =
    backendModels[modelConfig.modelName as keyof typeof backendModels];
  //@ts-ignore
  await Model.destroy({
    where: { [primaryKeyField.fieldName]: { [Op.in]: deletedIds } },
    transaction: t,
  });
}; */
