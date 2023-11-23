export function deleteItemByIndex<T>(arr: T[], index: number) {
  // Handle negative indexes
  if (index < 0) {
    index = arr.length + index;
  }

  if (index >= 0 && index < arr.length) {
    arr.splice(index, 1);
    return arr;
  }

  return arr;
}
