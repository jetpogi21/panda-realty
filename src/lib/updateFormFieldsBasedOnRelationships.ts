import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { sortRows } from "@/lib/sortRows";
import {
  findRelationshipModelConfig,
  findModelPrimaryKeyField,
} from "@/utils/utilities";
import { FormikHelpers } from "formik";

export const updateFormFieldsBasedOnRelationships = <T>(
  modelConfig: ModelConfig,
  formik: FormikHelpers<T>,
  values: Record<string, unknown>,
  data: Record<string, unknown>
) => {
  //Look at each child from the return value (data) and replace any additional ids from that data
  //the returned rows should have index so that it will be matched.
  AppConfig.relationships
    .filter(
      ({ rightModelID, isSimpleRelationship }) =>
        rightModelID === modelConfig.seqModelID && !isSimpleRelationship
    )
    .forEach((relationship) => {
      const leftModelConfig = findRelationshipModelConfig(
        relationship.seqModelRelationshipID,
        "LEFT"
      );

      const leftPluralizedModelName = leftModelConfig.pluralizedModelName;
      const leftPrimaryKeyFieldName =
        findModelPrimaryKeyField(leftModelConfig).fieldName;

      //@ts-ignore
      const childValues = values[leftPluralizedModelName] as Record<
        string,
        unknown
      >[];
      const newChildRecords = childValues
        .map((item, index) => ({
          ...item,
          [leftPrimaryKeyFieldName]:
            //@ts-ignore
            data[leftPluralizedModelName].find(
              //@ts-ignore
              (item) => item.index === index
            )?.[leftPrimaryKeyFieldName] || item[leftPrimaryKeyFieldName],
        }))
        .sort((a, b) => {
          //TO DO - use the actual sorting of this
          const sort = leftModelConfig.sortString;
          const desc = sort.includes("-");
          const field = desc ? sort.substring(1) : sort;

          return sortRows(a, b, desc, field, leftModelConfig);
        });
      formik.setFieldValue(leftPluralizedModelName, newChildRecords);
    });
};
