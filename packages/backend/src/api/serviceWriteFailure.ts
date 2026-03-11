import { WriteError } from "src/domain/errors";
import { InfrastructureError } from "src/Infrastructure/errors";

export function mapWriteFailure(
  message: string,
  details: Record<string, unknown>,
  error: unknown,
): Error {
  if (error instanceof InfrastructureError) {
    return new WriteError(message, details, error);
  }

  return error instanceof Error ? error : new Error(message);
}

export async function wrapWriteOperation<T>(
  operation: () => Promise<T>,
  message: string,
  details: Record<string, unknown>,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw mapWriteFailure(message, details, error);
  }
}