import { GetModelsResponse } from "@/interfaces/GeneralInterfaces";

export const getCurrentData = <T>(
  currentPageData: GetModelsResponse<T> | null,
  previousData: T[],
  defaultFormValue?: any
): T[] => {
  let currentData: T[] = [];

  if (currentPageData === null) {
    currentData = previousData;
  } else if (defaultFormValue) {
    currentData =
      currentPageData?.rows.map((item, index) => ({
        ...item,
        touched: false,
        index,
      })) || [];
  } else {
    //@ts-ignore
    currentData = currentPageData?.rows || [];
  }

  if (defaultFormValue) {
    currentData.push({
      ...defaultFormValue,
      touched: false,
      index: currentData.length,
    });
  }

  return currentData;
};
