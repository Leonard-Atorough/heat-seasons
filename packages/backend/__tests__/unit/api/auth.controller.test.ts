import { Request, Response } from "express";
import { AuthController } from "../../../src/api/auth/auth.controller";
import { AuthService } from "../../../src/api/auth/auth.service";
import { users } from "../../fixtures";
import { UserResponse } from "../../../src/application/dtos/user.dto";

describe("AuthController", () => {
  let authController: AuthController;
  let mockAuthService: jest.Mocked<AuthService>;
  let request: Partial<Request>;
  let response: Partial<Response>;

  beforeEach(() => {
    mockAuthService = {
      getMe: jest.fn(),
      upsertUser: jest.fn(),
      generateToken: jest.fn(),
      logout: jest.fn(),
    } as unknown as jest.Mocked<AuthService>;
    authController = new AuthController(mockAuthService);

    request = {
      params: {},
      body: {},
    };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  test("should authenticate with Google and return a token", async () => {
    const adminUser = users.admin();
    const mockUser: UserResponse = {
      id: adminUser.id,
      racerId: adminUser.racerId,
      email: adminUser.email,
      name: adminUser.name,
      profilePicture: adminUser.profilePicture,
      role: adminUser.role,
      lastLoginAt: adminUser.lastLoginAt instanceof Date ? adminUser.lastLoginAt : undefined,
      loginCount: adminUser.loginCount ?? 0,
    };

    mockAuthService.upsertUser.mockResolvedValue(mockUser);
    mockAuthService.generateToken.mockReturnValue("mock-token");
  });
});
