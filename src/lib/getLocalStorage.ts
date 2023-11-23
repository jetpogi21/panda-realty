export const getLocalStorage = <T>(key: string) => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const item = window.localStorage.getItem(key);
    return item ? (parseJSON(item) as T) : undefined;
  } catch (error) {
    console.warn(`Error reading localStorage key “${key}”:`, error);
    return undefined;
  }
};

function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    return undefined;
  }
}
