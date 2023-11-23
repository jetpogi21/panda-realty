import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";

interface GetChilModelsOptions {
  formMode?: boolean;
}

export function getChildModels(
  modelConfig: ModelConfig,
  options?: GetChilModelsOptions
) {
  return AppConfig.relationships.filter(
    ({ rightModelID, isSimpleRelationship, excludeInForm }) =>
      rightModelID === modelConfig.seqModelID &&
      !isSimpleRelationship &&
      (options?.formMode ? !excludeInForm : true)
  );
}
