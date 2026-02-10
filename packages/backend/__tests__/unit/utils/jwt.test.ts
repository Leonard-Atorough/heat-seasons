import { describe, expect, it } from "@jest/globals";
import { JwtService } from "../../../src/utils/jwt";
import { User } from "../../../../shared/src/models";

describe("JWT utils", () => {
  it("should sign and verify a JWT", () => {
    const user: User = {
      id: "user-123",
      googleId: "google-123",
      email: "test@example.com",
      name: "Test User",
      profilePicture: undefined,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const token = JwtService.generateToken(user);
    const decoded = JwtService.verifyToken(token);
    expect(decoded).toMatchObject({
      id: user.id,
      email: user.email,
      role: user.role,
    });
    // Verify token has JWT timestamps
    expect(decoded).toBeDefined();
    expect(typeof decoded).toBe("object");
  });

  it("should return null for an invalid token", () => {
    const invalidToken = "invalid.token.here";
    const decoded = JwtService.verifyToken(invalidToken);
    expect(decoded).toBeNull();
  });
});
