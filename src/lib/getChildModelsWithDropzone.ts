import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";

export function getChildModelsWithDropzone(modelConfig: ModelConfig) {
  return AppConfig.relationships.filter(
    ({ rightModelID, includeAsDropzone }) =>
      rightModelID === modelConfig.seqModelID && includeAsDropzone
  );
}
