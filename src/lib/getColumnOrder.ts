import { ModelConfig } from "@/interfaces/ModelConfig";

export function getColumnOrder(
  modelConfig: ModelConfig,
  columnOrderToOverride?: [string, number][],
  columnsToBeOverriden?: Record<string, unknown>,
  hasSingleColumn?: boolean
) {
  const fieldColumns: string[] = modelConfig.fields
    .filter(({ hideInTable }) => !hideInTable)
    .sort(({ fieldOrder: sortA }, { fieldOrder: sortB }) => sortA - sortB)
    .map(({ fieldName }) => fieldName);

  let createdCustomColumnKeys = columnsToBeOverriden
    ? Object.keys(columnsToBeOverriden).filter(
        (key) => !modelConfig.fields.some((field) => field.fieldName === key)
      )
    : [];

  if (hasSingleColumn) {
    createdCustomColumnKeys = ["singleColumn", ...createdCustomColumnKeys];
  }

  const baseColumnOrder = [
    "select",
    ...fieldColumns,
    ...createdCustomColumnKeys,
    "actions",
  ];

  if (!columnOrderToOverride) {
    return baseColumnOrder;
  }

  const overrideMap = new Map(columnOrderToOverride);

  return baseColumnOrder.reduce((order, fieldName, index) => {
    const overrideIndex = overrideMap.get(fieldName);
    if (overrideIndex !== undefined) {
      order.splice(overrideIndex, 0, fieldName);
    } else {
      order.push(fieldName);
    }
    return order;
  }, [] as string[]);
}
