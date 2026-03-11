export type ApplicationErrorDetails = Record<string, unknown>;

export interface ApplicationErrorContext {
  details?: ApplicationErrorDetails;
  cause?: unknown;
}

export class ApplicationError extends Error {
  readonly details: ApplicationErrorDetails;
  readonly cause?: unknown;

  constructor(
    name: string,
    message: string,
    { details = {}, cause }: ApplicationErrorContext = {},
  ) {
    super(message);
    this.name = name;
    this.details = details;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string, details: ApplicationErrorDetails = {}, cause?: unknown) {
    super("ForbiddenError", message, { details, cause });
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, details: ApplicationErrorDetails = {}, cause?: unknown) {
    super("NotFoundError", message, { details, cause });
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string, details: ApplicationErrorDetails = {}, cause?: unknown) {
    super("ConflictError", message, { details, cause });
  }
}

export class WriteError extends ApplicationError {
  constructor(message: string, details: ApplicationErrorDetails = {}, cause?: unknown) {
    super("WriteError", message, { details, cause });
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details: ApplicationErrorDetails = {}, cause?: unknown) {
    super("ValidationError", message, { details, cause });
  }
}

export class NotImplemented extends ApplicationError {
  constructor(message: string, details: ApplicationErrorDetails = {}, cause?: unknown) {
    super("NotImplemented", message, { details, cause });
  }
}

export class UnauthorisedError extends ApplicationError {
  constructor(message: string, details: ApplicationErrorDetails = {}, cause?: unknown) {
    super("UnauthorisedError", message, { details, cause });
  }
}
