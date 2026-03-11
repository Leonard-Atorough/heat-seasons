import { User } from "../../../shared/src/index";

const defaults: User = {
  id: "user-1",
  googleId: "google-user-1",
  email: "user@test.com",
  name: "Test User",
  role: "user",
  racerId: undefined,
  profilePicture: undefined,
  lastLoginAt: undefined,
  loginCount: 0,
};

export function createUser(overrides: Partial<User> = {}): User {
  return { ...defaults, ...overrides };
}

export const users = {
  standard: (overrides: Partial<User> = {}) => createUser(overrides),

  user: (overrides: Partial<User> = {}) =>
    createUser({
      id: "user-1",
      googleId: "google-user-1",
      email: "user@test.com",
      name: "Test User",
      role: "user",
      ...overrides,
    }),

  admin: (overrides: Partial<User> = {}) =>
    createUser({
      id: "admin-1",
      googleId: "google-admin-1",
      email: "admin@test.com",
      name: "Admin User",
      role: "admin",
      lastLoginAt: new Date("2026-01-01T00:00:00.000Z"),
      loginCount: 12,
      ...overrides,
    }),

  contributor: (overrides: Partial<User> = {}) =>
    createUser({
      id: "contributor-1",
      googleId: "google-contributor-1",
      email: "contributor@test.com",
      name: "Contributor User",
      role: "contributor",
      lastLoginAt: new Date("2026-01-01T00:00:00.000Z"),
      loginCount: 5,
      ...overrides,
    }),

  withRacerId: (racerId: string = "racer-1", overrides: Partial<User> = {}) =>
    createUser({
      id: "user-with-racer-1",
      googleId: "google-user-with-racer-1",
      email: "racer-user@test.com",
      name: "Racer User",
      racerId,
      ...overrides,
    }),
};

export function createUserList(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, (_, index) =>
    createUser({
      id: `user-${index + 1}`,
      googleId: `google-user-${index + 1}`,
      email: `user${index + 1}@test.com`,
      name: `Test User ${index + 1}`,
      ...overrides,
    }),
  );
}
