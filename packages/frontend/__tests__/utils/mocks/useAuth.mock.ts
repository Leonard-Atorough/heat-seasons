import { AuthContextType } from "@src/contexts";
import { mockAuthContext } from "./authContext.mock";

/**
 * Creates a mock return value for the `useAuth` hook.
 * Merges the base `mockAuthContext` with any provided overrides.
 */
export function createUseAuthMock(overrides: Partial<AuthContextType> = {}): AuthContextType {
  return {
    ...mockAuthContext,
    ...overrides,
  };
}
