import { ModelDeleteDialog } from "@/components/ModelDeleteDialog";
import { ModelRowActions } from "@/components/ModelRowActions";
import { Button, buttonVariants } from "@/components/ui/Button";
import { DataTable, DialogFormProps } from "@/components/ui/DataTable";
import useGlobalDialog from "@/hooks/useGlobalDialog";
import { useModelPageParams } from "@/hooks/useModelPageParams";
import useScreenSize from "@/hooks/useScreenSize";
import { useTableProps } from "@/hooks/useTableProps";
import {
  ArrayOfUnknownObject,
  BasicModel,
  GetModelsResponse,
  PrimaryKey,
  UnknownObject,
} from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { generateActionButtons } from "@/lib/generateActionButtons";
import { getColumnOrder } from "@/lib/getColumnOrder";
import { getFirstAndLastFieldInForm } from "@/lib/getFirstAndLastFieldInForm";
import { getModelColumns } from "@/lib/getModelColumns";
import { removeRequiredListFromLocalStorage } from "@/lib/removeRequiredListFromLocalStorage";
import { ColumnsToBeOverriden } from "@/lib/table-utils";
import { cn } from "@/lib/utils";
import {
  findModelPrimaryKeyField,
  forceCastToNumber,
  getSorting,
} from "@/utils/utilities";
import { encodeParams, removeItemsByIndexes } from "@/utils/utils";
import {
  InfiniteData,
  UseInfiniteQueryResult,
  UseMutationResult,
} from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  SortingState,
  CellContext,
  Row,
} from "@tanstack/react-table";
import { Form, FormikProps } from "formik";
import { ChevronLast, Plus, Trash } from "lucide-react";
import Link from "next/link";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";

type CustomUseMutationResult<T> = UseMutationResult<
  {
    data: T;
  },
  unknown,
  void,
  unknown
>;

interface ModelActions<T> {
  [key: string]: CustomUseMutationResult<T>;
}

interface ModelDataTableProps<T, U, V> {
  modelConfig: ModelConfig;
  tableStates: ReturnType<typeof useTableProps<T>>;
  refetchQuery: (idx: number) => void;
  queryResponse: UseInfiniteQueryResult<
    InfiniteData<GetModelsResponse<T>, unknown>,
    unknown
  >;
  pageParams: ReturnType<typeof useModelPageParams<U>>;
  SingleColumnComponent?: React.FC<{ cell: CellContext<T, unknown> }>;
  rowActions?: ModelRowActions;
  modelActions?: ModelActions<V>;
  requiredList?: Record<string, BasicModel[]>;
  defaultFormValue?: T;
  formik?: FormikProps<T>;
  columnsToBeOverriden?: ColumnsToBeOverriden<T, unknown>;
  dialogFormProps?: DialogFormProps<T>;
  columnOrderToOverride?: [string, number][];
}

const TableWrapper = ({
  children,
  modelConfig,
}: {
  children: ReactNode;
  modelConfig: ModelConfig;
}) => {
  if (modelConfig.isTable) {
    return <div className="flex flex-col flex-1 gap-4">{children}</div>;
  } else {
    return (
      <Form
        className="flex flex-col flex-1 gap-4"
        autoComplete="off"
        noValidate
      >
        {children}
      </Form>
    );
  }
};

