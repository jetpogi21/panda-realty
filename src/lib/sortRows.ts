import { ModelConfig } from "@/interfaces/ModelConfig";
import {
  findConfigItem,
  findConfigItemObject,
  findModelPrimaryKeyField,
} from "@/utils/utilities";

export const sortRows = <T>(
  a: T,
  b: T,
  desc: boolean,
  field: keyof T,
  modelConfig: ModelConfig
) => {
  const primaryKeyField = findModelPrimaryKeyField(modelConfig)
    .fieldName as keyof T;

  const primaryKeyA = a[primaryKeyField];
  const primaryKeyB = b[primaryKeyField];

  if (primaryKeyA === "") return 1;
  if (primaryKeyB === "") return -1;

  const fieldConfig = findConfigItemObject(
    modelConfig.fields,
    "fieldName",
    field as keyof (typeof modelConfig.fields)[number]
  );

  const fieldType = fieldConfig.dataTypeInterface;

  if (fieldType === "string") {
    return compareStringFields(a, b, field, desc);
  } else {
    return compareNonStringFields(a, b, field, desc);
  }
};

const compareStringFields = <T>(a: T, b: T, field: keyof T, desc: boolean) => {
  const aField = a[field] as unknown as string;
  const bField = b[field] as unknown as string;
  return desc ? bField.localeCompare(aField) : aField.localeCompare(bField);
};

const compareNonStringFields = <T>(
  a: T,
  b: T,
  field: keyof T,
  desc: boolean
) => {
  if (a[field] === null) return -1;
  if (b[field] === null) return 1;

  const aField = a[field] as unknown as number;
  const bField = b[field] as unknown as number;
  return desc ? bField - aField : aField - bField;
};
