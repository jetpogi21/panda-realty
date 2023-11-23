import clsJoin from "./clsJoin";

class clsSQL {
  private _SQLType: "SELECT" | "INSERT" | "DELETE" | "UPDATE";
  private _source: string = "";
  private _fields: string[];
  private _filter: string = "";
  private _orderBy: string[];
  private _joins: clsJoin[];
  private _sourceAlias: string = "";
  private _set: string[] = [];
  private _insertValues: string[];
  private _insertSQL: string = "";
  private _insertFilterField: string[] = [];
  private _groupBy: string[];
  private _makeTable: string = "";
  private _insertUseAsPlain: boolean = false;
  private _lastInsertID: number = 0;
  private _having: string = "";
  private _limit: number = 0;
  private _offset: number = 0;

  constructor() {
    this._SQLType = "SELECT";
    this._fields = [];
    this._joins = [];
    this._groupBy = [];
    this._orderBy = [];
    this._insertValues = [];
  }

  get SQLType() {
    return this._SQLType;
  }

  set SQLType(value: "SELECT" | "INSERT" | "DELETE" | "UPDATE") {
    this._SQLType = value;
  }

  get source() {
    return this._source;
  }

  set source(value: string) {
    this._source = value;
  }

  get fields() {
    return this._fields;
  }

  set fields(value: string[]) {
    this._fields = value;
  }

  get filter() {
    return this._filter;
  }

  set filter(value: string) {
    this._filter = value;
  }

  get orderBy() {
    return this._orderBy;
  }

  set orderBy(value: string[]) {
    this._orderBy = value;
  }

  get joins() {
    return this._joins;
  }

  set joins(value: clsJoin[]) {
    this._joins = value;
  }

  get sourceAlias() {
    return this._sourceAlias;
  }

  set sourceAlias(value: string) {
    this._sourceAlias = value;
  }

  get set() {
    return this._set;
  }

  set set(value: string[]) {
    this._set = value;
  }

  get insertValues() {
    return this._insertValues;
  }

  set insertValues(value: string[]) {
    this._insertValues = value;
  }

  get insertSQL() {
    return this._insertSQL;
  }

  set insertSQL(value: string) {
    this._insertSQL = value;
  }

  get insertFilterField() {
    return this._insertFilterField;
  }

  set insertFilterField(value: string[]) {
    this._insertFilterField = value;
  }

  get groupBy() {
    return this._groupBy;
  }

  set groupBy(value: string[]) {
    this._groupBy = value;
  }

  get makeTable() {
    return this._makeTable;
  }

  set makeTable(value: string) {
    this._makeTable = value;
  }

  get insertUseAsPlain() {
    return this._insertUseAsPlain;
  }

  set insertUseAsPlain(value: boolean) {
    this._insertUseAsPlain = value;
  }

  get lastInsertID() {
    return this._lastInsertID;
  }

  set lastInsertID(value: number) {
    this._lastInsertID = value;
  }

  get having() {
    return this._having;
  }

  set having(value: string) {
    this._having = value;
  }

  get limit() {
    return this._limit;
  }

  set limit(value: number) {
    this._limit = value;
  }

  get offset() {
    return this._offset;
  }

  set offset(value: number) {
    this._offset = value;
  }

  //All logic will start here.
  sql(): string {
    switch (this._SQLType) {
      case "SELECT":
        return this.generateSelectStatement();
        break;
      case "UPDATE":
        return this.generateUpdateStatement();
        break;
      case "DELETE":
        return this.generateDeleteStatement();
        break;
      case "INSERT":
        return this.generateInsertStatement();
        break;
      default:
        break;
    }

    return "";
  }

  private generateInsertStatement() {
    let sqlParts = ["INSERT INTO"];

    sqlParts.push(this._source);
    sqlParts.push(`(${this._fields.join(",")})`);

    if (this._insertValues.length > 0) {
      sqlParts.push(`VALUES (${this._insertValues.join(",")})`);
    } else if (this._insertFilterField.length > 0) {
      if (this._insertUseAsPlain) {
        sqlParts.push(
          `SELECT ${this._insertFilterField.join(",")} FROM ${this._insertSQL}`
        );
      } else {
        sqlParts.push(
          `SELECT ${this._insertFilterField.join(",")} FROM (${
            this._insertSQL
          }) tblTemp`
        );
      }
    } else {
      sqlParts.push(this._insertSQL);
    }

    return sqlParts.join(" ");
  }

