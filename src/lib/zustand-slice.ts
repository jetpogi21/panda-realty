import { GetModelsResponse } from "@/interfaces/GeneralInterfaces";
import { UseInfiniteQueryResult } from "@tanstack/react-query";
import { RowSelectionState } from "@tanstack/react-table";

type State<T> = {
  queryResponse?: () => UseInfiniteQueryResult<GetModelsResponse<T>, unknown>;
  recordCount: number;
  page: number;
  lastFetchedPage: number;
  fetchCount: boolean;
  rowSelection: RowSelectionState;
  currentData: T[];
  isUpdating: boolean;
  sort: string;
  hasUpdate: boolean;
  deletedRows: string[] | number[];
  isLoading: boolean;
  isFetching: boolean;
  refetchQuery?: (idx: number) => void;
};

type Actions<T> = {
  setRecordCount: (recordCount: number) => void;
  setPage: (page: number) => void;
  setLastFetchedPage: (lastFetchedPage: number) => void;
  setFetchCount: (fetchCount: boolean) => void;
  setRowSelection: (idx: number) => void;
  resetRowSelection: () => void;
  setRowSelectionToAll: (idx: number) => void;
  setCurrentData: (item: T[]) => void;
  setIsUpdating: (isUpdating: boolean) => void;
  setSort: (sort: string) => void;
  setHasUpdate: (hasUpdate: boolean) => void;
  setQueryResponse: (queryResponse: State<T>["queryResponse"]) => void;
  setRefetchQuery: (refetchQuery: State<T>["refetchQuery"]) => void;
};

export type Slice<T> = State<T> & Actions<T>;
type SetState<T> = (state: Partial<Slice<T>>) => void;

export const modelSlice = <T>(set: SetState<T>, sort: string): Slice<T> => ({
  recordCount: 0,
  page: 1,
  lastFetchedPage: 1,
  fetchCount: true,
  rowSelection: {},
  deletedRows: [],
  currentData: [],
  isLoading: false,
  isFetching: false,
  isUpdating: false,
  hasUpdate: false,
  setRecordCount: (recordCount) => set({ recordCount }),
  setPage: (page) => set({ page }),
  setLastFetchedPage: (lastFetchedPage) => set({ lastFetchedPage }),
  setFetchCount: (fetchCount) => set({ fetchCount }),
  setRowSelection: (idx: number) =>
    //@ts-ignore
    set((state) => ({
      rowSelection: {
        ...state.rowSelection,
        [idx]: !state.rowSelection[idx],
      },
    })),
  resetRowSelection: () => set({ rowSelection: {} }),
  setRowSelectionToAll: (idx: number) => {
    const rowSelection: Record<number, boolean> = {};
    for (let index = 0; index < idx; index++) {
      rowSelection[index] = true;
    }
    return set({ rowSelection });
  },
  setCurrentData: (item) => set({ currentData: [...item] }),
  setIsUpdating: (isUpdating: boolean) => set({ isUpdating }),
  sort: sort,
  setSort: (sort) => set({ sort }),
  setHasUpdate: (hasUpdate) => set({ hasUpdate: hasUpdate }),
  setQueryResponse(queryResponse) {
    return set({ queryResponse });
  },
  setRefetchQuery: (refetchQuery) => set({ refetchQuery: refetchQuery }),
});
