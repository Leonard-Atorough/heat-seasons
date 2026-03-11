import { Request, Response } from "express";
import { AdminController } from "../../../src/api/admin/admin.controller";
import { UserResponse } from "../../../src/application/dtos/user.dto";
import { IAuthService } from "../../../src/api/auth/auth.service.interface";
import { IRacerService } from "../../../src/api/racer/racer.service.interface";
import { Racer, RacerWithStats } from "shared";
import { racers, users } from "../../fixtures";

function createUserResponse(overrides: Partial<UserResponse> = {}): UserResponse {
  const user = users.user();

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

function createRacerWithStats(overrides: Partial<RacerWithStats> = {}): RacerWithStats {
  return {
    ...racers.standard(),
    stats: null,
    ...overrides,
  };
}

describe("AdminController", () => {
  // 1. Given admin user-management requests, when listing, promoting, or demoting users, then the controller returns the expected status codes, validates simple bad requests, and forwards unexpected failures.
  // 2. Given racer-management requests, when creating, listing, updating, or deleting racers, then the controller maps params and body into service calls and returns thin success envelopes.
  // 3. Given invalid racer creation input, when required fields are missing, then the controller returns 400 without calling the service.

  let adminController: AdminController;
  let mockAuthService: jest.Mocked<IAuthService>;
  let mockRacerService: jest.Mocked<IRacerService>;
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    mockAuthService = {
      getAllUsers: jest.fn(),
      updateUserRole: jest.fn(),
      getMe: jest.fn(),
      generateToken: jest.fn(),
      upsertUser: jest.fn(),
      logout: jest.fn(),
      isTokenValid: jest.fn(),
    };
    mockRacerService = {
      create: jest.fn(),
      getAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getById: jest.fn(),
      getByUserId: jest.fn(),
      getStats: jest.fn(),
    };
    adminController = new AdminController(mockAuthService, mockRacerService);
    request = { body: {}, user: { id: "admin-1" } as any };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── listUsers ────────────────────────────────────────────────────

  describe("listUsers", () => {
    it("returns 200 with array of users", async () => {
      const listedUser = createUserResponse({ id: "user-1", name: "Alice" });

      mockAuthService.getAllUsers.mockResolvedValue([listedUser]);

      await adminController.listUsers(request as Request, response as Response, next);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          data: [listedUser],
        }),
      );
    });

    it("calls next with error when service throws", async () => {
      const error = new Error("Service error");
      mockAuthService.getAllUsers.mockRejectedValue(error);

      await adminController.listUsers(request as Request, response as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ── promoteUser ──────────────────────────────────────────────────

  describe("promoteUser", () => {
    it("returns 200 with updated user when promotion succeeds", async () => {
      const promotedUser = createUserResponse({ id: "user-1", role: "contributor" });

      mockAuthService.updateUserRole.mockResolvedValue(promotedUser);
      request.body = { userId: "user-1" };
      await adminController.promoteUser(request as Request, response as Response, next);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          data: promotedUser,
        }),
      );
    });

    it("returns 400 when userId is missing from body", async () => {
      request.body = {};
      await adminController.promoteUser(request as Request, response as Response, next);
      expect(response.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when admin tries to promote themselves", async () => {
      request.body = { userId: "admin-1" };
      await adminController.promoteUser(request as Request, response as Response, next);
      expect(response.status).toHaveBeenCalledWith(400);
    });

    it("calls next with error when service throws", async () => {
      const error = new Error("Service error");
      mockAuthService.updateUserRole.mockRejectedValue(error);
      request.body = { userId: "user-1" };
      await adminController.promoteUser(request as Request, response as Response, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ── demoteUser ───────────────────────────────────────────────────

  describe("demoteUser", () => {
    it("returns 200 with updated user when demotion succeeds", async () => {
      const demotedUser = createUserResponse({ id: "user-1", role: "user" });

      mockAuthService.updateUserRole.mockResolvedValue(demotedUser);
      request.body = { userId: "user-1" };
      await adminController.demoteUser(request as Request, response as Response, next);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          status: 200,
          statusText: "OK",
          data: demotedUser,
        }),
      );
    });

    it("returns 400 when userId is missing", async () => {
      request.body = {};
      await adminController.demoteUser(request as Request, response as Response, next);
      expect(response.status).toHaveBeenCalledWith(400);
    });

    it("returns 400 when admin tries to demote themselves", async () => {
      request.body = { userId: "admin-1" };
      await adminController.demoteUser(request as Request, response as Response, next);
      expect(response.status).toHaveBeenCalledWith(400);
    });

    it("calls next with error when service throws", async () => {
      const error = new Error("Service error");
      mockAuthService.updateUserRole.mockRejectedValue(error);
      request.body = { userId: "user-1" };
      await adminController.demoteUser(request as Request, response as Response, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ── createRacer ──────────────────────────────────────────────────

  describe("createRacer", () => {
    it("returns 201 with created racer when all required fields are provided", async () => {
      const createdRacer: Racer = racers.assignedToUser("user-7", { id: "racer-7" });

      request.body = {
        userId: "user-7",
        name: "Max Speed",
        team: "Falcon",
        teamColor: "#123456",
        nationality: "FR",
        age: 27,
      };
      mockRacerService.create.mockResolvedValue(createdRacer);

      await adminController.createRacer(request as Request, response as Response, next);

      expect(mockRacerService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-7",
          name: "Max Speed",
          active: true,
        }),
      );
      expect(response.status).toHaveBeenCalledWith(201);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          status: 201,
          data: createdRacer,
        }),
      );
    });

    it("returns 400 when required fields are missing", async () => {
      request.body = { name: "Max" }; // missing team, teamColor, nationality, age
      await adminController.createRacer(request as Request, response as Response, next);
      expect(response.status).toHaveBeenCalledWith(400);
    });

    it("assigns racer to the provided userId when present", async () => {
      request.body = {
        userId: "user-99",
        name: "Assigned Racer",
        team: "Rocket",
        teamColor: "#999999",
        nationality: "CA",
        age: 24,
      };
      mockRacerService.create.mockResolvedValue(racers.assignedToUser("user-99"));

      await adminController.createRacer(request as Request, response as Response, next);

      expect(mockRacerService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-99",
          name: "Assigned Racer",
        }),
      );
    });

    it("creates an unassigned racer when userId is omitted", async () => {
      request.body = {
        name: "Unassigned Racer",
        team: "Rocket",
        teamColor: "#444444",
        nationality: "US",
        age: 22,
      };
      mockRacerService.create.mockResolvedValue(racers.standard({ id: "racer-unassigned-1" }));

      await adminController.createRacer(request as Request, response as Response, next);

      expect(mockRacerService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          name: "Unassigned Racer",
          active: true,
        }),
      );
    });

    it("calls next with error when service throws", async () => {
      const error = new Error("Service error");
      mockRacerService.create.mockRejectedValue(error);
      request.body = {
        name: "Error Racer",
        team: "Error Team",
        teamColor: "#000000",
        nationality: "XX",
        age: 30,
      };
      await adminController.createRacer(request as Request, response as Response, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ── listRacers ───────────────────────────────────────────────────

  describe("listRacers", () => {
    it("returns 200 with array of racers", async () => {
      const listedRacer = createRacerWithStats({ id: "racer-2" });
      mockRacerService.getAll.mockResolvedValue([listedRacer]);

      await adminController.listRacers(request as Request, response as Response, next);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          status: 200,
          data: [listedRacer],
        }),
      );
    });

    it("calls next with error when service throws", async () => {
      const error = new Error("list failed");
      mockRacerService.getAll.mockRejectedValue(error);

      await adminController.listRacers(request as Request, response as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ── updateRacer ──────────────────────────────────────────────────

  describe("updateRacer", () => {
    it("returns 200 with updated racer on success", async () => {
      request.params = { racerId: "racer-2" };
      request.body = { team: "Updated Team" };
      mockRacerService.update.mockResolvedValue(
        racers.standard({ id: "racer-2", team: "Updated Team" }),
      );

      await adminController.updateRacer(request as Request, response as Response, next);

      expect(response.status).toHaveBeenCalledWith(200);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          status: 200,
          data: expect.objectContaining({ id: "racer-2", team: "Updated Team" }),
        }),
      );
    });

    it("calls racerService.update with the correct racerId and body", async () => {
      request.params = { racerId: "racer-2" };
      request.body = { team: "Updated Team" };
      mockRacerService.update.mockResolvedValue(
        racers.standard({ id: "racer-2", team: "Updated Team" }),
      );

      await adminController.updateRacer(request as Request, response as Response, next);

      expect(mockRacerService.update).toHaveBeenCalledWith("racer-2", { team: "Updated Team" });
    });

    it("calls next with error when service throws", async () => {
      const error = new Error("update failed");
      request.params = { racerId: "racer-2" };
      mockRacerService.update.mockRejectedValue(error);

      await adminController.updateRacer(request as Request, response as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  // ── deleteRacer ──────────────────────────────────────────────────

  describe("deleteRacer", () => {
    it("returns 204 on successful deletion", async () => {
      request.params = { racerId: "racer-2" };
      mockRacerService.delete.mockResolvedValue();

      await adminController.deleteRacer(request as Request, response as Response, next);

      expect(response.status).toHaveBeenCalledWith(204);
      expect(response.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          status: 204,
          data: null,
        }),
      );
    });

    it("calls racerService.delete with the correct racerId", async () => {
      request.params = { racerId: "racer-2" };
      mockRacerService.delete.mockResolvedValue();

      await adminController.deleteRacer(request as Request, response as Response, next);

      expect(mockRacerService.delete).toHaveBeenCalledWith("racer-2");
    });

    it("calls next with error when service throws", async () => {
      const error = new Error("delete failed");
      request.params = { racerId: "racer-2" };
      mockRacerService.delete.mockRejectedValue(error);

      await adminController.deleteRacer(request as Request, response as Response, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
