import { ModelRowActions } from "@/components/ModelRowActions";
import { Checkbox } from "@/components/ui/Checkbox";
import { DeleteRowColumn } from "@/components/ui/DataTable/DeleteRowColumn";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { AppConfig } from "@/lib/app-config";
import { formatDecimal } from "@/lib/formatDecimal";
import { ColumnsToBeOverriden, createTableColumns } from "@/lib/table-utils";
import { AllCellOptions } from "@/types/tanstack-table";
import {
  CellContext,
  ColumnDef,
  createColumnHelper,
} from "@tanstack/react-table";
import Decimal from "decimal.js";

interface ModelColumnProps<TData, TValue> {
  modelConfig: ModelConfig;
  ModelSingleColumn?:
    | React.FC<{
        cell: CellContext<TData, TValue>;
        relationshipConfig?: (typeof AppConfig)["relationships"][number];
      }>
    | undefined; // replace CellType with the actual type of cell
  columnsToBeOverriden?: ColumnsToBeOverriden<TData, unknown>;
  option?: AllCellOptions;
  relationshipConfig?: (typeof AppConfig)["relationships"][number];
}

export const getModelColumns = <TData, TValue>({
  ModelSingleColumn,
  modelConfig,
  columnsToBeOverriden,
  option,
  relationshipConfig,
}: ModelColumnProps<TData, TValue>): ColumnDef<TData, TValue>[] => {
  const columnHelper = createColumnHelper<TData>();

  const columns: ColumnDef<TData, TValue>[] = [
    {
      id: "select",
      header: ({ table }) => {
        const toggleSelectAllRow = table.options.meta?.toggleSelectAllRow;
        return (
          <div className="flex justify-center w-full">
            <Checkbox
              tabIndex={-1}
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={() => {
                toggleSelectAllRow && toggleSelectAllRow();
              }}
              aria-label="Select all"
            />
          </div>
        );
      },
      cell: ({ row, table }) => {
        const toggleRow = table.options.meta?.toggleRow;
        return (
          <div className="flex justify-center">
            <Checkbox
              tabIndex={-1}
              checked={row.getIsSelected()}
              onCheckedChange={() => {
                toggleRow && toggleRow(row.index);
              }}
              aria-label="Select row"
            />
          </div>
        );
      },
    },
  ];

  if (ModelSingleColumn) {
    columns.push({
      id: "singleColumn",
      header: () => (
        <div className="flex justify-center w-full">
          {modelConfig.pluralizedVerboseModelName}
        </div>
      ),
      cell: (cell) =>
        relationshipConfig ? (
          <ModelSingleColumn
            cell={cell}
            relationshipConfig={relationshipConfig}
          />
        ) : (
          <ModelSingleColumn cell={cell} />
        ),
      footer: (footer) => {
        const summaryFields = modelConfig.fields.filter(
          (field) => field.summarizedBy
        );
        if (summaryFields.length === 0) return null;
        return (
          <div className="flex flex-col justify-start w-full gap-1 ">
            {summaryFields.map(({ fieldName, verboseFieldName }) => {
              const sum = footer.table
                .getFilteredRowModel()
                .rows.reduce(
                  (acc, row) =>
                    new Decimal(acc).plus(
                      row.original[
                        fieldName as keyof typeof row.original
                      ] as Decimal.Value
                    ),
                  new Decimal(0)
                );
              return (
                <div key={fieldName}>
                  {verboseFieldName} SUM: {formatDecimal(sum)}
                </div>
              );
            })}
          </div>
        );
      },
    });
  }

  return [
    ...columns,
    ...createTableColumns<TData>(
      modelConfig,
      columnHelper,
      columnsToBeOverriden,
      option
    ),
    {
      id: "actions",
      cell: (cell) =>
        modelConfig.isRowAction ? (
          <ModelRowActions
            cell={cell}
            modelConfig={modelConfig}
          />
        ) : (
          <div className="flex justify-start w-full">
            <DeleteRowColumn {...cell} />
          </div>
        ),
    },
  ] as ColumnDef<TData, TValue>[];
};
