"use client";
import { findModelPrimaryKeyField, getSorting } from "@/utils/utilities";
import { removeItemsByIndexes } from "@/utils/utils";
import { SortingState } from "@tanstack/react-table";
import { FormikProps } from "formik";
import React, { useEffect, useRef, useState } from "react";
import { FormikLocalDropZone } from "@/components/formik/FormikLocalDropZone";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { getInitialValues } from "@/lib/getInitialValues";
import { sortRows } from "@/lib/sortRows";
import { ModelDeleteDialog } from "@/components/ModelDeleteDialog";
import { useTableProps } from "@/hooks/useTableProps";

interface ModelFileDropzoneProps<T> {
  formik: FormikProps<T>;
  modelConfig: ModelConfig;
  handleUpdate: () => void;
  defaultValue?: Record<string, unknown>;
}

const ModelFileDropzone = <T,>({
  formik,
  modelConfig,
  handleUpdate,
  defaultValue,
}: ModelFileDropzoneProps<T>) => {
  const pluralizedModelName = modelConfig.pluralizedModelName;
  const primaryKeyFieldName = findModelPrimaryKeyField(modelConfig).fieldName;
  //URL States
  //Local states
  const [willFocus, setWillFocus] = useState(false);
  const ref: React.RefObject<HTMLElement> = useRef(null); //to be attached to the last row in form, first control in that row

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

  //Page Constants
  const defaultFormValue = getInitialValues(modelConfig, undefined, {
    childMode: true,
  });

  const rows = formik.values[pluralizedModelName as keyof T] as Record<
    string,
    unknown
  >[];

  //Transformations
  const sorting = getSorting(sort);
  const hasSelected = Object.values(rowSelection).some((val) => val);
  const dataRowCount = rows.filter((item) => item[primaryKeyFieldName]).length;
  const pageStatus = `Showing ${dataRowCount} of ${dataRowCount} record(s)`;

  //Utility Functions

  //Client Actions
  const focusOnRef = () => {
    ref && ref.current?.focus();
  };

  const deleteRow = (idx: number) => {
    const id = rows[idx][primaryKeyFieldName];

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
  };

  const deleteSelectedRows = () => {
    const indexes = Object.keys(rowSelection).map((item) => parseInt(item));

    //Compute the Ids to be deleted. the index should be the selected indexes. then see if the rows has an actual id value
    const deletedIDs = rows
      .filter((_, idx) => indexes.includes(idx))
      .filter((item) => !!item[primaryKeyFieldName])
      .map((item) => (item[primaryKeyFieldName] as number).toString());

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
      rows
        .filter((item) => item.id)
        .sort((a, b) => {
          const desc = sortParams.includes("-");
          const field = desc ? sortParams.substring(1) : sortParams;

          return sortRows(a, b, desc, field, modelConfig);
        })
    );
    resetRowSelection();
  };

  //useEffects here
  useEffect(() => {
    if (willFocus) {
      focusOnRef();
    }
  }, [rows]);

  return (
    <>
      <FormikLocalDropZone
        setHasUpdate={handleUpdate}
        fieldName="file"
        parent={pluralizedModelName}
        deleteRow={deleteRow}
        pkField={primaryKeyFieldName}
        defaultValue={defaultValue}
      />
      <ModelDeleteDialog
        formik={formik}
        modelConfig={modelConfig}
        recordsToDelete={recordsToDelete}
        setRecordsToDelete={setRecordsToDelete}
      />
    </>
  );
};

export default ModelFileDropzone;
