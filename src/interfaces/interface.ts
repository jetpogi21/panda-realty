export interface SuccessResponse<T = undefined> {
  status: "success";
  data?: T;
}

export interface ErrorResponse {
  status: "error";
  error: string;
  errorCode: number;
  sqlMessage?: string;
  targetField?: string;
}

export type JSONResponse<T> = SuccessResponse<T> | ErrorResponse;

export interface SQLField {
  name: string;
  tableName?: string;
  alias?: string;
  pluralForm?: string;
  raw?: boolean;
}

export interface SQLTable {
  name: string;
  alias: string;
  isSQL?: boolean;
}

export interface SQLJoin {
  table: string;
  alias?: string;
  connectorRight?: string;
  connectorLeft?: string;
  joinType?: string;
  isSQL?: boolean;
}

export interface QueryResult
  extends Record<string, string | number | boolean | QueryResult> {}

export interface ReplacementObject {
  [key: string]: string | number | number[] | string[];
}

export interface ListQuery {
  cursor: string;
  sort: string;
  limit: string;
  simpleOnly: string;
  fetchCount: string;
}

export interface ChildSQL {
  [key: string]: {
    insertStatements: { [key: number]: string };
    updateStatements: { [key: number]: string };
    deleteStatements?: string[];
  };
}
