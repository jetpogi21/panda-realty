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
import { Paperclip, X } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { generateMimeTypes } from "uploadthing/client";

interface FormikFileInputProp {
  setArrayTouched?: () => void;
  setHasUpdate?: () => void;
  label?: string;
  helperText?: string;
  name: string;
  index?: number;
  parent?: string;
  fieldName?: string;
  onChange?: (newValue: unknown) => void;
  style?: React.CSSProperties;
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

export const FormikFileInput = ({
  setArrayTouched,
  setHasUpdate,
  helperText,
  name,
  index,
  parent,
  fieldName,
  label,
  onChange,
  style,
}: FormikFileInputProp) => {
  const { values, setFieldValue } = useFormikContext();

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

  const [progress, setProgress] = useState(0);

  const clearFileName = () => {
    setFieldValue(filePath, "");
    setFieldValue(fileNamePath, "");
    setFieldValue(fileSizePath, "");
    setProgress(0);
    setArrayTouched && setArrayTouched();
    setHasUpdate && setHasUpdate();
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const currentFile = e.target.files[0];
    setFieldValue(fileNamePath, currentFile.name);
    setFieldValue(fileSizePath, currentFile.size);

    void startUpload(Array.from(e.target.files));

    setArrayTouched && setArrayTouched();
    setHasUpdate && setHasUpdate();
    onChange && onChange(e.target.files);
  };

  const { startUpload, isUploading, permittedFileInfo } = useUploadThing(
    "fileUploader",
    {
      onClientUploadComplete: (res) => {
        if (res) {
          setFieldValue(filePath, res[0].url);
          setFieldValue(fileNamePath, res[0].name);
          setFieldValue(fileSizePath, res[0].size);
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
    <div
      className="flex flex-col items-center justify-center gap-1"
      style={style}
    >
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
          multiple={multiple}
          accept={generateMimeTypes(fileTypes ?? [])?.join(", ")}
          onChange={handleInputChange}
        />
        <span className="flex gap-1 px-3 py-2 text-white">
          {permittedFileInfo ? (
            <>
              <Paperclip className="w-4 h-4" />
              {`Choose File${multiple ? "(s)" : ""}`}
            </>
          ) : (
            "Loading..."
          )}
        </span>
      </label>
      <div className="h-[1.25rem]">
        {fileTypes && (
          <p className="text-xs leading-5 text-gray-600">
            {permittedFileInfo &&
              allowedContentTextLabelGenerator(permittedFileInfo?.config)}
          </p>
        )}
      </div>
    </div>
  );
};
