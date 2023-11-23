import { ModelConfig } from "@/interfaces/ModelConfig";
import { sortRows } from "@/lib/sortRows";

export function sortFunction(
  sortParams: string,
  modelConfig: ModelConfig
):
  | ((a: Record<string, unknown>, b: Record<string, unknown>) => number)
  | undefined {
  return (a, b) => {
    const desc = sortParams.includes("-");
    const field = desc ? sortParams.substring(1) : sortParams;

    return sortRows(a, b, desc, field, modelConfig);
  };
}
