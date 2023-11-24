import { getLocalStorage } from "@/lib/getLocalStorage";

export function getListItemFromLocalStorage<T>(
  storageKey: string,
  listPrimaryKey: string,
  data: T,
  fieldName: keyof T
) {
  if (!data) return "";

  const relatedList = getLocalStorage(storageKey) as any[];

  const parentData = relatedList.find(
    (list) => list[listPrimaryKey] == data[fieldName]
  );

  return parentData;
}
