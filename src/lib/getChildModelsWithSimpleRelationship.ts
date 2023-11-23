import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";

export function getChildModelsWithSimpleRelationship(modelConfig: ModelConfig) {
  return AppConfig.relationships.filter(
    ({ rightModelID, isSimpleRelationship }) =>
      rightModelID === modelConfig.seqModelID && isSimpleRelationship
  );
}
