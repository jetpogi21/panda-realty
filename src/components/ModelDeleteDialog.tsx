"use client";
import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import axiosClient from "@/utils/api";
import { useMutation } from "@tanstack/react-query";
import { ModelConfig } from "@/interfaces/ModelConfig";
import { FormikProps } from "formik";
import { findModelPrimaryKeyField } from "@/utils/utilities";

interface ModelDeleteDialogProps<T> {
  onSuccess?: () => void;
  modelConfig: ModelConfig;
  formik?: FormikProps<T>;
  resetRowSelection?: () => void;
  recordsToDelete: string[];
  setRecordsToDelete: (recordsToDelete: string[]) => void;
}

export const ModelDeleteDialog = <T, U>({
  onSuccess,
  formik,
  modelConfig,
  resetRowSelection,
  recordsToDelete,
  setRecordsToDelete,
}: ModelDeleteDialogProps<T>) => {
  const [mounted, setMounted] = useState(false);

  const { pluralizedModelName, verboseModelName, pluralizedVerboseModelName } =
    modelConfig;

  const primaryKeyFieldName = findModelPrimaryKeyField(modelConfig).fieldName;

  const deleteModels = async (payload: U) => {
    if (modelConfig.disableAPIDelete) {
      return {};
    }

    const { data } = await axiosClient({
      url: modelConfig.modelPath,
      method: "delete",
      data: payload,
    });

    return data;
  };

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: deleteModels,
    onMutate: () => {
      if (formik) {
        const rows = formik.values[
          pluralizedModelName as keyof typeof formik.values
        ] as Record<string, unknown>[];

        formik.setFieldValue(
          pluralizedModelName,
          rows.filter(
            (item) =>
              !recordsToDelete.includes(
                (item[primaryKeyFieldName] as string).toString()
              )
          )
        );

        setRecordsToDelete([]);
        resetRowSelection && resetRowSelection();
      }
    },
    onSuccess: (data) => {
      onSuccess && onSuccess();
    },
  });

  //state transformation
  const open = recordsToDelete.length > 0;
  const s = recordsToDelete.length > 1 ? "s" : "";
  const caption =
    recordsToDelete.length > 1 ? pluralizedVerboseModelName : verboseModelName;

  const mutateModel = () => {
    mutate &&
      mutate({ [`deleted${pluralizedModelName}`]: recordsToDelete } as U);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    mounted && (
      <Dialog open={open}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogPrimitive.Close
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={() => setRecordsToDelete([])}
            disabled={isLoading}
          >
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <DialogHeader>
            <DialogTitle>{`Delete ${caption}`}</DialogTitle>
            <DialogDescription>
              {`This will permanently delete the selected record${s}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              size="sm"
              variant={"destructive"}
              isLoading={isLoading}
              onClick={mutateModel}
            >
              Proceed
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={resetRowSelection}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  );
};
