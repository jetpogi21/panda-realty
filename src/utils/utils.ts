import { NextResponse } from "next/server";
import { JSONResponse, QueryResult } from "../interfaces/interface";
import { URLSearchParams } from "url";
import slugify from "slugify";

//returns ["Field ASC","Field2 DESC"]
export const getSort = (
  sortValue: string | undefined,
  defaultSort: string = "",
  alwaysInclude?: string
): string[] => {
  const sortString = sortValue || defaultSort;

  return convertSortStringToArray(sortString, alwaysInclude);
};

export const convertSortStringToArray = (
  sortStr: string,
  alwaysInclude?: string
) => {
  let sortItems = [];
  let fieldName;
  if (sortStr.startsWith("-")) {
    fieldName = sortStr.slice(1);
    sortItems.push(`${fieldName} DESC`);
  } else {
    fieldName = sortStr;
    sortItems.push(fieldName);
  }

  if (alwaysInclude && fieldName !== alwaysInclude) {
    sortItems.push(alwaysInclude);
  }

  return sortItems;
};

export const formatSortAsSequelize = (
  sortArr: string[]
): [string, string][] => {
  const defaultSortMap = new Map<string, string>();
  sortArr.forEach((sortStr) => {
    const [field, direction = "ASC"] = sortStr.split(" ");
    defaultSortMap.set(field, direction);
  });

  return sortArr.map((sortStr) => {
    const [field, direction] = sortStr.split(" ");
    const finalDirection = direction || defaultSortMap.get(field) || "ASC";
    return [field, finalDirection] as [string, string];
  });
};

export const reduceResult = (
  result: QueryResult[],
  group: string[] | [string, string][]
) => {
  // A helper function to check if an element is a tuple or not
  const isTuple = (element: any): element is [string, string] => {
    return Array.isArray(element) && element.length === 2;
  };

  // A helper function to get the real group name and rename group name from an element
  const getGroupNames = (element: string | [string, string]) => {
    let realGroup: string;
    let renameGroup: string;
    if (isTuple(element)) {
      // If the element is a tuple, use the first item as the real group name and the second item as the rename group name
      [realGroup, renameGroup] = element;
    } else {
      // If the element is a string, use it as both the real group name and the rename group name
      realGroup = renameGroup = element;
    }
    return { realGroup, renameGroup };
  };

  // The main logic of the function
  const reducedResult = result.reduce((prev, currentItem) => {
    let newItem: QueryResult;
    if (prev.length === 0) {
      // If this is the first iteration, create a new object with all properties of currentItem
      newItem = { ...currentItem };
      // Loop through each element of group and delete or add properties accordingly
      for (const element of group) {
        const { realGroup, renameGroup } = getGroupNames(element);

        delete newItem[realGroup];

        //@ts-ignore
        newItem[renameGroup] =
          typeof currentItem[realGroup] === "object" &&
          //@ts-ignore
          currentItem[realGroup].id !== null
            ? [currentItem[realGroup]]
            : [];
      }
      return [newItem];
    } else {
      // If this is not the first iteration, get the last element of prev and compare its id with that of currentItem
      const lastElement = prev[prev.length - 1];
      if (lastElement.id === currentItem.id) {
        // If they are equal, create a new object with all properties of currentItem
        newItem = { ...currentItem };
        // Loop through each element of group and delete or add properties accordingly
        for (const element of group) {
          const { realGroup, renameGroup } = getGroupNames(element);
          delete newItem[realGroup];
          //@ts-ignore
          newItem[renameGroup] =
            //@ts-ignore
            typeof lastElement[renameGroup] === "object" &&
            //@ts-ignore
            lastElement[renameGroup].length > 0
              ? //@ts-ignore
                [...lastElement[renameGroup], currentItem[realGroup]]
              : [];
        }
        return [...prev.slice(0, prev.length - 1), newItem];
      } else {
        // If they are not equal, create a new object with all properties of currentItem
        newItem = { ...currentItem };
        // Loop through each element of group and delete or add properties accordingly
        for (const element of group) {
          const { realGroup, renameGroup } = getGroupNames(element);
          delete newItem[realGroup];
          //@ts-ignore
          newItem[renameGroup] =
            typeof currentItem[realGroup] === "object" &&
            //@ts-ignore
            currentItem[realGroup].id !== null
              ? [currentItem[realGroup]]
              : [];
        }

        return [...prev, newItem];
      }
    }
  }, <QueryResult[]>[]);

  return reducedResult;
};

