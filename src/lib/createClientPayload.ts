import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { findRelationshipModelConfig } from "@/utils/utilities";

export const createClientPayload = <T extends Record<string, unknown>>(
  values: T,
  modelConfig: ModelConfig,
  deletedAndNewSimpleRecords: Record<string, unknown>,
  deletedChildRecords: Record<string, number[] | string[]>
) => {
  const payload = {
    ...values,
    ...AppConfig.relationships
      .filter(
        ({ rightModelID, isSimpleRelationship }) =>
          rightModelID === modelConfig.seqModelID && !isSimpleRelationship
      )
      .reduce((prev, { seqModelRelationshipID }) => {
        const {
          pluralizedModelName: leftPluralizedModelName,
          disableAPIDelete,
        } = findRelationshipModelConfig(seqModelRelationshipID, "LEFT");
        return {
          ...prev,
          //@ts-ignore
          [leftPluralizedModelName]: values[leftPluralizedModelName]
            //@ts-ignore
            .map((item, index) => ({
              ...item,
              index,
              //@ts-ignore
            }))
            //@ts-ignore
            .filter((item) => (disableAPIDelete ? true : item.touched)),
        };
      }, {}),
    ...deletedAndNewSimpleRecords,
    ...deletedChildRecords,
  };

  return payload;
};
