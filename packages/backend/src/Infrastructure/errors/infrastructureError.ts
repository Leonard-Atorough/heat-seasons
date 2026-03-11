export type InfrastructureErrorDetails = Record<string, unknown>;

export interface InfrastructureErrorContext {
  details?: InfrastructureErrorDetails;
  cause?: unknown;
}

export class InfrastructureError extends Error {
  readonly details: InfrastructureErrorDetails;
  readonly cause?: unknown;

  constructor(
    name: string,
    message: string,
    { details = {}, cause }: InfrastructureErrorContext = {},
  ) {
    super(message);
    this.name = name;
    this.details = details;
    this.cause = cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class StorageError extends InfrastructureError {
  constructor(message: string, details: InfrastructureErrorDetails = {}, cause?: unknown) {
    super("StorageError", message, { details, cause });
  }
}

export class RepositoryWriteError extends InfrastructureError {
  constructor(message: string, details: InfrastructureErrorDetails = {}, cause?: unknown) {
    super("RepositoryWriteError", message, { details, cause });
  }
}

export class UniqueConstraintViolationError extends InfrastructureError {
  constructor(message: string, details: InfrastructureErrorDetails = {}, cause?: unknown) {
    super("UniqueConstraintViolationError", message, { details, cause });
  }
}

export class ForeignKeyConstraintError extends InfrastructureError {
  constructor(message: string, details: InfrastructureErrorDetails = {}, cause?: unknown) {
    super("ForeignKeyConstraintError", message, { details, cause });
  }
}