import { useFileTable } from "@/components/ui/DataTable/FileTable/useFileTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { FileState } from "@/interfaces/GeneralInterfaces";
import { cn } from "@/lib/utils";
import { flexRender } from "@tanstack/react-table";

interface FileTableProps {
  files: FileState[];
  ModelColumns: any;
}

export const FileTable = ({ files, ModelColumns }: FileTableProps) => {
  const { fileTable } = useFileTable({
    files,
  });

  return (
    <Table>
      <TableHeader>
        {fileTable.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              //@ts-ignore
              const customWidth = header.column.columnDef.meta?.width;
              return (
                <TableHead
                  key={header.id}
                  className={cn(
                    {
                      "w-[50px]": ["select", "actions"].includes(header.id),
                    },
                    "p-2"
                  )}
                  style={{
                    width: `${customWidth}px`,
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {fileTable.getRowModel().rows?.length ? (
          fileTable.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="p-2"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={ModelColumns.length}
              className="h-24 text-center"
            >
              {"No results."}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
