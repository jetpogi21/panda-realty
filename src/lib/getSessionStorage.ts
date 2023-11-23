export const getSessionStorage = <T>(key: string) => {
  if (typeof window === "undefined") {
    return undefined;
  }

  try {
    const item = window.sessionStorage.getItem(key);
    return item ? (parseJSON(item) as T) : undefined;
  } catch (error) {
    console.warn(`Error reading sessionStorage key “${key}”:`, error);
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
