export const extractDataTypeOptionSubstrings = (
  inputString: string
): string[] => {
  const regex = /\(([^)]+)\)/g;
  const matches = inputString.match(regex);

  if (!matches) {
    return [];
  }

  const substrings = matches.map((match) => match.slice(1, -1));
  const splitStrings = substrings.map((substring) =>
    substring.split(",").map((item) => item.trim().replace(/'/g, ""))
  );
  return splitStrings.flat();
};
