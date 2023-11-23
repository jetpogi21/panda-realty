import { useState } from "react";

export const useModelDeleteDialog = () => {
  const [isLoading, setIsLoading] = useState(false);

  return {
    isLoading,
    setIsLoading,
  };
};
