import { Button } from "@/components/ui/Button";
import { CellContext } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

export const DeleteRowColumn = <TData, TValue>(
  cell: CellContext<TData, unknown>
) => {
  const { row, table } = cell;

  //@ts-ignore
  const deleteRow = table.options.meta.deleteRow;
  const index = row.index;

  return (
    <Button
      tabIndex={-1}
      type="button"
      size="sm"
      variant={"ghost"}
      onClick={() => deleteRow && deleteRow(index)}
    >
      <Trash2 className="w-4 h-4" />
    </Button>
  );
};