const ModelDataTable = <T, U, V>({
  modelConfig,
  tableStates,
  refetchQuery,
  queryResponse,
  pageParams,
  SingleColumnComponent,
  rowActions,
  modelActions,
  requiredList,
  defaultFormValue,
  formik,
  columnsToBeOverriden,
  dialogFormProps,
  columnOrderToOverride,
}: ModelDataTableProps<T, U, V>) => {
  const { query, pathname, router, params } = pageParams;
  const { sort, limit } = params;

  const primaryKeyFieldName = findModelPrimaryKeyField(modelConfig).fieldName;
  const { pluralizedModelName } = modelConfig;

  const isLarge = useScreenSize("lg");

  //Zustand states
  const {
    resetRowSelection,
    rowSelection,
    setRowSelection,
    setRowSelectionToAll,
    setRowSelectionByIndex,
    page,
    recordCount,
    setRecordCount,
    setPage,
    lastFetchedPage,
    currentData,
    setCurrentData,
    setLastFetchedPage,
    isUpdating,
  } = tableStates;

  const inferredCurrentData = currentData as ArrayOfUnknownObject;

  const { closeDialog, openDialog } = useGlobalDialog((state) => ({
    closeDialog: state.closeDialog,
    openDialog: state.openDialog,
  }));

  const [recordsToDelete, setRecordsToDelete] = useState<string[]>([]);
  const [willFocus, setWillFocus] = useState(false);
  const ref: React.RefObject<HTMLElement> = useRef(null); //to be attached to the last row in form, first control in that row

  //Page Constants

  //Tanstacks
  const { data, isLoading, isFetching, fetchNextPage } = queryResponse;

  //Transformations
  const sorting = getSorting(sort);
  const hasSelected = Object.values(rowSelection).some((val) => val);
  const dataRowCount = data
    ? //@ts-ignore
      currentData.filter((item) => item[primaryKeyFieldName]).length +
      (page - 1) * forceCastToNumber(limit)
    : 0;
  const pageStatus = `Showing ${dataRowCount} of ${recordCount} record(s)`;
  const hasPreviousPage = page > 1;
  const hasNextPage = dataRowCount < recordCount;
  const indexes = Object.keys(rowSelection)
    .filter((key) => rowSelection[key])
    .map((item) => parseInt(item));
  const rows = formik
    ? ((formik.values as UnknownObject)[
        pluralizedModelName
      ] as ArrayOfUnknownObject)
    : [];

  //Utility Functions

  //Client Actions
  const focusOnRef = () => {
    ref && ref.current?.focus();
  };

  const addRow = () => {
    const newRowValue: Record<string, unknown> = {
      ...defaultFormValue,
      touched: false,
      index: rows.length,
    };

    formik!.setFieldValue(pluralizedModelName, [...rows, newRowValue]);
    setWillFocus(true);
  };

  const setTouchedRows = (idx: number) => {
    formik!.setFieldValue(`${pluralizedModelName}[${idx}].touched`, true);
  };

  const deleteRow = (idx: number) => {
    const id = formik
      ? (rows[idx][primaryKeyFieldName] as PrimaryKey)
      : (inferredCurrentData[idx][primaryKeyFieldName] as PrimaryKey);

    if (id) {
      setRecordsToDelete([id.toString()]);
    } else {
      formik!.setFieldValue(pluralizedModelName, [
        ...rows.slice(0, idx),
        ...rows.slice(idx + 1),
      ]);
      formik!.setErrors({});
      resetRowSelection();
    }
  };

  const deleteSelectedRows = () => {
    //Compute the Ids to be deleted. the index should be the selected indexes. then see if the rows has an actual id value
    const deletedIDs = inferredCurrentData
      .filter(
        (item, idx) =>
          indexes.includes(idx) && !!(item[primaryKeyFieldName] as PrimaryKey)
      )
      .map((item) => item[primaryKeyFieldName]!.toString());

    if (deletedIDs.length > 0) {
      setRecordsToDelete(deletedIDs);
    } else {
      formik!.setFieldValue(
        pluralizedModelName,
        removeItemsByIndexes(rows, indexes)
      );
      formik!.setErrors({});
      resetRowSelection();
    }
  };

  //
  const toggleRow = (idx: number) => setRowSelectionByIndex(idx);
  const toggleSelectAllRow = () => {
    if (Object.keys(rowSelection).length === currentData.length) {
      resetRowSelection();
    } else {
      setRowSelectionToAll(currentData.length);
    }
  };

  const goToPreviousPage = () => {
    if (data) {
      const newPage = page - 1;
      setPage(newPage);
      resetRowSelection();
    }
  };

  const goToNextPage = () => {
    if (data) {
      const newPage = page + 1;

      if (newPage > lastFetchedPage) {
        fetchNextPage();
        setLastFetchedPage(newPage);
      }

      setPage(newPage);
      resetRowSelection();
    }
  };

  const handleSortChange = (sortingState: SortingState) => {
    const sortParams = sortingState
      .map((item) => {
        if (item.desc) {
          return `-${item.id}`;
        } else {
          return `${item.id}`;
        }
      })
      .join(",");

    setPage(1);
    setLastFetchedPage(1);
    resetRowSelection();
    const params = { ...query, sort: sortParams };
    const newURL = `${pathname}?${encodeParams(params)}`;
    router.push(newURL);
  };

  const handleRowClick =
    modelConfig.fields.length === 2
      ? undefined
      : isLarge || modelConfig.isTable
      ? (row: T) => {
          const hasSlugField = !!modelConfig.slugField;
          let parameter = hasSlugField
            ? row["slug" as keyof typeof row]
            : row[primaryKeyFieldName as keyof typeof row];
          //@ts-ignore
          parameter = parameter || "new";

          const url = `${pathname}/${parameter}`;
          router.push(url);
        }
      : undefined;

  const columnVisibility: Record<string, boolean> = modelConfig.fields.reduce(
    (acc: Record<string, boolean>, field) => {
      if (modelConfig.singleColumnOnly) {
        acc[field.fieldName] = false;
      } else if (field.hideInTable) {
        acc[field.fieldName] = false;
      } else {
        acc[field.fieldName] = !SingleColumnComponent ? !isLarge : true;
      }
      return acc;
    },
    { singleColumn: isLarge }
  );

  const columnOrder: string[] = getColumnOrder(
    modelConfig,
    columnOrderToOverride,
    columnsToBeOverriden,
    Boolean(SingleColumnComponent)
  );

  const [firstFieldInForm, lastFieldInForm, visibleFields] =
    getFirstAndLastFieldInForm(modelConfig.fields);

  const modelColumns = useMemo(
    () =>
      getModelColumns<T, unknown>({
        modelConfig,
        ModelSingleColumn: SingleColumnComponent,
        columnsToBeOverriden,
      }),
    [modelConfig]
  );

  const modelTable = useReactTable<T>({
    data: (formik ? rows : currentData) as T[],
    columns: modelColumns,
    state: {
      sorting: sorting,
      rowSelection,
    },
    //@ts-ignore
    onRowSelectionChange: (state) => setRowSelection(state()),
    //@ts-ignore
    onSortingChange: (state) => handleSortChange(state()), //since the sort state is getting tracked from the url do handle instead
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    enableMultiRowSelection: true,
    initialState: {
      columnVisibility,
      columnOrder,
    },
    meta: {
      name: modelConfig.pluralizedModelName,
      setTouchedRows,
      addRow,
      deleteRow,
      toggleRow,
      toggleSelectAllRow,
      firstFieldInForm: firstFieldInForm,
      lastFieldInForm: lastFieldInForm,
      visibleFields,
      forwardedRef: ref,
      editable: !modelConfig.isTable,
      rowActions,
      openDialogHandler: dialogFormProps?.openDialogHandler,
      options: requiredList,
    },
  });

  useEffect(() => {
    if (willFocus) {
      focusOnRef();
    }
  }, [rows]);

  useEffect(() => {
    modelTable.getAllColumns().forEach((column) => {
      if (
        ![
          "select",
          "actions",
          ...modelConfig.fields
            .filter((item) => item.hideInTable)
            .map((item) => item.fieldName),
        ].includes(column.id)
      ) {
        if (column.id === "singleColumn") {
          if (modelConfig.singleColumnOnly) {
            column.toggleVisibility(true);
          } else if (SingleColumnComponent) {
            column.toggleVisibility(isLarge);
          } else {
            column.toggleVisibility(false);
          }
        } else {
          if (modelConfig.singleColumnOnly) {
            column.toggleVisibility(false);
          } else {
            column.toggleVisibility(
              !Boolean(SingleColumnComponent) || !isLarge
            );
          }
        }
      }
    });
  }, [isLarge]);

  return (
    <>
      <TableWrapper modelConfig={modelConfig}>
        <div className="flex flex-col-reverse items-start gap-4 lg:flex-row lg:items-center">
          <div className="w-full text-sm">
            {modelTable.getFilteredSelectedRowModel().rows.length} of{" "}
            {modelTable.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div
            className={cn(
              "flex gap-4 items-center",
              isLarge && "fixed",
              hasSelected &&
                "fixed left-0 right-0 m-auto bottom-6 border-2 border-border w-[90%] bg-background p-4 z-10 rounded-lg shadow-sm"
            )}
          >
            {hasSelected && (
              <div className="flex gap-4">
                <Button
                  type="button"
                  size={"sm"}
                  variant={"destructive"}
                  onClick={deleteSelectedRows}
                  className="flex items-center justify-center gap-2"
                >
                  Delete Selected
                  <Trash className="w-4 h-4 text-foreground" />
                </Button>
                {generateActionButtons(
                  rowActions,
                  indexes,
                  openDialog,
                  closeDialog,
                  resetRowSelection
                )}
              </div>
            )}
          </div>
          <div className="flex items-end w-full space-x-4">
            {!modelConfig.isTable && (
              <Button
                className="ml-auto"
                variant={"secondary"}
                type="button"
                size="sm"
                onClick={focusOnRef}
              >
                <ChevronLast className="w-4 h-4 text-foreground" /> Go to last
                row
              </Button>
            )}
            {dialogFormProps ? (
              <Button
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "ml-auto"
                )}
                onClick={() => dialogFormProps.openDialogHandler()}
              >
                Add New
              </Button>
            ) : (
              <Link
                className={cn(
                  buttonVariants({ variant: "secondary", size: "sm" }),
                  "ml-auto"
                )}
                href={`/${modelConfig.modelPath}/new`}
              >
                Add New
              </Link>
            )}

            {modelActions
              ? Object.keys(modelActions).map((key) => {
                  const mutation = modelActions[key];
                  return (
                    <Button
                      key={key}
                      isLoading={mutation.isPending}
                      variant={"secondary"}
                      size="sm"
                      onClick={() => {
                        mutation.mutate();
                      }}
                    >
                      {key}
                    </Button>
                  );
                })
              : null}
          </div>
        </div>

        <div className="w-full overflow-x-auto border rounded-md">
          <DataTable
            modelConfig={modelConfig}
            table={modelTable}
            isLoading={isLoading}
            isFetching={isFetching}
            dialogFormProps={dialogFormProps}
            onRowClick={handleRowClick}
          />
        </div>
        <div className="flex items-center justify-between mt-auto text-sm select-none text-muted-foreground">
          {!isLoading && (
            <div className="flex flex-col items-start justify-between w-full gap-4 lg:items-center lg:flex-row">
              <p>{pageStatus}</p>
              <div className="flex flex-col w-full gap-2 md:w-auto md:self-end md:flex-row">
                {!modelConfig.isTable && (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant={"secondary"}
                      onClick={addRow}
                      isLoading={isUpdating}
                    >
                      <Plus className="w-4 h-4 mr-1 text-foreground" />
                      Add Row
                    </Button>
                    <Button
                      type="button"
                      size={"sm"}
                      isLoading={isUpdating}
                      variant={"secondary"}
                      onClick={() => formik!.submitForm()}
                    >
                      Save Changes
                    </Button>
                  </>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant={"secondary"}
                  disabled={!hasPreviousPage}
                  onClick={() => goToPreviousPage()}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={"secondary"}
                  disabled={!hasNextPage || isFetching}
                  onClick={() => goToNextPage()}
                  isLoading={isFetching}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </TableWrapper>
      <ModelDeleteDialog
        modelConfig={modelConfig}
        recordsToDelete={recordsToDelete}
        setRecordsToDelete={setRecordsToDelete}
        onSuccess={() => {
          setRecordsToDelete([]);
          setRecordCount(
            recordCount -
              inferredCurrentData.filter((item) =>
                recordsToDelete.includes(
                  (item[primaryKeyFieldName] as PrimaryKey)!.toString()
                )
              ).length
          );
          removeRequiredListFromLocalStorage(modelConfig.modelPath);
          resetRowSelection();
          refetchQuery(page - 1);
        }}
      />
    </>
  );
};

export default ModelDataTable;
