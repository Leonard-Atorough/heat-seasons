import { ApiError, ValidationResult } from "@shared/models";

export class AppError extends Error {
  constructor(public apiError: ApiError) {
    super(apiError.message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: any) {
    super({
      code: "NOT_FOUND",
      statusCode: 404,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
    this.name = "NotFoundError";
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, details?: any) {
    super({
      code: "INTERNAL_SERVER_ERROR",
      statusCode: 500,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
    this.name = "InternalServerError";
  }
}
export class ValidationError extends AppError {
  constructor(message: string, details?: any, validationErrors?: ValidationResult) {
    super({
      code: "VALIDATION_ERROR",
      statusCode: 400,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: any) {
    super({
      code: "UNAUTHORIZED",
      statusCode: 401,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, details?: any) {
    super({
      code: "FORBIDDEN",
      statusCode: 403,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
    this.name = "ForbiddenError";
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: any) {
    super({
      code: "BAD_REQUEST",
      statusCode: 400,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
    this.name = "BadRequestError";
  }
}
