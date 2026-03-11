import { Request } from "express";
import {
  getUserRole,
  hasRole,
  hasAnyRole,
  isAdmin,
  assertRole,
  requireUserRole,
} from "../../../../src/Infrastructure/security/roleUtils";
import { TokenPayload } from "../../../../src/Infrastructure/security/jwt";
import { USER_ROLES } from "shared";

describe("roleUtils", () => {
  // 1. getUserRole returns null when user is not authenticated
  // 2. getUserRole returns role when user is authenticated with valid role
  // 3. getUserRole returns null when role is undefined
  // 4. hasRole returns true when user has the specified role
  // 5. hasRole returns false when user lacks the role
  // 6. hasRole returns false when unauthenticated
  // 7. hasAnyRole returns true when user has any of the specified roles
  // 8. hasAnyRole returns false when user has none of the roles
  // 9. hasAnyRole returns false when unauthenticated
  // 10. isAdmin returns true when user is admin
  // 11. isAdmin returns false when user is not admin
  // 12. assertRole throws when user lacks role
  // 13. assertRole throws when unauthenticated
  // 14. assertRole does not throw when user has role
  // 15. requireUserRole throws when unauthenticated
  // 16. requireUserRole throws when user has wrong role
  // 17. requireUserRole does not throw when user has correct role

  function createAuthenticatedRequest(role: string): any {
    return {
      user: { role } as TokenPayload,
    };
  }

  function createUnauthenticatedRequest(): any {
    return {
      user: undefined,
    };
  }

  describe("getUserRole", () => {
    it("returns null when user is not authenticated", () => {
      const req = createUnauthenticatedRequest();
      expect(getUserRole(req)).toBeNull();
    });

    it("returns role when user is authenticated with valid role", () => {
      const req = createAuthenticatedRequest(USER_ROLES.ADMIN);
      expect(getUserRole(req)).toBe(USER_ROLES.ADMIN);
    });

    it("returns role as UserRole when payload role is valid", () => {
      const req = createAuthenticatedRequest(USER_ROLES.CONTRIBUTOR);
      expect(getUserRole(req)).toBe(USER_ROLES.CONTRIBUTOR);
    });

    it("returns null when payload role is undefined", () => {
      const req = { user: {} } as Request;
      expect(getUserRole(req)).toBeNull();
    });
  });

  describe("hasRole", () => {
    it("returns true when user has the specified role", () => {
      const req = createAuthenticatedRequest(USER_ROLES.ADMIN);
      expect(hasRole(req, USER_ROLES.ADMIN)).toBe(true);
    });

    it("returns false when user has a different role", () => {
      const req = createAuthenticatedRequest(USER_ROLES.USER);
      expect(hasRole(req, USER_ROLES.ADMIN)).toBe(false);
    });

    it("returns false when user is not authenticated", () => {
      const req = createUnauthenticatedRequest();
      expect(hasRole(req, USER_ROLES.ADMIN)).toBe(false);
    });
  });

  describe("hasAnyRole", () => {
    it("returns true when user has one of the specified roles", () => {
      const req = createAuthenticatedRequest(USER_ROLES.CONTRIBUTOR);
      expect(hasAnyRole(req, USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR)).toBe(true);
    });

    it("returns true when user has any role in the list", () => {
      const req = createAuthenticatedRequest(USER_ROLES.ADMIN);
      expect(hasAnyRole(req, USER_ROLES.USER, USER_ROLES.ADMIN)).toBe(true);
    });

    it("returns false when user has none of the specified roles", () => {
      const req = createAuthenticatedRequest(USER_ROLES.USER);
      expect(hasAnyRole(req, USER_ROLES.ADMIN, USER_ROLES.CONTRIBUTOR)).toBe(false);
    });

    it("returns false when user is not authenticated", () => {
      const req = createUnauthenticatedRequest();
      expect(hasAnyRole(req, USER_ROLES.ADMIN, USER_ROLES.USER)).toBe(false);
    });

    it("returns true when user role matches only role in list", () => {
      const req = createAuthenticatedRequest(USER_ROLES.USER);
      expect(hasAnyRole(req, USER_ROLES.USER)).toBe(true);
    });
  });

  describe("isAdmin", () => {
    it("returns true when user is admin", () => {
      const req = createAuthenticatedRequest(USER_ROLES.ADMIN);
      expect(isAdmin(req)).toBe(true);
    });

    it("returns false when user is not admin", () => {
      const req = createAuthenticatedRequest(USER_ROLES.USER);
      expect(isAdmin(req)).toBe(false);
    });

    it("returns false when user is contributor but not admin", () => {
      const req = createAuthenticatedRequest(USER_ROLES.CONTRIBUTOR);
      expect(isAdmin(req)).toBe(false);
    });
  });

  describe("assertRole", () => {
    it("does not throw when user has the required role", () => {
      const req = createAuthenticatedRequest(USER_ROLES.ADMIN);
      expect(() => assertRole(req, USER_ROLES.ADMIN)).not.toThrow();
    });

    it("throws when user lacks the required role", () => {
      const req = createAuthenticatedRequest(USER_ROLES.USER);
      expect(() => assertRole(req, USER_ROLES.ADMIN)).toThrow("Access denied: admin role required");
    });

    it("throws when user is not authenticated", () => {
      const req = createUnauthenticatedRequest();
      expect(() => assertRole(req, USER_ROLES.ADMIN)).toThrow("Access denied: admin role required");
    });

    it("throws with correct role name in message", () => {
      const req = createAuthenticatedRequest(USER_ROLES.CONTRIBUTOR);
      expect(() => assertRole(req, USER_ROLES.ADMIN)).toThrow("admin");
    });
  });

  describe("requireUserRole", () => {
    it("does not throw when user is authenticated with correct role", () => {
      const req = createAuthenticatedRequest(USER_ROLES.ADMIN);
      expect(() => requireUserRole(req, USER_ROLES.ADMIN)).not.toThrow();
    });

    it("throws when user is not authenticated", () => {
      const req = createUnauthenticatedRequest();
      expect(() => requireUserRole(req, USER_ROLES.ADMIN)).toThrow("User not authenticated");
    });

    it("throws when user has wrong role", () => {
      const req = createAuthenticatedRequest(USER_ROLES.USER);
      expect(() => requireUserRole(req, USER_ROLES.ADMIN)).toThrow(
        "Access denied: admin role required",
      );
    });

    it("throws with correct error message when contributor needs admin", () => {
      const req = createAuthenticatedRequest(USER_ROLES.CONTRIBUTOR);
      expect(() => requireUserRole(req, USER_ROLES.ADMIN)).toThrow("admin");
    });
  });
});