//This will remove a duplicate item from an array 1 level deep of an object..
//[{b:[{id},{id},{id}]}] => [{b:[{id}]}]
export const removeDuplicates = (
  result: { [key: string]: unknown }[],
  resultKey: string,
  duplicateIdentifier: string
) => {
  result.forEach((item) => {
    const valueToTest = item[resultKey]; // [{id},{id}]
    const uniqueItems: unknown[] = [];
    if (valueToTest && Array.isArray(valueToTest)) {
      const uniqueIdentifiers = new Set();
      //valueToTestItem -> {id, name, etc.}
      valueToTest.forEach((valueToTestItem) => {
        if (!uniqueIdentifiers.has(valueToTestItem[duplicateIdentifier])) {
          uniqueIdentifiers.add(valueToTestItem[duplicateIdentifier]);
          uniqueItems.push(valueToTestItem);
        }
      });
    }

    item[resultKey] = uniqueItems;
  });
};

export const isValidPage = (
  page: string
): { status: boolean; num?: number } => {
  if (typeof page !== "string") {
    return { status: false };
  }

  const num = Number(page);

  if (Number.isInteger(num) && num > 1 && num % 1 === 0) {
    return { status: true, num };
  }

  return { status: true };
};

export const convertToArray = (value: string[] | string): number[] => {
  if (value) {
    if (Array.isArray(value)) {
      return value.map((i) => parseInt(i));
    } else {
      return [parseInt(value)];
    }
  } else {
    return [];
  }
};

export const returnJSONResponse = <T>(jsonResponse: JSONResponse<T>) => {
  if (jsonResponse.status === "error") {
    return NextResponse.json(jsonResponse, {
      status: jsonResponse.errorCode,
      statusText: jsonResponse.error,
    });
  } else {
    return NextResponse.json(jsonResponse);
  }
};

export const convertStringToFloat = (amountStr: string): number => {
  return parseFloat(amountStr.replace(",", ""));
};

export const convertDateStringToYYYYMMDD = (dateStr: string) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  return `${year}-${month}-${day}`;
};

export const isValidDate = (dateString?: string): boolean => {
  return !!dateString && !isNaN(Date.parse(dateString));
};

export const validateFieldIfBlank = (
  item: Record<string, string | number | boolean>,
  keyObjects: Record<string, string>
): string => {
  for (const key of Object.keys(keyObjects)) {
    if (!item[key]) {
      return `${keyObjects[key].toLowerCase()} should not be empty.`;
    }
  }
  return "";
};

export function checkDuplicateCombinations(
  uniqueFields: Record<string, string>,
  ListToCheck: Record<string, any>[]
): string {
  const uniqueCombinations = ListToCheck.map((item) => {
    return Object.keys(uniqueFields)
      .map((key) => {
        if (key.includes("month")) {
          const monthNumber = item[key];
          const monthName = new Date(0, monthNumber - 1).toLocaleString(
            "en-US",
            {
              month: "long",
            }
          );
          return monthName;
        }
        return item[key];
      })
      .join(" ");
  });

  const unique_combinations = new Set(uniqueCombinations);
  if (unique_combinations.size !== uniqueCombinations.length) {
    const duplicate_unique_combinations: string[] = [];
    uniqueCombinations.forEach((item) => {
      if (!unique_combinations.has(item)) {
        duplicate_unique_combinations.push(item);
      } else {
        unique_combinations.delete(item);
      }
    });
    const s = duplicate_unique_combinations.length > 1 ? "s" : "";

    return `${duplicate_unique_combinations
      .map((item) => `"${item}"`)
      .join(", ")} ${Object.values(uniqueFields)
      .join(" ")
      .toLowerCase()}${s} already exist${s ? "" : "s"}`;
  }

  return "";
}

