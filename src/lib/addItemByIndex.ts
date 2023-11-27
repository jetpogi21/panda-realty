export function addItemByIndex<T>(arr: T[], index: number, item: T): T[] {
  // Handle negative indexes
  if (index < 0) {
    index = arr.length + index + 1;
  }

  if (index >= 0 && index <= arr.length) {
    arr.splice(index, 0, item);
    return arr;
  }

  return arr;
}
