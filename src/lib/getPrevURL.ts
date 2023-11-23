import { ModelConfig } from "@/interfaces/ModelConfig";

/**
 * This function returns the previous URL based on the provided list URL, model configuration, and pathname.
 *
 * @param {string} listURL - The list URL to check.
 * @param {Object} modelConfig - The model configuration object.
 * @param {string} modelConfig.modelPath - The path of the model.
 * @param {string} pathname - The current pathname.
 * @returns {string} The previous URL if the list URL includes the model path and is not the same as the pathname, otherwise returns the model path.
 *
 * @example
 * const listURL = "/tasks/list";
 * const modelConfig = { modelPath: "tasks" };
 * const pathname = "/tasks/edit";
 * const prevURL = getPrevURL(listURL, modelConfig, pathname);
 */
export function getPrevURL(
  listURL: string,
  modelConfig: ModelConfig,
  pathname: string
): string {
  return listURL &&
    listURL.includes(`/${modelConfig.modelPath}`) &&
    listURL !== pathname
    ? listURL
    : `/${modelConfig.modelPath}`;
}
