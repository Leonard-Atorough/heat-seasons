import { User } from "shared";

/**
 * Default user fixture - standard unprivileged user
 */
const defaults: User = {
  id: "user-1",
  googleId: "google-1",
  email: "test@example.com",
  role: "user",
  name: "Test User",
  racerId: undefined,
  profilePicture: undefined,
};

/**
 * Create a user fixture with optional overrides
 * @example
 * const user = createUser({ name: "Alice" });
 * const admin = createUser({ role: "admin" });
 */
export function createUser(overrides: Partial<User> = {}): User {
  return { ...defaults, ...overrides };
}

/**
 * Pre-built user scenarios for common test cases
 */
export const users = {
  /** Standard unprivileged user */
  standard: () => createUser(),

  /** Admin user */
  admin: () =>
    createUser({
      id: "user-admin",
      googleId: "google-admin",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin",
    }),

  /** Contributor user */
  contributor: () =>
    createUser({
      id: "user-contributor",
      googleId: "google-contributor",
      name: "Contributor User",
      email: "contributor@example.com",
      role: "contributor",
    }),

  /** User linked to a racer */
  withRacerId: (racerId: string = "racer-1") =>
    createUser({
      id: "user-with-racer",
      googleId: "google-racer",
      name: "Racer User",
      email: "racer@example.com",
      racerId,
    }),

  /** User with profile picture */
  withProfilePicture: (url: string = "https://example.com/avatar.jpg") =>
    createUser({
      profilePicture: url,
    }),
};

/**
 * Create multiple users for list scenarios
 * @example
 * const allUsers = createUserList(5);
 * const admins = createUserList(3, { role: "admin" });
 */
export function createUserList(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, (_, i) =>
    createUser({
      id: `user-${i + 1}`,
      googleId: `google-${i + 1}`,
      email: `user${i + 1}@example.com`,
      name: `User ${i + 1}`,
      ...overrides,
    }),
  );
}

