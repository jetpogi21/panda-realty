import { splitWordByLastHyphen } from "@/utils/utils";

export function addCursorFilterToURL(
  cursor: string,
  sort: string,
  sortField: string,
  PRIMARY_KEY: string,
  supQuery: any,
  tableName?: string
): void {
  const cursorCondition = sort.includes("-") ? "<" : ">";
  const [cursorArray0, cursorArray1] = splitWordByLastHyphen(cursor);

  const realPrimaryKey = tableName ? `${PRIMARY_KEY}` : PRIMARY_KEY;

  const realSortField = tableName ? `${sortField}` : sortField;

  if (sortField !== PRIMARY_KEY) {
    if (!cursorArray0) {
      if (cursorCondition === "<") {
        supQuery.is(realSortField, null).gt(realPrimaryKey, cursorArray1);
      } else {
        supQuery.or(
          `${realSortField}.not.is.null,and(${realSortField}.is.null,${realPrimaryKey}.gt.${cursorArray1})`
        );
      }
      /* addFilter(
        `and(${realSortField}.is.null,${realPrimaryKey}.gt.${cursorArray1})`,
        cursorCondition === "<"
          ? `and(${realSortField}.is.null,${realPrimaryKey}.gt.${cursorArray1})`
          : `or(${realSortField}.not.is.null,and(${realSortField}.is.null,${realPrimaryKey}.gt.${cursorArray1}))`
      ); */
    } else {
      const cursorCondSymbol = cursorCondition === ">" ? "gt" : "lt";
      supQuery.or(
        `${realSortField}.${cursorCondSymbol}.${cursorArray0},and(${realSortField}.eq.${cursorArray0},${realPrimaryKey}.gt.${cursorArray1})`
      );
      /*  addFilter(
        `or(${realSortField}.${cursorCondSymbol}.${cursorArray0},and(${realSortField}.eq.${cursorArray0},${realPrimaryKey}.gt.${cursorArray1}))`,
        undefined
      ); */
    }
  } else {
    const cursorCondSymbol = cursorCondition === ">" ? "gt" : "lt";
    supQuery[cursorCondSymbol](realSortField, cursor);
    /* addFilter(`${realSortField}.${cursorCondSymbol}.${cursor}`, undefined); */
  }
}
