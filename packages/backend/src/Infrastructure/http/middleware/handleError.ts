import { NextFunction, Response, Request } from "express";
import { AppError } from "src/Infrastructure/errors/appError";
import { ApiResponse } from "shared/dist/api/ApiResponse";

export function handleError(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof AppError) {
    const response: ApiResponse<null> = {
      success: false,
      status: err.statusCode,
      statusText: err.code,
      timestamp: new Date(),
      message: err.message,
      data: null,
    };
    res.status(err.statusCode).json(response);
    return;
  }
  const response: ApiResponse<null> = {
    success: false,
    status: 500,
    statusText: "Internal Server Error",
    timestamp: new Date(),
    message: "An unexpected error occurred. Please try again later.",
    data: null,
  };
  res.status(500).json(response);
}