export function validateRequiredFields(
  requiredFields: Record<string, unknown>,
  res: Record<string, unknown>
) {
  for (let key in requiredFields) {
    if (!res[key]) {
      return returnJSONResponse({
        status: "error",
        error: `${requiredFields[key]} is a required field..`,
        errorCode: 404,
      });
    }
  }
  // All required fields are present
  return returnJSONResponse({ status: "success" });
}

// Generates a random session token
export function generateSessionToken() {
  const tokenLength = 32;
  const characters =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let token = "";

  for (let i = 0; i < tokenLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    token += characters.charAt(randomIndex);
  }

  return token;
}

// Calculates the session expiration date
export function calculateSessionExpiration() {
  const sessionDurationInMinutes = 60; // Session duration in minutes
  const expirationDate = new Date();
  expirationDate.setTime(
    expirationDate.getTime() + sessionDurationInMinutes * 60 * 1000
  );
  return expirationDate;
}

export function removeItem(arr: unknown[], item: number | string) {
  const index = arr.indexOf(item);
  const newArr = [...arr.slice(0, index), ...arr.slice(index + 1)];
  return newArr;
}

const encodeParam = (name: string, value: unknown) => {
  if (
    value &&
    (typeof value === "boolean" || (typeof value === "string" && value !== ""))
  ) {
    return `${name}=${encodeURIComponent(String(value))}`;
  }
  return "";
};

export const encodeParams = (params: Record<string, unknown>) => {
  return Object.entries(params)
    .filter(([_, value]) => value) // Filter for truthy values
    .map(([name, value]) => encodeParam(name, value))
    .join("&");
};

export function parseParams(searchParams: URLSearchParams) {
  const output: Record<string, unknown> = {};
  // Set will return only unique keys()
  new Set([...searchParams.keys()]).forEach((key) => {
    output[key] =
      searchParams.getAll(key).length > 1
        ? searchParams.getAll(key)
        : searchParams.get(key);
  });
  return output;
}

type Timer = ReturnType<typeof setTimeout>;
export function debounce(func: Function, delay: number) {
  let timerId: NodeJS.Timeout | null;

  return function (...args: any[]) {
    clearTimeout(timerId!);

    timerId = setTimeout(() => {
      //@ts-ignore
      func.apply(this, args);
    }, delay);
  };
}

export function splitWordByLastHyphen(word: string): [string, string] {
  const lastHyphenIndex = word.lastIndexOf("-");

  if (lastHyphenIndex === -1) {
    // No hyphen found, return the original word and an empty string
    return [word, ""];
  }

  const firstPart = word.substring(0, lastHyphenIndex);
  const secondPart = word.substring(lastHyphenIndex + 1);

  return [firstPart, secondPart];
}

export function removeItemsByIndexes<T>(
  arr: T[],
  indexesToRemove: number[]
): T[] {
  // Sort the indexes in reverse order so that removal doesn't affect the positions of subsequent elements
  const sortedIndexes = indexesToRemove.slice().sort((a, b) => b - a);

  // Create a new array without the elements at the specified indexes
  const newArray: T[] = arr.filter((_, i) => !sortedIndexes.includes(i));

  return newArray;
}

export function removeSucceedingItems<T>(arr: T[], index: number): T[] {
  if (index >= arr.length || index < 0) {
    return [...arr];
  }

  return arr.slice(0, index + 1);
}

export const slugifyString = (value: string) => {
  return slugify(value, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
    replacement: "-",
  });
};

export function convertArrayItemsToStrings(
  inputArray: number[] | string[]
): string[] {
  // Create a new array to hold the converted strings
  const newArray: string[] = [];

  // Iterate through the input array and convert each item to a string
  for (const item of inputArray) {
    newArray.push(String(item));
  }

  return newArray;
}
