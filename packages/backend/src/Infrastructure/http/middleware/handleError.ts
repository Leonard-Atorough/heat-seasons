import { NextFunction, Response, Request } from "express";
import { AppError } from "src/Infrastructure/errors/appError";
import { ApiResponse } from "shared/dist/api/ApiResponse";
import { logger as rootLogger } from "src/Infrastructure/logging/logger";

export function handleError(err: Error, req: Request, res: Response, next: NextFunction): void {
  // Prefer the request-scoped child logger (carries reqId) when available.
  const log = (req as any).log ?? rootLogger;

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      log.error({ err, path: req.path, method: req.method }, err.message);
    } else {
      log.warn({ err, path: req.path, method: req.method }, err.message);
    }
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

  log.error({ err, path: req.path, method: req.method }, "Unhandled error");
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
