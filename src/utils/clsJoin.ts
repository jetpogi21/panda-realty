export default class clsJoin {
  private _joinType: "INNER" | "LEFT";
  private _alias: string = "";
  private _source: string;
  private _rightFields: string | string[];
  private _leftFields: string | string[];

  constructor(
    source: string,
    leftFields: string | string[],
    rightFields: string | string[] = "",
    alias: string = "",
    joinType: "INNER" | "LEFT" = "INNER"
  ) {
    this._source = source;

    if (typeof leftFields === "string") {
      this._leftFields = leftFields.split(",");
    } else {
      this._leftFields = leftFields;
    }

    if (rightFields !== "") {
      if (typeof rightFields === "string") {
        this._rightFields = rightFields.split(",");
      } else {
        this._rightFields = rightFields;
      }
    } else {
      this._rightFields = this._leftFields;
    }

    if (alias) {
      this._alias = alias;
    }

    this._joinType = joinType;
  }

  get joinType() {
    return this._joinType;
  }

  set joinType(value: "INNER" | "LEFT") {
    this._joinType = value;
  }

  get alias() {
    return this._alias;
  }

  set alias(value: string) {
    this._alias = value;
  }

  get source() {
    return this._source;
  }

  set source(value: string) {
    this._source = value;
  }

  get rightFields() {
    return this._rightFields;
  }

  set rightFields(value: string | string[]) {
    this._rightFields = value;
  }

  get leftFields() {
    return this._leftFields;
  }

  //Also set the rightFields to be the same if leftFields is provided
  set leftFields(value: string | string[]) {
    this._leftFields = value;
    this._rightFields = value;
  }
}
