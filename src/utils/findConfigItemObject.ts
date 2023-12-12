export const findConfigItemObject = <T, K extends keyof T>(
  configField: T[],
  key: K,
  valueToMatch: T[K]
): T => {
  return configField.find((fld) => fld[key] === valueToMatch)!;
};
