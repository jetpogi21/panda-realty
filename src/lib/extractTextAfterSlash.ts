import { forceCastToNumber } from "@/utils/utilities";

export function extractTextAfterSlash(inputString: string): number {
  var parts = inputString.split("/");

  if (parts.length > 1) {
    return forceCastToNumber(parts[1]);
  } else {
    return 0;
  }
}
