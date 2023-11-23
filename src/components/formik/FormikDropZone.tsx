import { Button, buttonVariants } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import { FileValues } from "@/interfaces/GeneralInterfaces";
import { cn } from "@/lib/utils";
import {
  allowedContentTextLabelGenerator,
  generatePermittedFileTypes,
  useUploadThing,
} from "@/utils/uploadthing";
import { formatFileSize } from "@/utils/utilities";
import { useFormikContext } from "formik";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { FileWithPath } from "react-dropzone";
import { generateClientDropzoneAccept } from "uploadthing/client";
import { useDropzone } from "react-dropzone";
import { toast } from "@/hooks/use-toast";
import { Card, CardDescription, CardHeader } from "@/components/ui/Card";
import { Icons } from "@/components/Icons";

interface FormikDropZoneDeleteProps {
  deleteRow: (idx: number) => void;
  pkField: string;
}

interface FormikDropZone extends FormikDropZoneDeleteProps {
  setHasUpdate?: () => void;
  parent: string;
  fieldName: string;
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
        href={file || "/"}
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

const getFormikValuePath = (parent: string, index: number, fieldName: string) =>
  `${parent}[${index}]${fieldName}`;

export const FormikDropZone = ({
  setHasUpdate,
  parent,
  fieldName,
  deleteRow,
  pkField,
}: FormikDropZone) => {
  const { values, setFieldValue } = useFormikContext();
  //@ts-ignore
  const fieldValues = values[parent] as any[];
  //@ts-ignore
  const rowCount = fieldValues.length;

  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);

  const fileName_n = fieldName.replace("file", "fileName");
  const fileSize_n = fieldName.replace("file", "fileSize");

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

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing(
    "multiFileUploader",
    {
      onClientUploadComplete: (res) => {
        if (res) {
          let i = 0;
          const newFiles = [];
          for (const file of res) {
            newFiles.push({
              [pkField]: "",
              [fieldName]: file.url,
              [fileName_n]: file.name,
              [fileSize_n]: file.size,
              touched: true,
            });
            i++;
          }

          setFieldValue(parent, [
            //@ts-ignore
            ...values[parent].map((item) => ({ ...item })),
            ...newFiles.map((item) => ({ ...item })),
          ]);

          setHasUpdate && setHasUpdate();
          setFiles([]);
          setProgress(0);
          toast({
            variant: "success",
            description: "File successfully uploaded.",
          });
        }
      },
      onUploadProgress: (progress) => {
        setProgress(progress);
      },
      onUploadError: (error: Error) => {
        // Do something with the error.
        alert(`ERROR! ${error.message}`);
      },
    }
  );
  const { fileTypes, multiple } = generatePermittedFileTypes(
    permittedFileInfo?.config
  );

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: fileTypes ? generateClientDropzoneAccept(fileTypes) : undefined,
    disabled: isUploading || !fileTypes,
  });

  return (
    <div className="space-y-8">
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
          <div className="h-[1.25rem]">
            <p className="text-xs leading-5 text-gray-600">
              {allowedContentTextLabelGenerator(permittedFileInfo?.config)}
            </p>
          </div>
          {files.length > 0 && (
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

                  void startUpload(files);
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
          )}
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
