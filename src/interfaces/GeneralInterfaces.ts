import { AppConfig } from "@/lib/app-config";
import { CellContext } from "@tanstack/react-table";
import { UploadFileResponse } from "uploadthing/client";

export interface BasicModel {
  id: number | string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbLink {
  href: string;
  caption: string | number;
}

export type SortPair = [string, "asc" | "desc"];

export interface NameCaption {
  name: string;
  caption: string;
  asc?: string;
  desc?: string;
}

export interface SortObject {
  [key: string]: {
    caption: string;
    asc?: string;
    desc?: string;
  };
}

export interface SortOptions {
  sortedBy: SortPair;
  list: NameCaption[];
}

export interface SortOptionsAsString {
  sortedBy: string;
  sortObject: SortObject;
}

export interface ControlChoice {
  value: string;
  label: string;
}

export interface ListQuery {
  sort: string;
  page: string;
  limit: string;
}

export interface AxiosResult<T> {
  status: "success";
  data: {
    count: number;
    rows: T[];
  };
}

export interface RowSelection {
  [key: number]: boolean;
}

export type TouchedRows = string[];

export interface FileState
  extends Pick<UploadFileResponse, "name" | "size" | "url"> {
  uploadedOn?: Date;
}

export interface FileValues {
  fileName: string | null;
  fileSize: number | null;
  file: string | null;
}

export type LocalFileInputAPIResponse =
  | {
      status: "success";
      fileURL: string;
    }
  | {
      status: "error";
      errorMsg: string;
    };

export type LocalDropZoneAPIResponse =
  | {
      status: "success";
      fileURLs: string[];
    }
  | {
      status: "error";
      errorMsg: string;
    };

export interface ColumnAttrs {
  type: string;
  db_name: string;
  sortOrder: number;
  verboseFieldName: string;
  verboseSortFieldName?: string;
}

export interface SortItem {
  caption: string;
  value: string;
}

export interface GetModelsResponse<TModel> {
  count: number;
  rows: TModel[];
  cursor: string;
}

export type UnknownObject = Record<string, unknown>;
export type ArrayOfUnknownObject = UnknownObject[];
export type PrimaryKey = string | number | undefined | null;

export interface ModelSingleColumnProps<T> {
  cell: CellContext<T, unknown>;
  relationshipConfig?: (typeof AppConfig)["relationships"][number];
}

export type RequiredList = Record<string, BasicModel[]>;
