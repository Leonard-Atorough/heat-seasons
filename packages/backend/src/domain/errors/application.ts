export class ApplicationError extends Error {
  name: string;
  details: Record<string, unknown>;
  message: string;

  constructor(name: string, message: string, details: Record<string, unknown> = {}) {
    super(message);
    this.name = name;
    this.message = message;
    this.details = details;
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super("ForbiddenError", message, details);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super("NotFoundError", message, details);
  }
}

export class NotImplemented extends ApplicationError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super("NotImplemented", message, details);
  }
}

export class UnauthorisedError extends ApplicationError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super("UnauthorisedError", message, details);
  }
}