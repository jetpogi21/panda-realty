export function replaceItemByIndex<T>(arr: T[], index: number, newItem: T) {
  // Handle negative indexes
  if (index < 0) {
    index = arr.length + index;
  }

  if (index >= 0 && index < arr.length) {
    arr.splice(index, 1, newItem);
    return arr;
  }

  return arr;
}
