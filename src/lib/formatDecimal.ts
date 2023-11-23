import Decimal from "decimal.js";

export function formatDecimal(decimalValue: Decimal): string {
  // Convert the Decimal object to a number
  const numberValue = decimalValue.toNumber();

  // Format the number with two decimal places and comma grouping
  return numberValue.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
  });
}
