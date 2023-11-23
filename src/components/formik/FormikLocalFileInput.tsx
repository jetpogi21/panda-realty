import { Button, buttonVariants } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  FileValues,
  LocalFileInputAPIResponse,
} from "@/interfaces/GeneralInterfaces";
import { cn } from "@/lib/utils";
import axiosClient from "@/utils/api";
import {
  allowedContentTextLabelGenerator,
  generatePermittedFileTypes,
  useUploadThing,
} from "@/utils/uploadthing";
import { formatFileSize } from "@/utils/utilities";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";
import { useFormikContext } from "formik";
import { Paperclip, X } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { UploadFileResponse, generateMimeTypes } from "uploadthing/client";

interface FormikLocalFileInputProp {
  setArrayTouched?: () => void;
  setHasUpdate?: () => void;
  label?: string;
  helperText?: string;
  name: string;
  index?: number;
  parent?: string;
  fieldName?: string;
  onChange?: (newValue: unknown) => void;
}

interface UploadFilePayload {
  file: File;
}

const sendFileToServer = async (
  filePayload: UploadFilePayload,
  onUploadProgress: (progress: number) => void
) => {
  const formData = new FormData();
  formData.append("file", filePayload.file);

  const { data } = (await axiosClient({
    url: `upload`,
    method: "post",
    data: formData,
    onUploadProgress: (progressEvent) => {
      const progress =
        progressEvent && progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;
      onUploadProgress(progress);
    },
  })) as { data: LocalFileInputAPIResponse };

  return data;
};

const useFileUploadMutation = (
  options: UseMutationOptions<unknown, Error, File>
) => {
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileUploadMutation = useMutation<unknown, Error, File>({
    ...options,
    mutationFn: (file: File) => sendFileToServer({ file }, setUploadProgress),
  });

  return { fileUploadMutation, uploadProgress };
};

interface AttachmentProps {
  fileValues: FileValues;
  clearFileName: () => void;
}

const Attachment = ({ fileValues, clearFileName }: AttachmentProps) => {
  const { fileName, fileSize, file } = fileValues;

  return (
    <div className="flex items-center gap-2 px-2 py-1 text-xs rounded-sm bg-accent whitespace-nowrap">
      <a
        target="_blank"
        className="text-blue-500"
        href={process.env.NEXT_PUBLIC_DOMAIN! + "/tmp/" + file || "/"}
        download={fileName || "No File.JPEG"}
        rel="noopener noreferrer"
      >
        {fileName || "No File.JPEG"}
      </a>
      <span> ({fileSize ? formatFileSize(fileSize!) : "0b"})</span>

      <Button
        variant={"secondary"}
        className="h-3 p-0 ml-auto"
        onClick={clearFileName}
      >
        <X className="w-3 h-3 " />
      </Button>
    </div>
  );
};

interface UploadingProps {
  fileValues: FileValues;
  progress: number;
}

const Uploading = ({ fileValues, progress }: UploadingProps) => {
  const { fileName, fileSize, file } = fileValues;

  return (
    <div className="flex items-center gap-2 px-2 py-1 text-xs rounded-sm bg-accent whitespace-nowrap">
      <div className="mr-1">{fileName || "No File.JPEG"}</div>
      <span>({fileSize ? formatFileSize(fileSize!) : "0b"})</span>
      <Progress
        value={progress}
        className="w-[100px] h-2 ml-auto  bg-slate-500"
      />
    </div>
  );
};

export const FormikLocalFileInput = ({
  setArrayTouched,
  setHasUpdate,
  helperText,
  name,
  index,
  parent,
  fieldName,
  label,
  onChange,
}: FormikLocalFileInputProp) => {
  const { values, setFieldValue } = useFormikContext();

  const [isUploading, setIsUploading] = useState(false);

  const isRow = index !== undefined && parent && fieldName;

  const fileName_n = isRow
    ? fieldName.replace("file", "fileName")
    : name.replace("file", "fileName");

  const fileSize_n = isRow
    ? fieldName.replace("file", "fileSize")
    : name.replace("file", "fileSize");

  const filePath = name;
  const fileNamePath = isRow
    ? name.replace(fieldName, "fileName")
    : name.replace(name, "fileName");
  const fileSizePath = isRow
    ? name.replace(fieldName, "fileSize")
    : name.replace(name, "fileSize");

  //@ts-ignore
  const file = isRow ? values[parent][index][fieldName] : values[name];
  //@ts-ignore
  const fileName = isRow
    ? //@ts-ignore
      values[parent][index][fileName_n]
    : //@ts-ignore
      values[fileName_n];
  //@ts-ignore
  const fileSize = isRow
    ? //@ts-ignore
      values[parent][index][fileSize_n]
    : //@ts-ignore
      values[fileSize_n];
  const fileValues = { file, fileName, fileSize } as FileValues;

  //Mutation
  const { fileUploadMutation, uploadProgress: progress } =
    useFileUploadMutation({
      onSuccess: (response) => {
        const localResponse = response as LocalFileInputAPIResponse;
        if (localResponse.status === "success") {
          setFieldValue(filePath, localResponse.fileURL);
          setFieldValue(fileNamePath, fileName);
          setFieldValue(fileSizePath, fileSize);
        } else {
          alert(`ERROR! ${localResponse.errorMsg}`);
        }
        setIsUploading(false);
      },
      onError: (error) => {
        setIsUploading(false);
        // Do something with the error.
        alert(`ERROR! ${error.message}`);
      },
    });

  const clearFileName = () => {
    setFieldValue(filePath, "");
    setFieldValue(fileNamePath, "");
    setFieldValue(fileSizePath, "");
    setArrayTouched && setArrayTouched();
    setHasUpdate && setHasUpdate();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const currentFile = e.target.files[0];
    setFieldValue(fileNamePath, currentFile.name);
    setFieldValue(fileSizePath, currentFile.size);

    setIsUploading(true); // Set isUploading to true here
    //void startUpload(Array.from(e.target.files));
    fileUploadMutation.mutate(currentFile);
    //Should return the URL and the status or the error message if there's an error

    setArrayTouched && setArrayTouched();
    setHasUpdate && setHasUpdate();
    onChange && onChange(e.target.files);
  };

  if (isUploading) {
    return (
      <Uploading
        fileValues={fileValues}
        progress={progress}
      />
    );
  }

  if (file) {
    return (
      <div className="grid w-full gap-1.5">
        <Attachment
          fileValues={fileValues}
          clearFileName={clearFileName}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-1">
      {!!label && <div>{label}</div>}
      <label
        className={cn(
          "flex items-center justify-center rounded-md cursor-pointer",
          buttonVariants({ size: "sm", variant: "secondary" })
        )}
      >
        <input
          id={name}
          className="hidden"
          type="file"
          onChange={handleInputChange}
        />
        <span className="flex gap-1 px-3 py-2 dark:text-white">
          <>
            <Paperclip className="w-4 h-4" />
            Choose File
          </>
        </span>
      </label>
    </div>
  );
};
