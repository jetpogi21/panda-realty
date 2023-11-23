import axiosClient from "@/utils/api";
import { useMutation } from "@tanstack/react-query";

interface GenericMutationResponse {
  data: { data: "success" | "error" };
}

type onSuccessProp = (data: GenericMutationResponse["data"]) => void;

const mutationFn = async (endPoint: string) => {
  const { data } = (await axiosClient({
    url: endPoint,
    method: "post",
  })) as GenericMutationResponse;

  return data;
};

export const useGenericMutation = ({
  endPoint,
  onSuccess,
}: {
  endPoint: string;
  onSuccess?: onSuccessProp;
}) => {
  const _ = useMutation({
    mutationFn: () => mutationFn(endPoint),
    onSuccess: (data) => {
      if (data.data === "success") {
        onSuccess && onSuccess(data);
      }
    },
  });

  return _;
};
