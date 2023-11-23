"use client";
import { BasicModel } from "@/interfaces/GeneralInterfaces";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { findModelUniqueFieldName } from "@/lib/findModelUniqueFieldName";
import axiosClient from "@/utils/api";
import { findConfigItem, findModelPrimaryKeyField } from "@/utils/utilities";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { boolean } from "zod";

interface GetResponse<T extends BasicModel> {
  count: number;
  rows: T[];
  cursor: string;
}

const fetchModelList = async <U extends BasicModel>(
  modelConfig: ModelConfig,
  endpoint: string,
  useName?: boolean
) => {
  const { data } = await axiosClient.get<GetResponse<U>>(endpoint, {
    params: {
      fetchCount: "false",
      simpleOnly: "true",
    },
  });

  const primaryKeyFieldName = findModelPrimaryKeyField(modelConfig).fieldName;
  const uniqueFieldName = findModelUniqueFieldName(modelConfig);

  return data.rows.map((item) => ({
    ...item,
    id: useName
      ? item[uniqueFieldName as keyof typeof item]
      : item[primaryKeyFieldName as keyof typeof item],
    name: item[uniqueFieldName as keyof typeof item],
  })) as BasicModel[];
};

interface UseListProps {
  placeholderData?: BasicModel[];
  useName?: boolean;
}

const useModelList = <T extends BasicModel>(
  modelConfig: ModelConfig,
  prop?: UseListProps
) => {
  //local states
  const [mounted, setMounted] = useState(false);
  const endpoint = modelConfig.modelPath;

  const [storedData, setStoredData] = useLocalStorage<T[]>(endpoint, []);

  const { data } = useQuery({
    queryKey: [`${endpoint}-list`],
    queryFn: () => fetchModelList<T>(modelConfig, endpoint, prop?.useName),
    enabled: mounted && storedData.length === 0,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (data) {
      setStoredData(data as T[]);
    }
  }, [data]);

  return storedData;
};

export default useModelList;
