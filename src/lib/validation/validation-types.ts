type ValidationSuccess = { status: "success" };
interface ValidationError {
  status: "error";
  message: string;
}

export type ValidationResponse = ValidationSuccess | ValidationError;
