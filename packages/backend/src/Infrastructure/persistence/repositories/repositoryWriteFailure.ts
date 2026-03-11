import { RepositoryWriteError } from "../../../Infrastructure/errors/index.js";

export function wrapWriteFailure(
  message: string,
  details: Record<string, unknown>,
  error: unknown,
): RepositoryWriteError {
  return new RepositoryWriteError(message, details, error);
}