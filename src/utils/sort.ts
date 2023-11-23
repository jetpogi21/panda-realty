type ColumnType = {
  [key: string]: {
    type: string;
  };
};

export const sortData = <T>(
  a: T,
  b: T,
  desc: boolean,
  field: string,
  COLUMNS: ColumnType,
  primaryKeyField: string = "id"
) => {
  //@ts-ignore
  const primaryKeyA = a[primaryKeyField];
  //@ts-ignore
  const primaryKeyB = b[primaryKeyField];

  if (primaryKeyA === "") {
    return 1; // Move empty primaryKeyField to the end
  }
  if (primaryKeyB === "") {
    return -1; // Move empty primaryKeyField to the end
  }

  if (primaryKeyA === "") {
    return 1; // Move empty primaryKeyField to the end
  }
  if (primaryKeyB === "") {
    return -1; // Move empty primaryKeyField to the end
  }
  //@ts-ignore
  if (COLUMNS[field].type === "string") {
    return desc
      ? //@ts-ignore
        b[field].localeCompare(a[field])
      : //@ts-ignore
        a[field].localeCompare(b[field]);
  } else {
    if (!desc) {
      //@ts-ignore
      if (a[field] === null) {
        return -1; // Treat 'a' as less than 'b'
        //@ts-ignore
      } else if (b[field] === null) {
        return 1; // Treat 'b' as less than 'a'
      } else {
        //@ts-ignore
        return a[field] - b[field]; // Regular numeric comparison for non-null values
      }
    } else {
      //@ts-ignore
      if (b[field] === null) {
        return -1; // Treat 'a' as less than 'b'
        //@ts-ignore
      } else if (a[field] === null) {
        return 1; // Treat 'b' as less than 'a'
      } else {
        //@ts-ignore
        return b[field] - a[field]; // Regular numeric comparison for non-null values
      }
    }
  }
};
