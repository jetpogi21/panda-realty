"use client";
import { Button, buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  findLeftForeignKeyField,
  findModelPrimaryKeyField,
  findRelationshipModelConfig,
  getSorting,
  replaceHighestOrder,
} from "@/utils/utilities";
import { removeItemsByIndexes } from "@/utils/utils";
import {
  useReactTable,
  getCoreRowModel,
  SortingState,
  Row,
} from "@tanstack/react-table";
import { FormikProps } from "formik";
import { ChevronLast, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Decimal from "decimal.js";
import {
  BasicModel,
  ModelSingleColumnProps,
} from "@/interfaces/GeneralInterfaces";
import { createRequiredModelLists } from "@/lib/createRequiredModelLists";
import { AppConfig } from "@/lib/app-config";
import { getModelColumns } from "@/lib/getModelColumns";
import { getInitialValues } from "@/lib/getInitialValues";
import { ModelDeleteDialog } from "@/components/ModelDeleteDialog";
import { DataTable } from "@/components/ui/DataTable";
import { useTableProps } from "@/hooks/useTableProps";
import { sortFunction } from "@/lib/sortFunction";
import { getFirstAndLastFieldInForm } from "@/lib/getFirstAndLastFieldInForm";
import { getColumnOrder } from "@/lib/getColumnOrder";
import { ColumnsToBeOverriden } from "@/lib/table-utils";
import useScreenSize from "@/hooks/useScreenSize";
import { getModelForms, getModelSingleColumns } from "@/lib/getModelOptions";
import useGlobalDialog from "@/hooks/useGlobalDialog";
import { getRowIndentifier } from "@/lib/getRowIndentifier";
import { useSessionStorage } from "usehooks-ts";
import { getSessionStorage } from "@/lib/getSessionStorage";
import { AllCellOptions } from "@/types/tanstack-table";
import { removeRequiredListFromLocalStorage } from "@/lib/removeRequiredListFromLocalStorage";
import { replaceItemByIndex } from "@/lib/replaceItemByIndex";

interface ModelSubformProps<T> {
  formik: FormikProps<T>;
  setHasUpdate: () => void;
  relationshipConfig: (typeof AppConfig)["relationships"][number];
  filterFunction?: Record<string, (item: Record<string, unknown>) => boolean>;
  columnOrderToOverride?: [string, number][];
  columnsToBeOverriden?: ColumnsToBeOverriden<T, unknown>;
  option?: AllCellOptions;
}

type ArrayOfObject = Record<string, unknown>[];

const ModelSubform = <T,>({
  formik,
  setHasUpdate,
  relationshipConfig,
  filterFunction,
  columnOrderToOverride,
  columnsToBeOverriden,
  option,
}: ModelSubformProps<T>) => {
  const [willFocus, setWillFocus] = useState(false);
  const ref: React.RefObject<HTMLElement> = useRef(null); //to be attached to the last row in form, first control in that row

  const modelConfig = findRelationshipModelConfig(
    relationshipConfig.seqModelRelationshipID,
    "LEFT"
  );
  const primaryKeyField = findModelPrimaryKeyField(modelConfig).fieldName;
  const leftFieldName = findLeftForeignKeyField(
    relationshipConfig.seqModelRelationshipID
  );
  const parentModelConfig = findRelationshipModelConfig(
    relationshipConfig.seqModelRelationshipID,
    "RIGHT"
  );
  const parentPrimaryKeyField =
    findModelPrimaryKeyField(parentModelConfig).fieldName;
  const pluralizedModelName = modelConfig.pluralizedModelName;
  const modelName = modelConfig.modelName;

  const shouldCollapse = useScreenSize("lg");

  const rows = useMemo(
    () =>
      (formik.values[pluralizedModelName as keyof T] as ArrayOfObject).filter(
        filterFunction?.[modelConfig.modelName] || Boolean
      ) as ArrayOfObject,
    [formik.values[pluralizedModelName as keyof T], filterFunction]
  );

  /* const rows = [
    ...(formik.values[pluralizedModelName as keyof T] as ArrayOfObject),
  ].filter(filterFunction || Boolean) as ArrayOfObject; */
  const {
    rowSelection,
    setRowSelection,
    setRowSelectionByIndex,
    resetRowSelection,
    setRowSelectionToAll,
    sort,
    setSort,
    recordsToDelete,
    setRecordsToDelete,
  } = useTableProps(modelConfig);

  const requiredList: Record<string, BasicModel[]> =
    createRequiredModelLists(modelConfig);

  //Page Constants
  const defaultFormValue = getInitialValues<T>(modelConfig, undefined, {
    childMode: true,
    requiredList,
    leftFieldName: leftFieldName.fieldName,
  });

  //Transformations
  const sorting = getSorting(sort);
  const hasSelected = Object.values(rowSelection).some((val) => val);

  const dataRowCount = rows.filter((item) => item[primaryKeyField]).length;
  const pageStatus = `Showing ${dataRowCount} of ${dataRowCount} record(s)`;

  //Client Actions
  const focusOnRef = () => {
    ref && ref.current?.focus();
  };

  const draggableField = modelConfig.fields.find((field) => field.orderField);

  interface AddRowProps {
    override?: Record<string, unknown>;
  }

  const addRow = (options?: AddRowProps) => {
    const { override } = options || {};
    let newRowValue: Record<string, unknown> = {
      ...defaultFormValue,
      [leftFieldName.fieldName]:
        formik.values[parentPrimaryKeyField as keyof T] || 0,
    };

    if (override) {
      newRowValue = { ...newRowValue, ...override };
    }

    if (draggableField) {
      newRowValue[draggableField.fieldName] = replaceHighestOrder(
        rows,
        draggableField.fieldName
      );
    }
    formik.setFieldValue(`${pluralizedModelName}`, [...rows, newRowValue]);

    setWillFocus(true);
  };

  const setTouchedRows = (idx: number) => {
    formik.setFieldValue(`${pluralizedModelName}[${idx}].touched`, true);
  };

  const deleteRow = (idx: number) => {
    const id = rows[idx][primaryKeyField];

    if (id) {
      setRecordsToDelete([id.toString()]);
    } else {
      formik.setFieldValue(pluralizedModelName, [
        ...rows.slice(0, idx),
        ...rows.slice(idx + 1),
      ]);
      formik.setErrors({});
      resetRowSelection();
    }

    if (modelConfig.disableAPIDelete) {
      setHasUpdate();
    }
  };

  const deleteSelectedRows = () => {
    const indexes = Object.keys(rowSelection)
      .filter((item) => rowSelection[item])
      .map((item) => parseInt(item));

    //Compute the Ids to be deleted. the index should be the selected indexes. then see if the rows has an actual id value
    const deletedIDs = rows
      .filter((_, idx) => indexes.includes(idx))
      .filter((item) => !!item[primaryKeyField])
      .map((item) => (item[primaryKeyField] as string).toString()) as string[];

    if (deletedIDs.length > 0) {
      setRecordsToDelete(deletedIDs);
    } else {
      formik.setFieldValue(
        pluralizedModelName,
        removeItemsByIndexes(rows, indexes)
      );
      formik.setErrors({});
      resetRowSelection();
    }
  };

  const toggleRow = (idx: number) => setRowSelectionByIndex(idx);
  const toggleSelectAllRow = () => {
    if (Object.keys(rowSelection).length === rows.length) {
      resetRowSelection();
    } else {
      setRowSelectionToAll(rows.length);
    }
  };

  const reorderRow = (draggedRowIndex: number, targetRowIndex: number) => {
    if (draggableField) {
      const { values, setFieldValue } = formik;
      const Models = values[pluralizedModelName as keyof T] as ArrayOfObject;

      // Clone the SubTasks array
      const newArray = [
        ...Models.map((item, idx) => ({
          ...item,
          touched:
            idx === targetRowIndex || idx === draggedRowIndex
              ? true
              : item.touched,
        })),
      ] as ArrayOfObject;

      const rowOrder = Models[targetRowIndex].priority as string;
      // Remove the item from its original position
      const [draggedItem] = newArray.splice(draggedRowIndex, 1);

      const draggedItemOrder = new Decimal(rowOrder).minus(new Decimal("0.01"));
      draggedItem[draggableField.fieldName] = draggedItemOrder.toString();

      // Insert the item at the target position
      newArray.splice(targetRowIndex, 0, draggedItem);

      // Update the priority field based on the index
      const updatedArray = newArray.map((item, idx) => ({
        ...item,
      }));

      // Update the formik field value
      setFieldValue(pluralizedModelName, updatedArray);
      setHasUpdate();
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

    setSort(sortParams);

    formik.setFieldValue(
      pluralizedModelName,
      rows.filter((item) => item.id).sort(sortFunction(sortParams, modelConfig))
    );
    resetRowSelection();
  };

  //This will be the additional properties to be used by this subform model (to be passed from the parent or from the modelConfig (to simplify))
  //@ts-ignore
  const SingleColumnComponent = getModelSingleColumns()[
    modelConfig.modelName
  ] as React.FC<ModelSingleColumnProps<T>> | undefined;
  const FormComponent =
    getModelForms()[
      modelConfig.modelName as keyof ReturnType<typeof getModelForms>
    ];

  const { openDialog, closeDialog } = useGlobalDialog();

  const [queue, setQueue] = useSessionStorage<T[]>(
    "queue",
    formik.values[pluralizedModelName as keyof typeof formik.values] as T[]
  );

  const openDialogHandler = (row?: Row<T>["original"]) => {
    openDialog({
      title: `${modelConfig.verboseModelName} Form`,
      message: (
        <div className="pt-8 text-left">
          <FormComponent
            //@ts-ignore
            data={(row ? row : null) as T | null}
            id={
              row
                ? (row[
                    getRowIndentifier(modelConfig) as keyof typeof row
                  ] as string) || "new"
                : "new"
            }
            modalFormProps={{
              onSuccess: () => {
                closeDialog();
              },
            }}
            hiddenField={relationshipConfig.leftForeignKey}
            onSubmit={(values, childFormik) => {
              //this will signify if the form will go to new value upon submission (so technically do not close the dialog)

              type ValueKey = keyof typeof values;
              type FormikValueKey = keyof typeof formik.values;
              const addNew: boolean = values[
                "addNew" as ValueKey
              ] as unknown as boolean;
              const queue = getSessionStorage<T[]>("queue") || [];

              const goToNewRecord = () => {
                const newRow = getInitialValues<T>(modelConfig, undefined, {
                  requiredList,
                  defaultValues: {
                    [leftFieldName.fieldName]:
                      formik.values[parentPrimaryKeyField as FormikValueKey] ||
                      0,
                  },
                });

                //@ts-ignore
                childFormik.setValues(newRow);

                const [firstFieldInForm, _] = getFirstAndLastFieldInForm(
                  modelConfig.fields,
                  relationshipConfig
                );

                (document.querySelector(
                  `#${firstFieldInForm}`
                ) as HTMLElement)!.focus();
              };

              //Check wether this is a new row or not signified by the id field
              const rows = formik.values[pluralizedModelName as FormikValueKey];
              const primaryKeyValue = values[primaryKeyField as ValueKey];

              if (addNew) {
                setQueue([
                  //@ts-ignore
                  ...queue,
                  //@ts-ignore
                  {
                    ...values,
                    touched: true,
                    //@ts-ignore
                    index: rows.length + queue.length,
                  },
                ]);
                goToNewRecord();
              } else {
                let newRows = rows as T[];

                queue.forEach((queued) => {
                  const primaryKeyValue =
                    queued[primaryKeyField as keyof typeof queued];
                  const queuedIndex = queued[
                    "index" as keyof typeof queued
                  ] as number;
                  if (primaryKeyValue) {
                    newRows = newRows.map((item) =>
                      item[primaryKeyField as keyof typeof item] ==
                      primaryKeyValue
                        ? { ...queued, touched: true }
                        : item
                    );
                  } else if (
                    queuedIndex != undefined &&
                    queuedIndex >= 0 &&
                    queuedIndex < newRows.length
                  ) {
                    newRows = replaceItemByIndex(newRows, queuedIndex, {
                      ...queued,
                      touched: true,
                    });
                  } else {
                    newRows = [...newRows, { ...queued, touched: true }];
                  }
                });
                if (primaryKeyValue) {
                  //@ts-ignore
                  newRows = newRows.map((item) =>
                    item[primaryKeyValue as keyof typeof item] ==
                    primaryKeyValue
                      ? { ...values, touched: true }
                      : item
                  );
                } else {
                  const valuesIndex = values[
                    "index" as keyof typeof values
                  ] as number;
                  if (
                    valuesIndex != undefined &&
                    valuesIndex >= 0 &&
                    valuesIndex < newRows.length
                  ) {
                    //@ts-ignore
                    newRows = replaceItemByIndex(newRows, valuesIndex, {
                      ...values,
                      touched: true,
                    });
                  } else {
                    newRows = [
                      //@ts-ignore
                      ...newRows,
                      //@ts-ignore
                      { ...values, touched: true, index: newRows.length },
                    ];
                  }
                }

                /* newRows = newRows.map((row, index) => ({ ...row, index })); */

                formik.setFieldValue(pluralizedModelName, newRows);
                closeDialog();
                setQueue([]);
              }
            }}
          />
        </div>
      ),
      formMode: true,
    });
  };

  const onRowClick = shouldCollapse ? openDialogHandler : undefined;

  const columnVisibility: Record<string, boolean> = modelConfig.fields.reduce(
    (acc: Record<string, boolean>, field) => {
      if (relationshipConfig.leftForeignKey === field.fieldName) {
        acc[field.fieldName] = false;
      } else if (field.hideInTable) {
        acc[field.fieldName] = false;
      } else {
        acc[field.fieldName] = SingleColumnComponent ? !shouldCollapse : true;
      }
      return acc;
    },
    { singleColumn: shouldCollapse }
  );

  const columnOrder: string[] = getColumnOrder(
    modelConfig,
    columnOrderToOverride,
    columnsToBeOverriden,
    Boolean(SingleColumnComponent)
  );

  const [firstFieldInForm, lastFieldInForm, visibleFields] =
    getFirstAndLastFieldInForm(modelConfig.fields, relationshipConfig);

  const modelColumns = useMemo(
    () =>
      getModelColumns<T, unknown>({
        modelConfig,
        ModelSingleColumn: SingleColumnComponent,
        columnsToBeOverriden,
        option,
        relationshipConfig,
      }),
    [modelConfig]
  );

  const modelTable = useReactTable<T>({
    data: rows as T[],
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
    enableMultiRowSelection: true,
    initialState: {
      columnVisibility,
      columnOrder,
    },
    meta: {
      name: modelConfig.pluralizedModelName,
      setHasUpdate,
      setTouchedRows,
      addRow,
      deleteRow,
      toggleRow,
      toggleSelectAllRow,
      firstFieldInForm: firstFieldInForm,
      lastFieldInForm: lastFieldInForm,
      visibleFields,
      forwardedRef: ref,
      editable: true,
      options: { ...requiredList },
      rowActions: {},
    },
  });

  //useEffects here
  useEffect(() => {
    if (willFocus) {
      focusOnRef();
    }
  }, [rows.length]);

  const toolRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0 }
    );

    if (toolRef.current) {
      observer.observe(toolRef.current);
    }

    return () => {
      if (toolRef.current) {
        observer.unobserve(toolRef.current);
      }
    };
  }, []);

  useEffect(() => {
    modelTable.getAllColumns().forEach((column) => {
      if (
        ![
          "select",
          "actions",
          ...modelConfig.fields
            .filter((item) => {
              if (relationshipConfig.leftForeignKey === item.fieldName) {
                return true;
              } else {
                return item.hideInTable;
              }
            })
            .map((item) => item.fieldName),
        ].includes(column.id)
      ) {
        if (column.id === "singleColumn") {
          if (SingleColumnComponent) {
            column.toggleVisibility(shouldCollapse);
          } else {
            column.toggleVisibility(false);
          }
        } else {
          column.toggleVisibility(
            !Boolean(SingleColumnComponent) || !shouldCollapse
          );
        }
      }
    });
  }, [shouldCollapse]);

  return (
    <div
      className="flex flex-col gap-2"
      style={{ gridArea: pluralizedModelName }}
    >
      <h3 className="text-xl font-bold">
        {modelConfig.pluralizedVerboseModelName}
      </h3>
      <div
        className="flex items-center gap-4"
        ref={toolRef}
      >
        <div
          className={cn(
            "flex flex-col gap-2 items-center lg:gap-4",
            !isVisible &&
              hasSelected &&
              "fixed left-0 right-0 m-auto bottom-5 border-2 border-border w-full bg-background  p-4 z-10 lg:rounded-lg shadow-sm"
          )}
        >
          <div className="text-sm">
            {modelTable.getFilteredSelectedRowModel().rows.length} of{" "}
            {modelTable.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          {hasSelected && (
            <div className="flex gap-2">
              {!isVisible && (
                <Button
                  type="button"
                  size={"sm"}
                  variant={"secondary"}
                  onClick={resetRowSelection}
                  className="flex items-center justify-center gap-1"
                >
                  Clear Selection
                </Button>
              )}
              <Button
                type="button"
                size={"sm"}
                variant={"destructive"}
                onClick={deleteSelectedRows}
                className="flex items-center justify-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>
        {shouldCollapse ? (
          <Button
            type="button"
            className={cn(
              buttonVariants({ variant: "secondary", size: "sm" }),
              "ml-auto"
            )}
            onClick={() => {
              setQueue([]);
              openDialogHandler({
                ...defaultFormValue,
                [leftFieldName.fieldName]:
                  formik.values[parentPrimaryKeyField as keyof T],
              });
            }}
          >
            Add New
          </Button>
        ) : (
          <Button
            tabIndex={-1}
            className="ml-auto"
            variant={"secondary"}
            type="button"
            size="sm"
            onClick={focusOnRef}
          >
            <ChevronLast className="w-4 h-4 text-foreground" />
            Go to last row
          </Button>
        )}
      </div>

      <div className="border rounded-md">
        <DataTable
          modelConfig={modelConfig}
          table={modelTable}
          isLoading={false}
          draggableField={draggableField}
          reorderRow={reorderRow}
          onRowClick={onRowClick}
        />
      </div>
      <div className="flex items-center justify-between flex-1 text-sm select-none text-muted-foreground">
        {
          <div className="flex items-center justify-between w-full gap-4">
            <p className={cn("lg:hidden")}>{pageStatus}</p>
            <div className="hidden gap-2 lg:flex">
              <Button
                type="button"
                size="sm"
                variant={"secondary"}
                onClick={() => addRow()}
              >
                <Plus className="w-4 h-4 text-foreground" /> Add Row
              </Button>
            </div>
          </div>
        }
      </div>
      <ModelDeleteDialog
        formik={formik}
        modelConfig={modelConfig}
        recordsToDelete={recordsToDelete}
        setRecordsToDelete={setRecordsToDelete}
        resetRowSelection={resetRowSelection}
        onSuccess={() => {
          removeRequiredListFromLocalStorage(modelConfig.modelPath);
        }}
      />
    </div>
  );
};

export default ModelSubform;
