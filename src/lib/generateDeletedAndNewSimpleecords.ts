import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { findRelationshipModelConfig } from "@/utils/utilities";
import { convertArrayItemsToStrings } from "@/utils/utils";

export const generateDeletedAndNewSimpleecords = (
  modelConfig: ModelConfig,
  originalSimpleModels: Record<string, unknown>,
  values: Record<string, unknown>
) => {
  const deletedAndNewSimpleRecords = {};

  AppConfig.relationships
    .filter(
      ({ rightModelID, isSimpleRelationship }) =>
        rightModelID === modelConfig.seqModelID && isSimpleRelationship
    )
    .map((relationship) => {
      const { pluralizedModelName: leftPluralizedModelName } =
        findRelationshipModelConfig(
          relationship.seqModelRelationshipID,
          "LEFT"
        );
      const { pluralizedModelName: throughPluralizedModelName } =
        findRelationshipModelConfig(
          relationship.seqModelRelationshipID,
          "TROUGH"
        );

      const originalRecords =
        originalSimpleModels[`${leftPluralizedModelName}`];

      //@ts-ignore
      deletedAndNewSimpleRecords[`deleted${leftPluralizedModelName}`] =
        //@ts-ignore
        originalRecords
          .filter(
            //@ts-ignore
            (item) =>
              !convertArrayItemsToStrings(
                //@ts-ignore
                values[leftPluralizedModelName]
                //@ts-ignore
              ).includes(item[relationship.fieldToBeInserted].toString())
          )
          //@ts-ignore
          .map((item) => item.id.toString());

      //@ts-ignore
      deletedAndNewSimpleRecords[`new${throughPluralizedModelName}`] =
        //@ts-ignore
        convertArrayItemsToStrings(values[leftPluralizedModelName]).filter(
          (item) =>
            //@ts-ignore
            !originalRecords
              //@ts-ignore
              .map((item) => item[relationship.fieldToBeInserted].toString())
              .includes(item)
        );
    });

  return deletedAndNewSimpleRecords;
};
