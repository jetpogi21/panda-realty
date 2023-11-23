import { useQueries } from "@tanstack/react-query";
import axiosClient from "@/utils/api";

function usePromiseAll(urls: Record<string, string>) {
  const results = useQueries({
    queries: Object.entries(urls).map(([key, url]) => {
      return {
        queryKey: [key, "simpleOnly"],
        queryFn: async () => {
          const response = await axiosClient.get(url, {
            params: { simpleOnly: true },
          });
          if (response.data.status === "success") {
            return response.data.data;
          } else {
            throw new Error("There was an error fetching data for " + key);
          }
        },
      };
    }),
  });

  // Map the results array to an object with the url contexts as keys
  const data = results.reduce((acc, result, i) => {
    return {
      ...acc,
      [urls[i]]: result.data,
    };
  }, {});

  // Check if any of the results are loading or have errors
  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const error = results.find((result) => result.error)?.error;

  return { isLoading, isError, error, data };
}

export default usePromiseAll;
