import { ModelConfig } from "@/interfaces/ModelConfig";

export interface GetSortedFormikFormControlFieldsOptions {
  seqModelFieldGroupID?: number | null;
  fieldsToExclude?: string[];
}

export const getSortedFormikFormControlFields = (
  modelConfig: ModelConfig,
  options?: GetSortedFormikFormControlFieldsOptions
) => {
  const seqModelFieldGroupID = options?.seqModelFieldGroupID;
  const fieldsToExclude = options?.fieldsToExclude;
  return modelConfig.fields
    .filter((field) =>
      seqModelFieldGroupID
        ? field.seqModelFieldGroupID === seqModelFieldGroupID
        : field.seqModelFieldGroupID === null
    )
    .filter((field) =>
      fieldsToExclude ? !fieldsToExclude.includes(field.fieldName) : true
    )
    .filter(({ controlType }) => controlType !== "Hidden")
    .sort((a, b) => a.fieldOrder - b.fieldOrder);
};
