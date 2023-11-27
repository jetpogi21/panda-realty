import { ModelConfig } from "@/interfaces/ModelConfig";
import { addItemByIndex } from "@/lib/addItemByIndex";
import { deleteItemByIndex } from "@/lib/deleteItemByIndex";
import { getChildModels } from "@/lib/getChildModels";
import { getChildModelsWithDropzone } from "@/lib/getChildModelsWithDropzone";
import { getChildModelsWithSimpleRelationship } from "@/lib/getChildModelsWithSimpleRelationship";
import { getSortedFormikFormControlFields } from "@/lib/getSortedFormikFormControlFields";
import {
  findRelationshipModelConfig,
  forceCastToNumber,
} from "@/utils/utilities";
import slugify from "slugify";

export interface OverrideRowProp {
  [key: number]: string[];
}

export const generateGridTemplateAreas = (
  modelConfig: ModelConfig,
  options?: {
    overrideRow?: OverrideRowProp;
    rowsToDelete?: number[];
    rowsToAdd?: Record<number, string[]>;
    fieldsToExclude?: string[];
    seqModelFieldGroupID?: number;
  }
) => {
  const {
    overrideRow,
    rowsToDelete,
    rowsToAdd,
    seqModelFieldGroupID,
    fieldsToExclude,
  } = options || {};
  let rows: string[][] = [];
  const fields = getSortedFormikFormControlFields(modelConfig, {
    fieldsToExclude,
    seqModelFieldGroupID,
  });

  let row: string[] = [];
  for (let { columnsOccupied, fieldName } of fields) {
    for (let x = 0; x < columnsOccupied; x++) {
      row.push(fieldName);
      if (row.length === 12) {
        rows.push([...row]);
        row = [];
      }
    }
  }

  let lastRow = rows[rows.length - 1];
  if (lastRow.length < 12) {
    while (lastRow.length < 12) {
      lastRow.push(lastRow[lastRow.length - 1]);
    }
    rows[rows.length - 1] = lastRow;
  }
  const childModelsWithSimpleRelationship =
    getChildModelsWithSimpleRelationship(modelConfig);

  for (let { seqModelRelationshipID } of childModelsWithSimpleRelationship) {
    const leftModelConfig = findRelationshipModelConfig(
      seqModelRelationshipID,
      "LEFT"
    );
    const leftPluralizedModelName = leftModelConfig.pluralizedModelName;
    let row: string[] = new Array(12).fill(leftPluralizedModelName);
    rows.push(row);
  }

  const fieldGroups = seqModelFieldGroupID ? [] : modelConfig.fieldGroups;
  for (const fieldGroup of fieldGroups) {
    row = new Array(12).fill(slugify(fieldGroup.groupName));
    rows.push(row);
  }

  const childModels = seqModelFieldGroupID ? [] : getChildModels(modelConfig);
  for (let { seqModelRelationshipID } of childModels) {
    const leftModelConfig = findRelationshipModelConfig(
      seqModelRelationshipID,
      "LEFT"
    );
    const leftPluralizedModelName = leftModelConfig.pluralizedModelName;
    let row: string[] = new Array(12).fill(leftPluralizedModelName);
    rows.push(row);
  }

  const childModelsWithDropzone = seqModelFieldGroupID
    ? []
    : getChildModelsWithDropzone(modelConfig);
  for (let { seqModelRelationshipID } of childModelsWithDropzone) {
    const leftModelConfig = findRelationshipModelConfig(
      seqModelRelationshipID,
      "LEFT"
    );
    const leftPluralizedModelName = leftModelConfig.pluralizedModelName;
    let row: string[] = new Array(12).fill(leftPluralizedModelName + "Files");
    rows.push(row);
  }

  for (const key in overrideRow) {
    rows[+key] = overrideRow[+key];
  }

  if (rowsToDelete) {
    for (const idx of rowsToDelete) {
      rows = deleteItemByIndex(rows, idx);
    }
  }

  if (rowsToAdd) {
    for (const key of Object.keys(rowsToAdd)) {
      rows = addItemByIndex(
        rows,
        forceCastToNumber(key),
        rowsToAdd[forceCastToNumber(key) as keyof typeof rowsToAdd]
      );
    }
  }

  return `${rows.map((row) => `"${row.join(" ")}"`).join(" ")}`;
};

export function fillArray(count: number, value: string) {
  return Array(count).fill(value);
}
