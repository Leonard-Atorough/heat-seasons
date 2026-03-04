import { ApplicationError } from "./application";

export class SeasonNotActiveError extends ApplicationError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super("SeasonNotActiveError", message, details);
  }
}

export class InvalidSeasonStateError extends ApplicationError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super("InvalidSeasonStateError", message, details);
  }
}

export class SeasonAlreadyExistsError extends ApplicationError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super("SeasonAlreadyExistsError", message, details);
  }
}

export class SeasonNotFoundError extends ApplicationError {
  constructor(message: string, details: Record<string, unknown> = {}) {
    super("SeasonNotFoundError", message, details);
  }
}