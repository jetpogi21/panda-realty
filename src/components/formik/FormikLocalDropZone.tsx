import { Button, buttonVariants } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import {
  FileValues,
  LocalDropZoneAPIResponse,
} from "@/interfaces/GeneralInterfaces";
import { cn } from "@/lib/utils";
import {
  allowedContentTextLabelGenerator,
  generatePermittedFileTypes,
  useUploadThing,
} from "@/utils/uploadthing";
import { formatFileSize } from "@/utils/utilities";
import { useFormikContext } from "formik";
import { X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { FileWithPath } from "react-dropzone";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useDropzone } from "react-dropzone";
import { toast } from "@/hooks/use-toast";
import { Card, CardDescription, CardHeader } from "@/components/ui/Card";
import { Icons } from "@/components/Icons";
import axiosClient from "@/utils/api";
import { UseMutationOptions, useMutation } from "@tanstack/react-query";

interface FormikLocalDropZoneDeleteProps {
  deleteRow: (idx: number) => void;
  pkField: string;
}

interface FormikLocalDropZoneProps extends FormikLocalDropZoneDeleteProps {
  setHasUpdate?: () => void;
  parent: string;
  fieldName: string;
  defaultValue?: Record<string, unknown>;
}

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
        type="button"
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
    <div className="flex items-center w-full gap-2 px-2 py-1 text-xs rounded-sm bg-accent whitespace-nowrap">
      <div className="mr-1">{fileName || "No File.JPEG"}</div>
      <span>({fileSize ? formatFileSize(fileSize!) : "0b"})</span>
      <Progress
        value={progress}
        className="w-[100px] h-2 ml-auto  bg-slate-500"
      />
    </div>
  );
};

interface UploadFilesPayload {
  files: File[];
}

const sendFileToServer = async (
  filePayload: UploadFilesPayload,
  onUploadProgress: (progress: number) => void
) => {
  const formData = new FormData();

  for (let i = 0; i < filePayload.files.length; i++) {
    formData.append(`file[${i}]`, filePayload.files[i]);
  }

  const { data } = (await axiosClient({
    url: `multi-upload`,
    method: "post",
    data: formData,
    onUploadProgress: (progressEvent) => {
      const progress =
        progressEvent && progressEvent.total
          ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
          : 0;

      onUploadProgress(progress);
    },
  })) as { data: LocalDropZoneAPIResponse };

  return data;
};

const useFileUploadMutation = (
  options: UseMutationOptions<unknown, Error, UploadFilesPayload>,
  setUploadProgress: React.Dispatch<React.SetStateAction<number>>
) => {
  const fileUploadMutation = useMutation<unknown, Error, UploadFilesPayload>({
    mutationFn: (filePayload: UploadFilesPayload) =>
      sendFileToServer(filePayload, setUploadProgress),
    ...options,
  });

  return { fileUploadMutation };
};

const getFormikValuePath = (parent: string, index: number, fieldName: string) =>
  `${parent}[${index}]${fieldName}`;

