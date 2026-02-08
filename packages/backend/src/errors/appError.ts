export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    public readonly message: string,
    public readonly details?: any,
  ) {
    super(message);
    this.name = this.constructor.name;
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
  constructor(message: string, details?: any) {
    super(404, "NOT_FOUND", message, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export class InternalServerError extends AppError {
  constructor(message: string, details?: any) {
    super(500, "INTERNAL_SERVER_ERROR", message, details);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    details?: any,
    public readonly validationErrors?: any[],
  ) {
    super(400, "VALIDATION_ERROR", message, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, details?: any) {
    super(401, "UNAUTHORIZED", message, details);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string, details?: any) {
    super(403, "FORBIDDEN", message, details);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, details?: any) {
    super(400, "BAD_REQUEST", message, details);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
