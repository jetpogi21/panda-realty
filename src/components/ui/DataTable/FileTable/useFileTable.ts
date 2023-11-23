import { FileColumns } from "@/components/ui/DataTable/FileTable/FileColumns";
import { FileState } from "@/interfaces/GeneralInterfaces";
import { getSorting } from "@/utils/utilities";
import {
  RowSelectionState,
  SortingState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";

interface UseFileTableProps {
  files: FileState[];
}

export const useFileTable = ({ files }: UseFileTableProps) => {
  //local states
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const handleRowSelection = (idx: number) => {
    setRowSelection({
      ...rowSelection,
      [idx]: !rowSelection[idx],
    });
  };

  const resetRowSelection = () => setRowSelection({});

  const setRowSelectionToAll = (count: number) => {
    const rowSelection: Record<number, boolean> = {};
    for (let index = 0; index < count; index++) {
      rowSelection[index] = true;
    }
    return setRowSelection(rowSelection);
  };

  const toggleSelectAllRow = () => {
    if (Object.keys(rowSelection).length === files.length) {
      resetRowSelection();
    } else {
      setRowSelectionToAll(files.length);
    }
  };

  const toggleRow = (idx: number) => handleRowSelection(idx);

  const sorting: SortingState = getSorting("file");

  const fileTable = useReactTable<FileState>({
    data: files,
    columns: FileColumns,
    state: {
      sorting: sorting,
      rowSelection,
    },
    //@ts-ignore
    onRowSelectionChange: (state) => handleRowSelection(state()),
    //@ts-ignore
    onSortingChange: (state) => handleSortChange(state()), //since the sort state is getting tracked from the url do handle instead
    getCoreRowModel: getCoreRowModel(),
    enableMultiRowSelection: true,
    meta: {
      toggleRow,
      toggleSelectAllRow,
    },
  });

  return {
    fileTable,
  };
};
