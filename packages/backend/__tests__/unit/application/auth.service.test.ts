import { Container } from "../../../src/Infrastructure/dependency-injection/container";
import { UserResponse } from "../../../src/application/dtos/user.dto";
import { UserCreateInput } from "../../../src/application/dtos/user.dto";
import { createUser, createUserList, users } from "../../fixtures";
import { createTestContainer, InMemoryStorageAdapter } from "../../testContainer";

interface PersistedUserRecord extends Record<string, unknown> {
  id: string;
  googleId: string;
  email: string;
  name: string;
  role: string;
  racerId?: string;
  profilePicture?: string;
  lastLoginAt?: Date;
  loginCount: number;
}

describe("AuthService", () => {
  // 1. Given persisted users, when listing all users, then the service returns matching user responses without sensitive fields.
  // 2. Given an existing user, when fetching the current user, then the service returns the user response without sensitive fields.
  // 3. Given a missing user, when fetching the current user, then the service throws a not found error.
  // 4. Given a new Google profile, when upserting the user, then the service creates a new persisted user with first-login metadata.
  // 5. Given an existing Google user, when upserting the user, then the service updates mutable fields, preserves the existing role, and increments login metadata.
  // 6. Given an existing user, when changing the role, then the service persists the updated role; and when the user is missing, it throws.
  // 7. Given a valid token, when logging out, then the token is blacklisted and no longer considered valid.

  let container: Container;
  let storageAdapter: InMemoryStorageAdapter;

  beforeEach(() => {
    container = createTestContainer();
    storageAdapter = container.getStorageAdapter() as InMemoryStorageAdapter;
  });

  afterEach(() => {
    Container.resetInstance();
    jest.clearAllMocks();
  });

  it("returns all users without sensitive information", async () => {
    const users = createUserList(3);
    storageAdapter.seed(
      "users",
      users.map((user) => ({ ...user })),
    );
    const authService = container.getAuthService();

    const allUsers: UserResponse[] = await authService.getAllUsers();

    expect(allUsers).toEqual(
      expect.arrayContaining(
        users.map((user) =>
          expect.objectContaining({
            id: user.id,
            email: user.email,
            role: user.role,
          }),
        ),
      ),
    );
    allUsers.forEach((user) => {
      expect(user).not.toHaveProperty("passwordHash");
      expect(user).not.toHaveProperty("googleId");
    });
  });

  it("returns the current user without sensitive information", async () => {
    const persistedUser = users.admin();

    storageAdapter.seed("users", [{ ...persistedUser }]);

    const authService = container.getAuthService();
    const currentUser = await authService.getMe(persistedUser.id);

    expect(currentUser).toEqual(
      expect.objectContaining({
        id: persistedUser.id,
        email: persistedUser.email,
        role: persistedUser.role,
        loginCount: persistedUser.loginCount,
      }),
    );
    expect(currentUser).not.toHaveProperty("googleId");
  });

  it("throws when the requested user does not exist", async () => {
    const authService = container.getAuthService();

    await expect(authService.getMe("missing-user")).rejects.toThrow("User not found");
  });

  it("creates a new user on first Google login", async () => {
    const authService = container.getAuthService();
    const profile: UserCreateInput = {
      googleId: "google-new-user",
      email: "new.user@test.com",
      name: "New User",
      role: "user",
      racerId: undefined,
      profilePicture: "https://example.com/avatar.png",
      lastLoginAt: undefined,
      loginCount: 0,
    };

    const createdUser = await authService.upsertUser(profile);
    const persistedUsers = storageAdapter.snapshot<PersistedUserRecord>("users");

    expect(createdUser).toEqual(
      expect.objectContaining({
        email: profile.email,
        name: profile.name,
        role: profile.role,
        profilePicture: profile.profilePicture,
        loginCount: 1,
      }),
    );
    expect(createdUser.id).toBeTruthy();
    expect(createdUser.lastLoginAt).toBeInstanceOf(Date);
    expect(persistedUsers).toHaveLength(1);
    expect(persistedUsers[0]).toEqual(
      expect.objectContaining({
        email: profile.email,
        googleId: profile.googleId,
        loginCount: 1,
      }),
    );
  });

  it("updates an existing Google user and preserves the existing role", async () => {
    const existingUser = users.admin({
      googleId: "google-existing-user",
      email: "old.email@test.com",
      name: "Old Name",
      profilePicture: undefined,
      racerId: undefined,
      loginCount: 4,
      lastLoginAt: new Date("2026-02-01T00:00:00.000Z"),
    });

    storageAdapter.seed("users", [{ ...existingUser }]);

    const authService = container.getAuthService();
    const profile: UserCreateInput = {
      googleId: existingUser.googleId,
      email: "updated.email@test.com",
      name: "Updated Name",
      role: "user",
      racerId: "racer-99",
      profilePicture: "https://example.com/updated-avatar.png",
      lastLoginAt: undefined,
      loginCount: 0,
    };

    const updatedUser = await authService.upsertUser(profile);
    const persistedUsers = storageAdapter.snapshot<PersistedUserRecord>("users");

    expect(updatedUser).toEqual(
      expect.objectContaining({
        id: existingUser.id,
        email: profile.email,
        name: profile.name,
        role: existingUser.role,
        racerId: profile.racerId,
        profilePicture: profile.profilePicture,
        loginCount: 5,
      }),
    );
    expect(updatedUser.lastLoginAt).toBeInstanceOf(Date);
    expect(persistedUsers).toHaveLength(1);
    expect(persistedUsers[0]).toEqual(
      expect.objectContaining({
        id: existingUser.id,
        googleId: existingUser.googleId,
        email: profile.email,
        name: profile.name,
        role: existingUser.role,
        racerId: profile.racerId,
        profilePicture: profile.profilePicture,
        loginCount: 5,
      }),
    );
  });

  it("updates a user role when the user exists", async () => {
    const persistedUser = users.user();

    storageAdapter.seed("users", [{ ...persistedUser }]);

    const authService = container.getAuthService();
    const updatedUser = await authService.updateUserRole(persistedUser.id, "contributor");
    const persistedUsers = storageAdapter.snapshot<PersistedUserRecord>("users");

    expect(updatedUser).toEqual(
      expect.objectContaining({
        id: persistedUser.id,
        role: "contributor",
      }),
    );
    expect(persistedUsers[0]).toEqual(
      expect.objectContaining({
        id: persistedUser.id,
        role: "contributor",
      }),
    );
  });

  it("throws when updating the role of a missing user", async () => {
    const authService = container.getAuthService();

    await expect(authService.updateUserRole("missing-user", "admin")).rejects.toThrow(
      "User not found",
    );
  });

  it("blacklists a token on logout and marks it invalid afterwards", async () => {
    const authService = container.getAuthService();
    const token = authService.generateToken(users.user());

    await expect(authService.isTokenValid(token)).resolves.toBe(true);

    await authService.logout(token);

    const blacklistedTokens = storageAdapter.snapshot<Record<string, unknown>>("blacklistedTokens");

    expect(blacklistedTokens).toHaveLength(1);
    expect(blacklistedTokens[0]).toEqual(
      expect.objectContaining({
        token,
      }),
    );
    expect(blacklistedTokens[0].expiresAt).toBeInstanceOf(Date);
    await expect(authService.isTokenValid(token)).resolves.toBe(false);
  });
});
