import { LocalDropZoneAPIResponse } from "@/interfaces/GeneralInterfaces";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { existsSync, mkdirSync } from "fs";

const makeUrlFriendly = (fileName: string): string => {
  return fileName.replace(/\s+/g, "-").replace(/[^\w\-.]/g, "");
};

const getUniqueName = (fileName: string, fileExt: string): string => {
  const baseName = makeUrlFriendly(fileName);
  let newFileName = `${baseName}.${fileExt}`;
  let path = `./public/tmp/${newFileName}`;

  if (!existsSync("./public/tmp")) {
    mkdirSync("./public/tmp");
  }

  if (existsSync(path)) {
    const timestamp = Date.now();
    newFileName = makeUrlFriendly(`${baseName}-${timestamp}.${fileExt}`);
  }

  return newFileName;
};

// Extracted function for processing a file
const processFile = async (file: File) => {
  const [fileName, fileExt] = file.name.split(".");
  const newFileName = getUniqueName(fileName, fileExt);
  const path = `./public/tmp/${newFileName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (!existsSync(path)) {
    await writeFile(path, buffer);
  }
  return newFileName;
};

export const POST = async (request: NextRequest) => {
  try {
    const data = await request.formData();

    const files: File[] = [];

    // Use for...of loop instead of while loop
    for (let i = 0; data.get(`file[${i}]`) !== null; i++) {
      const file = data.get(`file[${i}]`) as File;
      files.push(file);
    }

    if (files.length === 0) {
      return NextResponse.json({
        status: "error",
        errorMsg: "No files uploaded.",
      });
    }

    const fileURLs: string[] = await Promise.all(files.map(processFile));

    return NextResponse.json({
      status: "success",
      fileURLs: await Promise.all(fileURLs),
    });
  } catch (error) {
    console.log(error);

    // Improved error handling
    return NextResponse.json({
      status: "error",
      errorMsg: "Something went wrong.",
    });
  }
};
