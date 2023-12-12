type DataObject = Record<string, any>;

export function getValueByPath(obj: DataObject, path: string): any {
  return path.split(".").reduce((acc, key) => {
    if (typeof acc === "object" && acc !== null && key in acc) {
      return acc[key];
    }
    return undefined;
  }, obj);
}
