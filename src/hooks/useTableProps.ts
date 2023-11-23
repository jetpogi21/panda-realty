import { ModelConfig } from "@/interfaces/ModelConfig";
import { RowSelectionState } from "@tanstack/react-table";
import { useState } from "react";

export const useTableProps = <T>(modelConfig: ModelConfig) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const setRowSelectionByIndex = (idx: number) => {
    setRowSelection((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const resetRowSelection = () => setRowSelection({});
  const setRowSelectionToAll = (idx: number) => {
    const rowSelection: Record<number, boolean> = {};
    for (let index = 0; index < idx; index++) {
      rowSelection[index] = true;
    }
    setRowSelection(rowSelection);
  };

  const [sort, setSort] = useState<string>(modelConfig.sortString);

  const [recordsToDelete, setRecordsToDelete] = useState<string[]>([]);

  const [page, setPage] = useState(1);
  const [recordCount, setRecordCount] = useState(0);
  const [lastFetchedPage, setLastFetchedPage] = useState(1);
  const [fetchCount, setFetchCount] = useState(true);
  const [currentData, setCurrentData] = useState<T[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasUpdate, setHasUpdate] = useState(false);

  return {
    rowSelection,
    setRowSelection,
    setRowSelectionByIndex,
    resetRowSelection,
    setRowSelectionToAll,
    sort,
    setSort,
    recordsToDelete,
    setRecordsToDelete,
    page,
    setPage,
    recordCount,
    setRecordCount,
    fetchCount,
    setFetchCount,
    lastFetchedPage,
    setLastFetchedPage,
    currentData,
    setCurrentData,
    isUpdating,
    setIsUpdating,
    hasUpdate,
    setHasUpdate,
  };
};
