import { SQLField, SQLJoin, SQLTable } from "../interfaces/interface";

class SQLHelper {
  fields?: SQLField[];
  table?: SQLTable;
  joins?: SQLJoin[];
  sqlType: string = "SELECT";
  orderBy?: string[];
  where?: string[];
  limit?: number;
  offset?: number;
  groupBy?: string[];

  get getFields() {
    return this.fields;
  }

  set setLimit(val: number) {
    this.limit = val;
  }

  set setGroupBy(val: string[]) {
    this.groupBy = val;
  }

  set setOffset(val: number) {
    this.offset = val;
  }

  set setFields(val: SQLField[]) {
    this.fields = val;
  }

  set setTable(val: SQLTable) {
    this.table = val;
  }

  set setJoins(val: SQLJoin[]) {
    this.joins = val;
  }

  set setSqlType(val: string) {
    this.sqlType = val;
  }

  set setOrderBy(val: string[]) {
    this.orderBy = val;
  }

  set setWhere(val: string[]) {
    this.where = val;
  }

  getSQLStatement() {
    let sql = "";
    sql = `${this.sqlType}`;
    sql = sql + ` ${this.getFieldsStatement()}`;
    sql = sql + ` ${this.getFromStatement()}`;
    if (this.joins) {
      sql = sql + ` ${this.getJoinStatement()}`;
    }

    if (this.where && this.where.length > 0) {
      sql = sql + ` ${this.getWhereStatement()}`;
    }

    if (this.groupBy && this.groupBy.length > 0) {
      sql = sql + ` ${this.getGroupByStatement()}`;
    }

    if (this.orderBy && this.orderBy.length > 0) {
      sql = sql + ` ${this.getOrderByStatement()}`;
    }

    if (this.limit) {
      sql = sql + ` LIMIT ${this.limit}`;
    }

    if (this.offset) {
      sql = sql + ` OFFSET ${this.offset}`;
    }

    return sql;
  }

  getGroupByStatement(): string {
    const groupByArr: string[] = [];
    this.groupBy?.map((item) => {
      groupByArr.push(item);
    });

    return `GROUP BY ${groupByArr.join(",")}`;
  }

  getOrderByStatement(): string {
    const orderByArr: string[] = [];
    this.orderBy?.map((item) => {
      orderByArr.push(item);
    });

    return `ORDER BY ${orderByArr.join(",")}`;
  }

  getWhereStatement(): string {
    const whereArr: string[] = [];
    this.where?.map((item) => {
      whereArr.push(item);
    });

    return `WHERE ${whereArr.join(" AND ")}`;
  }

  getJoinStatement(): string {
    const joinStatements: string[] = [];

    this.joins?.forEach((join) => {
      let joinType = join.joinType || "LEFT OUTER JOIN";
      let connectionString = "";
      let tableName = join.isSQL ? `(${join.table})` : `\`${join.table}\``;
      connectionString = `${tableName} AS \`${join.alias}\``;

      let onStatement = ` ON \`${this.table ? this.table.alias : ""}\`.\`${
        join.connectorRight
      }\` = \`${join.alias}\`.\`${join.connectorLeft}\``;

      joinStatements.push(`${joinType} ${connectionString} ${onStatement}`);
    });

    return joinStatements.join(" ");
  }

  getFieldsStatement(): string {
    //Loop through each field
    const fieldArray: Array<string> = [];
    this.fields?.map((field) => {
      if (field.raw) {
        fieldArray.push(field.name);
        return;
      }
      let tablePart = "";
      let aliasPart = "";
      const fieldName = field.name;
      const tableName = field.tableName || (this.table ? this.table.alias : "");

      tablePart = `"${tableName}"."${fieldName}"`;

      if (field.alias || field.tableName) {
        aliasPart = field.alias || fieldName;
        if (field.tableName) {
          aliasPart = `${field.pluralForm || tableName}.${aliasPart}`;
        }
      }

      let completeFieldName = tablePart;
      if (aliasPart) {
        completeFieldName = `${completeFieldName} AS "${aliasPart}"`;
      }

      fieldArray.push(completeFieldName);
    });
    return fieldArray.join(",");
  }

  getFromStatement(): string {
    let fromStatement = "FROM";
    let tblName = "";

    if (this.table) {
      const { name, alias, isSQL } = this.table;

      tblName = `\`${name}\``;
      if (isSQL) {
        tblName = `(${name})`;
      }
      if (alias) {
        tblName = `${tblName} AS \`${alias}\``;
      }
    }

    return `${fromStatement} ${tblName}`;
  }

  getRawFieldsToFieldType(rawFields: (string | string[])[]): SQLField[] {
    return rawFields.map((rawField) => {
      if (typeof rawField === "string") {
        return { name: rawField, raw: true };
      } else {
        const [fieldName, alias] = rawField;
        return { name: `${fieldName} as ${alias}`, raw: true };
      }
    });
  }

  createFieldsRawFields(
    rawFields: (string | string[])[],
    tableName: string
  ): string {
    return rawFields
      .map((rawField) => {
        const field = typeof rawField === "string" ? rawField : rawField[1];
        return `${tableName}.${field} as \`${tableName}.${field}\``;
      })
      .join(", ");
  }
}

export default SQLHelper;
