export function findNextItem(array: string[], item: string) {
  const index = array.indexOf(item);

  if (index === -1) {
    throw new Error("Item not found in array");
  }

  if (index === array.length - 1) {
    return "";
  }

  return array[index + 1];
}
