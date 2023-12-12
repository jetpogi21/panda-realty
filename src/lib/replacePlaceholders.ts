import { getValueByPath } from "@/lib/getValueByPath";
type DataObject = Record<string, any>;

export function replacePlaceholders(input: string, data: DataObject): string {
  const placeholderRegex = /\{\{(.+?)\}\}/g;

  return input.replace(placeholderRegex, (_, placeholder) => {
    const propName = placeholder.trim();
    const propValue = getValueByPath(data, propName);

    if (typeof propValue === "object" && propValue !== null) {
      // Recursively replace placeholders in nested objects
      return replacePlaceholders(JSON.stringify(propValue), data);
    }

    // Return the original placeholder if propValue is undefined
    return propValue !== undefined ? propValue : `{{${propName}}}`;
  });
}
