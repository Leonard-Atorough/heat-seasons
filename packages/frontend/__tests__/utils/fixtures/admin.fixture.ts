import { AdminUser, AdminCreateRacerInput } from "src/models";
import { createUser } from "./user.fixture";

/**
 * Default AdminUser fixture - admin with login stats
 */
const defaultAdminUser: AdminUser = {
  ...createUser({ role: "admin" }),
  id: "admin-1",
  name: "Admin User",
  email: "admin@example.com",
  lastLoginAt: new Date().toISOString(),
  loginCount: 42,
};

/**
 * Create an AdminUser fixture with optional overrides
 * @example
 * const admin = createAdminUser({ name: "Super Admin", loginCount: 100 });
 */
export function createAdminUser(overrides: Partial<AdminUser> = {}): AdminUser {
  return { ...defaultAdminUser, ...overrides };
}

/**
 * Pre-built admin user scenarios
 */
export const adminUsers = {
  /** Default admin with typical stats */
  standard: () => createAdminUser(),

  /** Admin with no logins */
  neverLoggedIn: () =>
    createAdminUser({
      id: "admin-new",
      lastLoginAt: undefined,
      loginCount: 0,
    }),

  /** Admin with many logins */
  active: () =>
    createAdminUser({
      id: "admin-active",
      loginCount: 1000,
      lastLoginAt: new Date().toISOString(),
    }),
};

/**
 * Create multiple admin users for list scenarios
 * @example
 * const allAdmins = createAdminUserList(5);
 */
export function createAdminUserList(
  count: number,
  overrides: Partial<AdminUser> = {},
): AdminUser[] {
  return Array.from({ length: count }, (_, i) =>
    createAdminUser({
      id: `admin-${i + 1}`,
      email: `admin${i + 1}@example.com`,
      name: `Admin ${i + 1}`,
      loginCount: 10 + i * 15,
      ...overrides,
    }),
  );
}

/**
 * Default AdminCreateRacerInput fixture
 */
const defaultRacerInput: AdminCreateRacerInput = {
  name: "Max Verstappen",
  team: "Red Bull Racing",
  teamColor: "#0600ef",
  nationality: "Dutch",
  age: 27,
  active: true,
  badgeUrl: undefined,
  profileUrl: undefined,
  userId: undefined,
};

/**
 * Create an AdminCreateRacerInput fixture with optional overrides
 * @example
 * const input = createAdminRacerInput({ name: "Lewis Hamilton" });
 * const withUser = createAdminRacerInput({ userId: "user-1" });
 */
export function createAdminRacerInput(
  overrides: Partial<AdminCreateRacerInput> = {},
): AdminCreateRacerInput {
  return { ...defaultRacerInput, ...overrides };
}

/**
 * Pre-built racer input scenarios for common test cases
 */
export const racerInputs = {
  /** Standard racer input */
  standard: () => createAdminRacerInput(),

  /** With assigned user */
  withUser: (userId: string = "user-1") =>
    createAdminRacerInput({
      userId,
    }),

  /** With media (badge and profile) */
  withMedia: () =>
    createAdminRacerInput({
      badgeUrl: "https://example.com/badge.png",
      profileUrl: "https://example.com/profile.jpg",
    }),

  /** Inactive racer */
  inactive: () =>
    createAdminRacerInput({
      active: false,
    }),

  /** Minimal input (only required fields) */
  minimal: () =>
    createAdminRacerInput({
      badgeUrl: undefined,
      profileUrl: undefined,
      userId: undefined,
      active: true,
    }),
};

/**
 * Create multiple racer inputs for batch operations
 * @example
 * const inputs = createAdminRacerInputList(5);
 */
export function createAdminRacerInputList(
  count: number,
  overrides: Partial<AdminCreateRacerInput> = {},
): AdminCreateRacerInput[] {
  const teams = [
    { name: "Mercedes AMG", color: "#00d2be" },
    { name: "Red Bull Racing", color: "#0600ef" },
    { name: "Ferrari", color: "#dc0000" },
    { name: "McLaren", color: "#ff8700" },
    { name: "Alpine", color: "#0082fa" },
  ];

  return Array.from({ length: count }, (_, i) => {
    const team = teams[i % teams.length];
    return createAdminRacerInput({
      name: `Racer ${i + 1}`,
      team: team.name,
      teamColor: team.color,
      nationality: `Country${i + 1}`,
      age: 25 + (i % 15),
      active: i % 3 !== 0, // Some inactive
      ...overrides,
    });
  });
}
