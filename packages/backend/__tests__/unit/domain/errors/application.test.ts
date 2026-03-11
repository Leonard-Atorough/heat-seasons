import {
  ApplicationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  WriteError,
  ValidationError,
  NotImplemented,
  UnauthorisedError,
} from "../../../../src/domain/errors/application";

describe("Domain Errors", () => {
  // 1. ApplicationError constructor with no options
  // 2. ApplicationError constructor with details only
  // 3. ApplicationError constructor with cause only
  // 4. ApplicationError constructor with both details and cause
  // 5. ForbiddenError with no options
  // 6. ForbiddenError with details
  // 7. ForbiddenError with cause
  // 8. NotFoundError with no options
  // 9. NotFoundError with details
  // 10. ConflictError with no options
  // 11. ConflictError with details
  // 12. WriteError with no options
  // 13. WriteError with cause
  // 14. ValidationError with no options
  // 15. NotImplemented with no options
  // 16. UnauthorisedError with no options
  // 17. Error instanceof checks

  describe("ApplicationError", () => {
    it("creates error with name and message only", () => {
      const error = new ApplicationError("TestError", "Test message");
      expect(error.name).toBe("TestError");
      expect(error.message).toBe("Test message");
      expect(error.details).toEqual({});
      expect(error.cause).toBeUndefined();
    });

    it("creates error with details", () => {
      const details = { code: "TEST_CODE", value: 123 };
      const error = new ApplicationError("TestError", "message", { details });
      expect(error.details).toEqual(details);
    });

    it("creates error with cause", () => {
      const cause = new Error("Root cause");
      const error = new ApplicationError("TestError", "message", { cause });
      expect(error.cause).toBe(cause);
    });

    it("creates error with both details and cause", () => {
      const details = { key: "value" };
      const cause = new Error("Root error");
      const error = new ApplicationError("TestError", "message", { details, cause });
      expect(error.details).toEqual(details);
      expect(error.cause).toBe(cause);
    });

    it("is instance of Error", () => {
      const error = new ApplicationError("TestError", "message");
      expect(error instanceof Error).toBe(true);
    });
  });

  describe("ForbiddenError", () => {
    it("creates error with default details and no cause", () => {
      const error = new ForbiddenError("Access forbidden");
      expect(error.name).toBe("ForbiddenError");
      expect(error.message).toBe("Access forbidden");
      expect(error.details).toEqual({});
      expect(error.cause).toBeUndefined();
    });

    it("creates error with details", () => {
      const details = { resource: "document" };
      const error = new ForbiddenError("Access forbidden", details);
      expect(error.details).toEqual(details);
    });

    it("creates error with details and cause", () => {
      const details = { action: "delete" };
      const cause = new Error("Policy violation");
      const error = new ForbiddenError("Access forbidden", details, cause);
      expect(error.details).toEqual(details);
      expect(error.cause).toBe(cause);
    });

    it("is instance of ApplicationError", () => {
      const error = new ForbiddenError("message");
      expect(error instanceof ApplicationError).toBe(true);
    });
  });

  describe("NotFoundError", () => {
    it("creates error with message", () => {
      const error = new NotFoundError("User not found");
      expect(error.name).toBe("NotFoundError");
      expect(error.message).toBe("User not found");
    });

    it("creates error with details about missing resource", () => {
      const details = { userId: "user-123" };
      const error = new NotFoundError("User not found", details);
      expect(error.details).toEqual(details);
    });

    it("creates error with cause", () => {
      const cause = new Error("DB query failed");
      const error = new NotFoundError("User not found", {}, cause);
      expect(error.cause).toBe(cause);
    });
  });

  describe("ConflictError", () => {
    it("creates error with conflict message", () => {
      const error = new ConflictError("Resource already exists");
      expect(error.name).toBe("ConflictError");
    });

    it("creates error with conflict details", () => {
      const details = { resourceId: "race-1", seasonId: "season-1" };
      const error = new ConflictError("Duplicate registration", details);
      expect(error.details).toEqual(details);
    });
  });

  describe("WriteError", () => {
    it("creates error for write failures", () => {
      const error = new WriteError("Failed to write data");
      expect(error.name).toBe("WriteError");
    });

    it("creates error with write failure details", () => {
      const details = { operation: "insert", table: "races" };
      const error = new WriteError("Database write failed", details);
      expect(error.details).toEqual(details);
    });

    it("captures cause from write operation", () => {
      const dbError = new Error("SQLite constraint violation");
      const error = new WriteError("Insert failed", {}, dbError);
      expect(error.cause).toBe(dbError);
    });
  });

  describe("ValidationError", () => {
    it("creates validation error", () => {
      const error = new ValidationError("Invalid input");
      expect(error.name).toBe("ValidationError");
    });

    it("includes validation error details", () => {
      const details = { field: "email", reason: "invalid format" };
      const error = new ValidationError("Bad request", details);
      expect(error.details).toEqual(details);
    });
  });

  describe("NotImplemented", () => {
    it("creates not implemented error", () => {
      const error = new NotImplemented("Feature not yet available");
      expect(error.name).toBe("NotImplemented");
    });

    it("includes not implemented details", () => {
      const details = { endpoint: "/api/advanced-stats", feature: "analytics" };
      const error = new NotImplemented("Endpoint not ready", details);
      expect(error.details).toEqual(details);
    });
  });

  describe("UnauthorisedError", () => {
    it("creates unauthorised error", () => {
      const error = new UnauthorisedError("Invalid credentials");
      expect(error.name).toBe("UnauthorisedError");
    });

    it("includes authentication error details", () => {
      const details = { attempts: 3 };
      const error = new UnauthorisedError("Too many login attempts", details);
      expect(error.details).toEqual(details);
    });
  });

  describe("Error polymorphism", () => {
    it("all errors are instanceof Error", () => {
      const errors = [
        new ApplicationError("Test", "msg"),
        new ForbiddenError("msg"),
        new NotFoundError("msg"),
        new ConflictError("msg"),
        new WriteError("msg"),
        new ValidationError("msg"),
        new NotImplemented("msg"),
        new UnauthorisedError("msg"),
      ];

      errors.forEach((error) => {
        expect(error instanceof Error).toBe(true);
      });
    });

    it("specific errors are instances of ApplicationError", () => {
      const errors = [
        new ForbiddenError("msg"),
        new NotFoundError("msg"),
        new ConflictError("msg"),
        new WriteError("msg"),
        new ValidationError("msg"),
        new NotImplemented("msg"),
        new UnauthorisedError("msg"),
      ];

      errors.forEach((error) => {
        expect(error instanceof ApplicationError).toBe(true);
      });
    });
  });
});
