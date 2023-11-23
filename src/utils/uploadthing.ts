import { generateComponents } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react/hooks";

import type { OurFileRouter } from "@/app/api/uploadthing/core";

export const generatePermittedFileTypes = (config?: any) => {
  const fileTypes = config ? Object.keys(config) : [];

  const maxFileCount = config
    ? Object.values(config).map((v: any) => v.maxFileCount)
    : [];

  return { fileTypes, multiple: maxFileCount.some((v) => v && v > 1) };
};

const capitalizeStart = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const INTERNAL_doFormatting = (config?: Record<string, unknown>): string => {
  if (!config) return "";

  const allowedTypes = Object.keys(config) as (keyof any)[];

  const formattedTypes = allowedTypes.map((f) => (f === "blob" ? "file" : f));

  // Format multi-type uploader label as "Supports videos, images and files";
  if (formattedTypes.length > 1) {
    const lastType = formattedTypes.pop() as string | number;
    return `${formattedTypes.join("s, ")} and ${lastType}s`;
  }

  // Single type uploader label
  const key = allowedTypes[0] as string;
  const formattedKey = formattedTypes[0] as string;

  //@ts-ignore
  const { maxFileSize, maxFileCount } = config[key]!;

  if (maxFileCount && maxFileCount > 1) {
    return `${formattedKey}s up to ${maxFileSize}, max ${maxFileCount}`;
  } else {
    return `${formattedKey} (${maxFileSize})`;
  }
};

export const allowedContentTextLabelGenerator = (
  config?: Record<string, unknown>
): string => {
  return capitalizeStart(INTERNAL_doFormatting(config));
};

export const { UploadButton, UploadDropzone, Uploader } =
  generateComponents<OurFileRouter>();

export const { useUploadThing, uploadFiles } =
  generateReactHelpers<OurFileRouter>();
