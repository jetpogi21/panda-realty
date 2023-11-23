import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";

export function getFirstAndLastFieldInForm(
  fields: ModelConfig["fields"],
  relationship?: (typeof AppConfig)["relationships"][number]
): [string, string, string[]] {
  const visibleFields = fields
    .filter((field) => {
      if (relationship) {
        return (
          field.databaseFieldName !== relationship.leftForeignKey &&
          !field.hideInTable
        );
      } else {
        return !field.hideInTable;
      }
    })
    .sort((a, b) => a.fieldOrder - b.fieldOrder);

  const firstFieldInForm = visibleFields[0]?.fieldName || "";
  const lastFieldInForm =
    visibleFields[visibleFields.length - 1]?.fieldName || "";

  return [
    firstFieldInForm,
    lastFieldInForm,
    visibleFields.map((field) => field.fieldName),
  ];
}