export const FormikLocalDropZone = ({
  setHasUpdate,
  parent,
  fieldName,
  deleteRow,
  pkField,
  defaultValue,
}: FormikLocalDropZoneProps) => {
  const { values, setFieldValue } = useFormikContext();
  //@ts-ignore
  const fieldValues: any[] = values[parent] || [];

  //@ts-ignore
  const rowCount = fieldValues.length;

  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const fileName_n = fieldName.replace("file", "fileName");
  const fileSize_n = fieldName.replace("file", "fileSize");

  //Mutation
  const { fileUploadMutation } = useFileUploadMutation(
    {
      onSuccess: (response) => {
        const localResponse = response as LocalDropZoneAPIResponse;
        if (localResponse.status === "success") {
          let i = 0;
          const newFiles = [];
          for (const url of localResponse.fileURLs) {
            let newFile = {
              [pkField]: "",
              [fieldName]: url,
              [fileName_n]: files[i].name,
              [fileSize_n]: files[i].size,
              touched: true,
            };

            if (defaultValue) {
              //@ts-ignore
              newFile = { ...newFile, ...defaultValue };
            }
            newFiles.push(newFile);
            i++;
          }

          setFieldValue(parent, [
            //@ts-ignore
            ...fieldValues,
            ...newFiles,
          ]);

          setHasUpdate && setHasUpdate();
          setFiles([]);
          toast({
            variant: "success",
            description: "File successfully uploaded.",
          });
          /* setFieldValue(filePath, localResponse.fileURL);
          setFieldValue(fileNamePath, fileName);
          setFieldValue(fileSizePath, fileSize); */
        } else {
          alert(`ERROR! ${localResponse.errorMsg}`);
        }
        setIsUploading(false);
        setProgress(0);
      },
      onError: (error) => {
        setIsUploading(false);
        setProgress(0);
        // Do something with the error.
        alert(`ERROR! ${error.message}`);
      },
    },
    setProgress
  );

  const calculatedTotalSize = files.reduce((acc, file) => acc + file.size, 0);
  const totalUploadedFileSize = calculatedTotalSize * (progress / 100); //convert to percentage
  let fileProgresses: number[] = [];
  let remainingFileSize = totalUploadedFileSize;

  for (const file of files) {
    let fileProgress = 0;
    let fileuploadedSize = 0;

    if (remainingFileSize > file.size) {
      fileProgress = 100;
      fileuploadedSize = file.size;
    } else {
      fileProgress = (remainingFileSize / file.size) * 100;
      fileuploadedSize = (fileProgress / 100) * file.size;
    }

    remainingFileSize -= fileuploadedSize;

    fileProgresses.push(Math.round(fileProgress));
  }

  const clearFileName = (index: number) => {
    deleteRow(index);
  };

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setFiles(acceptedFiles);
      setIsUploading(true);
      fileUploadMutation.mutate({ files: acceptedFiles });
    },
    [fileUploadMutation]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
  });

  return (
    <div
      className="space-y-8"
      style={{ gridArea: parent + "Files" }}
    >
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-1 p-8 border-4 border-dotted",
          {
            "border-primary": isDragActive,
          }
        )}
      >
        <div
          className="text-center"
          {...getRootProps()}
        >
          <Icons.uploadCloud className="w-24 h-24 mx-auto text-gray-400" />
          <div className="flex mt-4 text-sm leading-6 text-gray-600">
            <label
              htmlFor="file-upload"
              className="relative font-semibold text-blue-600 cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
            >
              {`Choose files`}
              <input
                className="sr-only"
                {...getInputProps()}
              />
            </label>
            <p className="pl-1">{`or drag and drop`}</p>
          </div>
          {/* {files.length > 0 && (
            <div className="flex items-center justify-center mt-4">
              <Button
                className={cn(
                  "flex items-center justify-center h-10 bg-blue-600 rounded-md w-36",
                  buttonVariants({ variant: "secondary", size: "sm" })
                )}
                disabled={isUploading}
                isLoading={isUploading}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (!files) return;

                  //void startUpload(files);
                }}
              >
                <span className="px-3 py-2 text-white">
                  {isUploading
                    ? "Uploading..."
                    : `Upload ${files.length} file${
                        files.length === 1 ? "" : "s"
                      }`}
                </span>
              </Button>
            </div>
          )} */}
        </div>
        {/* Upload/File list */}
      </div>
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold">Task Files</h1>
        <div className="flex flex-col-reverse gap-4">
          {fieldValues.filter((item) => item.file).length === 0 &&
            files.length === 0 && (
              <Card>
                <CardHeader>
                  <CardDescription>There is no file to show.</CardDescription>
                </CardHeader>
              </Card>
            )}
          {fieldValues
            .filter((item) => item.file)
            .map((item, index) => {
              return (
                <div
                  className="w-full"
                  key={`file${index}`}
                >
                  <Attachment
                    fileValues={{
                      fileName: item[fileName_n],
                      fileSize: item[fileSize_n],
                      file: item[fieldName],
                    }}
                    clearFileName={() => clearFileName(index)}
                  />
                </div>
              );
            })}
          {files.map((file, index) => {
            return (
              <div
                className="w-full"
                key={`toUpload${index}`}
              >
                <Uploading
                  fileValues={{
                    fileName: file.name,
                    fileSize: file.size,
                    file: "",
                  }}
                  progress={fileProgresses[index]}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
