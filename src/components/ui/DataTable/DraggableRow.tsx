import { Button } from "@/components/ui/Button";
import { TableCell, TableRow } from "@/components/ui/Table";
import { cn } from "@/lib/utils";
import { Row, flexRender } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";

interface DraggableRowProps<T> {
  row: Row<T>;
  reorderRow: (draggedRowIndex: number, targetRowIndex: number) => void;
}

export const useDragAndDrop = <T,>(props: DraggableRowProps<T>) => {
  const { row, reorderRow } = props;
  const [, dropRef] = useDrop({
    accept: "row",
    drop: (draggedRow: Row<T>) => reorderRow(draggedRow.index, row.index),
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => row,
    type: "row",
  });

  return {
    dropRef,
    isDragging,
    dragRef,
    previewRef,
  };
};

const DraggableRow = <T,>(props: DraggableRowProps<T>) => {
  const { row, reorderRow } = props;
  const [, dropRef] = useDrop({
    accept: "row",
    drop: (draggedRow: Row<T>) => reorderRow(draggedRow.index, row.index),
  });

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => row,
    type: "row",
  });

  return (
    <TableRow
      key={row.id}
      ref={previewRef} //previewRef could go here
      style={{ opacity: isDragging ? 0.5 : 1 }}
      data-state={row.getIsSelected() && "selected"}
    >
      <TableCell ref={dropRef}>
        <Button
          ref={dragRef}
          className={"bg-transparent hover:bg-accent p-2 h-auto"}
        >
          <ArrowUpDown className="w-3 h-3 text-slate-500 dark:text-white" />
        </Button>
      </TableCell>
      {row.getVisibleCells().map((cell) => (
        <TableCell
          key={cell.id}
          className={cn(
            ["select", "actions"].includes(cell.column.columnDef.id!) && "p-0"
          )}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
};

export { DraggableRow };
