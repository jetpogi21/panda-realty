import { ModelConfig } from "@/interfaces/ModelConfig";

export const getRefetchQueryFunction = (
  modelConfig: ModelConfig,
  params: any,
  refetch: any,
  queryClient: any
) => {
  return (idx: number) => {
    queryClient.setQueryData(
      [modelConfig.modelPath, { ...params }],
      (data: any) => {
        return data
          ? {
              pages: data.pages.slice(0, idx + 1),
              pageParams: data.pageParams.slice(0, idx + 1),
            }
          : undefined;
      }
    );
    refetch({
      //@ts-ignore
      refetchPage(_, index) {
        return index === idx;
      },
    });
  };
};
