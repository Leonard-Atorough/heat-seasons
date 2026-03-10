import { NextFunction, Request, Response } from "express";
import { BootstrapController } from "../../../src/api/bootstrap/bootstrap.controller";
import { IBootstrapService } from "../../../src/api/bootstrap/bootstrap.service.interface";
import { BootstrapConfigResponse, UserResponse } from "../../../src/application/dtos";
import { users } from "../../fixtures";

function createBootstrapResponse(
  overrides: Partial<BootstrapConfigResponse> = {},
): BootstrapConfigResponse {
  return {
    bootstrapToken: "bootstrap-token",
    expiresAt: new Date("2026-03-10T01:00:00.000Z"),
    ...overrides,
  };
}

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

describe("BootstrapController", () => {
  // 1. Given initialization queries, when checking whether the system is bootstrapped, then the controller returns a 200 response with the boolean state.
  // 2. Given bootstrap token generation requests, when an expiration is provided, then the controller forwards the config and returns the service response.
  // 3. Given bootstrap admin creation requests, when the body is valid, then the controller forwards the payload and returns the created admin response.
  // 4. Given unexpected bootstrap-service failures, when controller actions run, then the controller forwards the error to next.

  let bootstrapController: BootstrapController;
  let mockBootstrapService: jest.Mocked<IBootstrapService>;
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockBootstrapService = {
      isSystemBootstrapped: jest.fn(),
      generateBootstrapToken: jest.fn(),
      bootstrapSystem: jest.fn(),
    };

    bootstrapController = new BootstrapController(mockBootstrapService);
    request = { body: {}, params: {}, query: {} };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns the current bootstrap initialization state", async () => {
    mockBootstrapService.isSystemBootstrapped.mockResolvedValue(true);

    await bootstrapController.isSystemBootstrapped(request as Request, response as Response, next);

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        status: 200,
        data: { isBootstrapped: true },
      }),
    );
  });

  it("generates a bootstrap token from the request body", async () => {
    const tokenResponse = createBootstrapResponse();
    request.body = { expirationMinutes: 45 };
    mockBootstrapService.generateBootstrapToken.mockResolvedValue(tokenResponse);

    await bootstrapController.generateBootstrapToken(request as Request, response as Response, next);

    expect(mockBootstrapService.generateBootstrapToken).toHaveBeenCalledWith({
      expirationMinutes: 45,
    });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        status: 200,
        data: tokenResponse,
      }),
    );
  });

  it("bootstraps the system with the request payload", async () => {
    const adminUser = createUserResponse({ id: "admin-1" });
    request.body = {
      token: "bootstrap-token",
      googleId: "google-admin-1",
      email: "admin@test.com",
      name: "Admin User",
    };
    mockBootstrapService.bootstrapSystem.mockResolvedValue(adminUser);

    await bootstrapController.bootstrapSystem(request as Request, response as Response, next);

    expect(mockBootstrapService.bootstrapSystem).toHaveBeenCalledWith(request.body);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        status: 200,
        data: adminUser,
      }),
    );
  });

  it("forwards bootstrap-service errors to next", async () => {
    const error = new Error("bootstrap failed");
    mockBootstrapService.isSystemBootstrapped.mockRejectedValue(error);

    await bootstrapController.isSystemBootstrapped(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});