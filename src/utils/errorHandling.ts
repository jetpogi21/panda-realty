import { NextResponse } from "next/server";
import { returnJSONResponse } from "./utils";

function handleSequelizeError(error: any) {
  console.log(error);
  const sequelizeErrors = [
    "SequelizeValidationError",
    "SequelizeUniqueConstraintError",
    "SequelizeDatabaseError",
  ];

  if (error.name === "SequelizeUniqueConstraintError") {
    const value = error.errors[0].value;
    return NextResponse.json(
      {},
      { status: 401, statusText: `"${value}" already exists.` }
    );
  } else if (sequelizeErrors.includes(error.name)) {
    return returnJSONResponse({
      status: "error",
      error: error.parent.sqlMessage,
      sqlMessage: error.sql,
      errorCode: 500,
    });
  } else {
    return NextResponse.json(error.message, {
      status: 401,
      statusText: error.message,
    });
  }
}

export default handleSequelizeError;
