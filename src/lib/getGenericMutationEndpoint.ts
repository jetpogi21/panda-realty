import { ModelConfig } from "@/interfaces/ModelConfig";
import { findConfigItem } from "@/utils/utilities";

export const getGenericMutationEndpoint = (
  modelConfig: ModelConfig,
  caption: string
) => {
  return `/${modelConfig.modelPath}/${findConfigItem(
    modelConfig.hooks,
    "caption",
    caption,
    "slug"
  )}/`;
};
