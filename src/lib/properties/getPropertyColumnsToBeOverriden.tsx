//Generated by WriteToGetmodelcolumnstobeoverriden_tsx - getModelColumnsToBeOverriden.tsx
import { Badge } from "@/components/ui/Badge";
import { DataTableColumnHeader } from "@/components/ui/DataTable/DataTableColumnHeader";
import { PropertyModel } from "@/interfaces/PropertyInterfaces";
import { ColumnsToBeOverriden } from "@/lib/table-utils";
import { formatCurrency } from "@/utils/utilities";
import { HeaderContext, CellContext } from "@tanstack/react-table";
import { Bath, Bed, Calendar, Car, CircleDollarSign } from "lucide-react";

export const getPropertyColumnsToBeOverriden = <TData, TValue>() => {
  return {
    postcode: {
      meta: {
        alignment: "center",
      },
    },
    bed: {
      header: (header: HeaderContext<TData, TValue>) => (
        <DataTableColumnHeader
          column={header.column}
          title={"Bed/Bath/Garage"}
        />
      ),
      cell: (cell: CellContext<TData, TValue>) => {
        const row = cell.row.original as PropertyModel;
        return (
          <div className="flex justify-center gap-4">
            <div className="flex gap-1">
              <Bed className="w-4 h-4" />
              {row.bed}
              <Bath className="w-4 h-4" />
              {row.bath}
              <Car className="w-4 h-4" />
              {row.car}
            </div>
          </div>
        );
      },
      meta: {
        alignment: "center",
      },
    },
    suburb: {
      header: (header: HeaderContext<TData, TValue>) => (
        <DataTableColumnHeader
          column={header.column}
          title={"Suburb"}
        />
      ),
      cell: (cell: CellContext<TData, TValue>) => {
        const row = cell.row.original as PropertyModel;
        return (
          <div className="flex flex-col items-center gap-2">
            <div>{row.suburb}</div>
            <div className="p-2 text-xs rounded-sm bg-accent">{row.state}</div>
          </div>
        );
      },
      meta: {
        alignment: "center",
      },
    },
    land_use: {
      header: (header: HeaderContext<TData, TValue>) => (
        <DataTableColumnHeader
          column={header.column}
          title={"Description"}
        />
      ),
      cell: (cell: CellContext<TData, TValue>) => {
        const row = cell.row.original as PropertyModel;
        return (
          <div className="flex flex-col gap-2">
            {row.land_use && <div>{row.land_use}</div>}
            {row.zoning && <div>{row.zoning}</div>}
            {row.development_zone && <div>{row.development_zone}</div>}
            {row.primary_plan && <div>{row.primary_plan}</div>}
            {row.rpd && <div>{row.rpd}</div>}
          </div>
        );
      },
    },
    building_area: {
      meta: {
        alignment: "center",
      },
    },
    property_type: {
      meta: {
        alignment: "center",
      },
    },
    valuation_no: {
      header: (header: HeaderContext<TData, TValue>) => (
        <DataTableColumnHeader
          column={header.column}
          title={"Valuation"}
        />
      ),
      cell: (cell: CellContext<TData, TValue>) => {
        const row = cell.row.original as PropertyModel;
        return (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
              {row.valuation_no && <div>{row.valuation_no}</div>}
              {row.valuation_type && (
                <div className="px-2 py-1 text-xs rounded-sm bg-accent">
                  {row.valuation_type}
                </div>
              )}
            </div>

            {row.valuation_amount ? (
              <div className="flex items-center gap-2">
                <CircleDollarSign
                  className="w-5 h-5"
                  color="#3e9c35"
                />
                {formatCurrency(row.valuation_amount)}
              </div>
            ) : null}
            {row.valuation_date ? (
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {row.valuation_date}
              </div>
            ) : null}
          </div>
        );
      },
    },

    //Generated column (meaning this column doesn't exist from the original field)
    /* debitTotal: {
      header: (header: HeaderContext<TData, TValue>) => (
        <DataTableColumnHeader
          column={header.column}
          title={"Debit"}
        />
      ),
      cell: (cell: CellContext<TData, TValue>) => {
        const row = cell.row.original as JournalEntryModel;
        return (
          <div>
            {row.JournalEntryItems.reduce(
              (prev, cur) => (prev + cur.debit_amount) as unknown as number,
              0
            ).toFixed(2)}
          </div>
        );
      },
      footer: (footer: HeaderContext<TData, TValue>) => null,
      meta: {
        alignment: "right",
      },
      enableSorting: false,
    }, */
  } as ColumnsToBeOverriden<TData, TValue>;
};