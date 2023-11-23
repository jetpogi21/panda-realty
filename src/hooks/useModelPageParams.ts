import { useURL } from "@/hooks/useURL";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { isValidSortField } from "@/utils/utilities";

export const useModelPageParams = <TSearchParams>(modelConfig: ModelConfig) => {
  const { query, pathname, router } = useURL<Record<string, string>>();

  const params: Record<string, string> = {};

  modelConfig.filters.forEach(({ filterQueryName, seqModelFieldID }) => {
    //get the type from the field
    const fieldType = modelConfig.fields.find(
      (item) => item.seqModelFieldID === seqModelFieldID
    )?.dataType;

    if (fieldType === "DATEONLY") {
      params[filterQueryName + "From"] = query[filterQueryName + "From"] || "";
      params[filterQueryName + "To"] = query[filterQueryName + "To"] || "";
      return;
    }

    params[filterQueryName] = query[filterQueryName] || "";
  });

  //check if sort is one of the sortable fields if not fallback to default sort
  let sort = query["sort"] || modelConfig.sortString;
  let sortField = sort.startsWith("-") ? sort.substring(1) : sort;

  if (!isValidSortField(sortField, modelConfig)) {
    sort = modelConfig.sortString;
  }

  params["sort"] = sort;

  //limit should prioritize model's limit then app's limit
  const limit = query["limit"] || modelConfig.limit || AppConfig.limit || 10;
  params["limit"] = limit.toString();

  return {
    query,
    pathname,
    router,
    params: params as TSearchParams & { sort: string; limit: number },
  };
};
