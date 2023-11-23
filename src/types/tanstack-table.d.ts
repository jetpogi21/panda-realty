import { ModelRowActions } from "@/components/ModelRowActions";
import { DialogFormProps } from "@/components/ui/DataTable";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import "@tanstack/table-core";

declare module "@tanstack/table-core" {
  interface TableMeta<TData extends RowData> {
    name?: string;
    setTouchedRows?: (idx: number) => void;
    addRow?: ({ override }?: { override?: Record<string, unknown> }) => void;
    deleteRow?: (idx: number) => void;
    toggleRow?: (idx: number) => void;
    toggleSelectAllRow?: () => void;
    forwardedRef?: React.RefObject<HTMLElement>;
    firstFieldInForm?: string;
    lastFieldInForm?: string;
    editable?: boolean;
    setHasUpdate?: () => void;
    visibleFields?: string[];
    openDialogHandler?: DialogFormProps<TData>["openDialogHandler"];
    options?: {
      [key: string]: BasicModel[];
    };
    rowActions?: ModelRowActions;
  }
}

type OnChange = (newValue: any, formikValues?: any) => void;
type OnBlur = (newValue: any, formikValues?: any) => void;
export interface CellOption {
  handleChange?: OnChange;
  handleBlur?: OnBlur;
}

export interface AllCellOptions {
  handleChange?: {
    [key: string]: CellOption["handleChange"];
  };
  handleBlur?: {
    [key: string]: CellOption["handleBlur"];
  };
}
