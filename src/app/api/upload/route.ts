import { LocalFileInputAPIResponse } from "@/interfaces/GeneralInterfaces";
import { writeFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { existsSync, mkdirSync } from "fs";

function makeUrlFriendly(fileName: string): string {
  // Replace spaces with hyphens and remove special characters
  let urlFriendlyName = fileName.replace(/\s+/g, "-").replace(/[^\w\-.]/g, "");

  return urlFriendlyName;
}

export async function POST(request: NextRequest) {
  const data = await request.formData();

  const file: File | null = data.get("file") as unknown as File;

  let response: LocalFileInputAPIResponse = {
    status: "error",
    errorMsg: "File is empty.",
  };

  if (!file) {
    return NextResponse.json(response);
  }

  const fileName = file.name.split(".").slice(0, -1).join(".");
  const fileExt = file.name.split(".").slice(-1);
  let realFileName = makeUrlFriendly(`${fileName}.${fileExt}`);

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let path = `./public/tmp/${realFileName}`;

    if (!existsSync("./public/tmp")) {
      mkdirSync("./public/tmp");
    }

    if (existsSync(path)) {
      const timestamp = Date.now();
      realFileName = makeUrlFriendly(`${fileName}-${timestamp}.${fileExt}`);
      path = `./public/tmp/${realFileName}`;
    }

    await writeFile(path, buffer);

    response = {
      status: "success",
      fileURL: realFileName,
    };
  } catch (error) {
    console.log(error);

    response = {
      status: "error",
      errorMsg: "Something went wrong with the app.",
    };
  }

  return NextResponse.json(response);
}
