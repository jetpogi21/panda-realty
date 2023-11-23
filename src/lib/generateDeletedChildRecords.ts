import { ModelConfig } from "@/interfaces/ModelConfig";
import { getChildModels } from "@/lib/getChildModels";
import { findRelationshipModelConfig } from "@/utils/utilities";

export const generateDeletedChildRecords = <T, U>(
  modelConfig: ModelConfig,
  data: U,
  values: T
) => {
  const childModels = getChildModels(modelConfig, { formMode: true });
  const deletedChildModels: Record<string, number[] | string[]> = {};

  for (const relationship of childModels) {
    const leftModelConfig = findRelationshipModelConfig(
      relationship.seqModelRelationshipID,
      "LEFT"
    );
    const { pluralizedModelName } = leftModelConfig;
    const originalData =
      (data?.[pluralizedModelName as keyof U] as any[]) || ([] as any[]);
    const newData = values[pluralizedModelName as keyof T] as any[];

    const missingIds = originalData
      .filter((item) => !newData.some((newItem) => newItem.id == item.id))
      .map((item) => item.id);

    deletedChildModels[`deleted${pluralizedModelName}`] = missingIds;
  }

  return deletedChildModels;
};
