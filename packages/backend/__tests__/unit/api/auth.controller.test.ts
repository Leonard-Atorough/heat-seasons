import { NextFunction, Request, Response } from "express";
import { AuthController } from "../../../src/api/auth/auth.controller";
import { IAuthService } from "../../../src/api/auth/auth.service.interface";
import { UserResponse } from "../../../src/application/dtos/user.dto";
import { users } from "../../fixtures";

function createUserResponse(overrides: Partial<UserResponse> = {}): UserResponse {
  const user = users.admin();

  return {
    id: user.id,
    racerId: user.racerId,
    email: user.email,
    name: user.name,
    profilePicture: user.profilePicture,
    role: user.role,
    lastLoginAt: user.lastLoginAt instanceof Date ? user.lastLoginAt : undefined,
    loginCount: user.loginCount ?? 0,
    ...overrides,
  };
}

describe("AuthController", () => {
  // 1. Given an authenticated request, when fetching the current user, then the controller returns 200 with the service result and forwards failures to next.
  // 2. Given a successful Google callback, when the request contains a user, then the controller sets the auth cookie and redirects to the frontend callback.
  // 3. Given a failed Google callback, when the request does not contain a user, then the controller redirects to the login error page without generating a token.
  // 4. Given a logout request, when a token cookie exists, then the controller blacklists it, clears the cookie, and returns a success envelope.
  // 5. Given a logout request without a token or with a service failure, then the controller still clears the cookie when appropriate and forwards unexpected errors to next.

  let authController: AuthController;
  let mockAuthService: jest.Mocked<IAuthService>;
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockAuthService = {
      getMe: jest.fn(),
      generateToken: jest.fn(),
      upsertUser: jest.fn(),
      logout: jest.fn(),
      isTokenValid: jest.fn(),
      updateUserRole: jest.fn(),
      getAllUsers: jest.fn(),
    };

    authController = new AuthController(mockAuthService);
    request = {
      user: { id: "user-1" },
      cookies: {},
      body: {},
      params: {},
    };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn().mockReturnThis(),
      clearCookie: jest.fn().mockReturnThis(),
      redirect: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns the current user for an authenticated request", async () => {
    const currentUser = createUserResponse({ id: "user-1", role: "admin" });
    mockAuthService.getMe.mockResolvedValue(currentUser);

    await authController.getMe(request as Request, response as Response, next);

    expect(mockAuthService.getMe).toHaveBeenCalledWith("user-1");
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        status: 200,
        statusText: "OK",
        data: currentUser,
      }),
    );
  });

  it("forwards getMe errors to next", async () => {
    const error = new Error("lookup failed");
    mockAuthService.getMe.mockRejectedValue(error);

    await authController.getMe(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it("sets the auth cookie and redirects after a successful Google callback", async () => {
    const authenticatedUser = users.admin();
    mockAuthService.generateToken.mockReturnValue("signed-token");
    request.user = authenticatedUser;

    await authController.googleCallback(request as Request, response as Response, next);

    expect(mockAuthService.generateToken).toHaveBeenCalledWith(authenticatedUser);
    expect(response.cookie).toHaveBeenCalledWith(
      "token",
      "signed-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
        maxAge: 24 * 60 * 60 * 1000,
      }),
    );
    expect(response.redirect).toHaveBeenCalledWith(expect.stringContaining("/auth/callback"));
  });

  it("redirects to the login error page when the Google callback has no user", async () => {
    request.user = undefined;

    await authController.googleCallback(request as Request, response as Response, next);

    expect(mockAuthService.generateToken).not.toHaveBeenCalled();
    expect(response.cookie).not.toHaveBeenCalled();
    expect(response.redirect).toHaveBeenCalledWith(expect.stringContaining("/login?error=auth_failed"));
  });

  it("logs out a token-bearing request, clears the cookie, and returns success", async () => {
    request.cookies = { token: "signed-token" };

    await authController.logout(request as Request, response as Response, next);

    expect(mockAuthService.logout).toHaveBeenCalledWith("signed-token");
    expect(response.clearCookie).toHaveBeenCalledWith(
      "token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "lax",
      }),
    );
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        status: 200,
        statusText: "OK",
        data: null,
      }),
    );
  });

  it("clears the cookie without calling logout when no token is present", async () => {
    request.cookies = {};

    await authController.logout(request as Request, response as Response, next);

    expect(mockAuthService.logout).not.toHaveBeenCalled();
    expect(response.clearCookie).toHaveBeenCalled();
    expect(response.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it("forwards logout errors to next", async () => {
    const error = new Error("logout failed");
    request.cookies = { token: "signed-token" };
    mockAuthService.logout.mockRejectedValue(error);

    await authController.logout(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
