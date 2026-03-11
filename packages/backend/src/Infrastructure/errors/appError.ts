export class AppError extends Error {
  public readonly cause?: unknown;

  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    public readonly message: string,
    public readonly details?: any,
    cause?: unknown,
  ) {
    super(message);
    this.name = this.constructor.name;
    this.cause = cause;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      statusCode: this.statusCode,
      message: this.message,
      details: this.details,
      timestamp: new Date().toISOString(),
    };
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: any, cause?: unknown) {
    super(404, "NOT_FOUND", message, details, cause);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, details?: any, cause?: unknown) {
    super(500, "INTERNAL_SERVER_ERROR", message, details, cause);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: any,
    public readonly validationErrors?: any[],
    cause?: unknown,
  ) {
    super(400, "VALIDATION_ERROR", message, details, cause);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: any, cause?: unknown) {
    super(401, "UNAUTHORIZED", message, details, cause);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any, cause?: unknown) {
    super(409, "CONFLICT", message, details, cause);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, details?: any, cause?: unknown) {
    super(403, "FORBIDDEN", message, details, cause);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: any, cause?: unknown) {
    super(400, "BAD_REQUEST", message, details, cause);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