  private generateDeleteStatement() {
    let sqlParts = ["DELETE"];

    if (this._fields.length > 0) {
      sqlParts.push(this._fields.join(","));
    } else {
      sqlParts.push("*");
    }

    const openParenthesis = "(".repeat(this._joins.length);
    sqlParts.push(`FROM ${openParenthesis}${this._source}`);

    if (this._joins.length > 0) {
      sqlParts.push(this.generateJoinStatement());
    }

    sqlParts.push(`SET ${this._set.join(",")}`);

    if (this._filter) {
      sqlParts.push(`WHERE ${this._filter}`);
    }

    return sqlParts.join(" ");
  }

  private generateUpdateStatement() {
    let sqlParts = ["UPDATE"];

    const openParenthesis = "(".repeat(this._joins.length);
    sqlParts.push(`${openParenthesis}${this._source}`);

    if (this._joins.length > 0) {
      sqlParts.push(this.generateJoinStatement());
    }

    sqlParts.push(`SET ${this._set.join(",")}`);

    if (this._filter) {
      sqlParts.push(`WHERE ${this._filter}`);
    }

    return sqlParts.join(" ");
  }

  private generateSelectStatement() {
    let sqlParts = ["SELECT"];

    if (this._fields.length > 0) {
      sqlParts.push(this._fields.join(","));
    } else {
      sqlParts.push("*");
    }

    const openParenthesis = "(".repeat(this._joins.length);

    if (this._sourceAlias) {
      sqlParts.push(
        `FROM ${openParenthesis}(${this._source}) AS ${this._sourceAlias}`
      );
    } else {
      sqlParts.push(`FROM ${openParenthesis}${this._source}`);
    }

    if (this._joins.length > 0) {
      sqlParts.push(this.generateJoinStatement());
    }

    if (this._filter) {
      sqlParts.push(` WHERE ${this._filter}`);
    }

    if (this._groupBy.length > 0) {
      sqlParts.push(` GROUP BY ${this._groupBy.join(",")}`);
    }

    if (this._having) {
      sqlParts.push(` HAVING ${this._having}`);
    }

    if (this._orderBy.length > 0) {
      sqlParts.push(` ORDER BY ${this._orderBy.join(",")}`);
    }

    const limitClauses = [];
    if (this._offset) {
      limitClauses.push(this._offset);
    }
    if (this._limit) {
      limitClauses.push(this._limit);
    }

    if (limitClauses.length > 0) {
      sqlParts.push(` LIMIT ${limitClauses.join(",")}`);
    }

    return sqlParts.join(" ");
  }

  private generateJoinStatement(): string {
    const joinStrings: string[] = [];

    this._joins.forEach((join) => {
      let joinStatements = [];

      let joinString = `${join.joinType} JOIN `;

      if (join.alias) {
        //joinStr = joinStr & "( " & vJoin.source & " ) AS " & vJoin.Alias & " ON "
        joinString += `(${join.source}) AS ${join.alias} ON `;
      } else {
        //joinStr = joinStr & " " & vJoin.source & " ON "
        joinString += `${join.source} ON `;
      }

      for (let index = 0; index < join.leftFields.length; index++) {
        let linkString = "";
        const leftField = join.leftFields[index];
        const rightField = join.rightFields[index];
        const tableName = this._sourceAlias ? this._sourceAlias : this._source;
        linkString = `${tableName}.${leftField} = `;

        const joinTableName = join.alias ? join.alias : join.source;
        linkString += `${joinTableName}.${rightField}`;

        joinStatements.push(`(${linkString})`);
      }

      joinStrings.push(`${joinString} ${joinStatements.join(" AND ")}) `);
    });

    return joinStrings.join("");
  }
}

export default clsSQL;
