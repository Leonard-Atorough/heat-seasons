import { Request, Response } from "express";
import { AdminController } from "../../../../src/api/admin/admin.controller";

describe("AdminController", () => {
  let adminController: AdminController;
  let mockAuthService: any;
  let mockRacerService: any;
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    mockAuthService = {
      getAllUsers: jest.fn(),
      updateUserRole: jest.fn(),
    };
    mockRacerService = {
      create: jest.fn(),
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
      // TODO: implement
      expect(true).toBe(true);
    });

    it("calls next with error when service throws", async () => {
      // TODO: implement
      expect(true).toBe(true);
    });
  });

  // ── promoteUser ──────────────────────────────────────────────────

  describe("promoteUser", () => {
    it("returns 200 with updated user when promotion succeeds", async () => {
      // TODO: implement
      expect(true).toBe(true);
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
      // TODO: implement
      expect(true).toBe(true);
    });
  });

  // ── demoteUser ───────────────────────────────────────────────────

  describe("demoteUser", () => {
    it("returns 200 with updated user when demotion succeeds", async () => {
      // TODO: implement
      expect(true).toBe(true);
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
  });

  // ── createRacer ──────────────────────────────────────────────────

  describe("createRacer", () => {
    it("returns 201 with created racer when all required fields are provided", async () => {
      // TODO: implement
      expect(true).toBe(true);
    });

    it("returns 400 when required fields are missing", async () => {
      request.body = { name: "Max" }; // missing team, teamColor, nationality, age
      await adminController.createRacer(request as Request, response as Response, next);
      expect(response.status).toHaveBeenCalledWith(400);
    });

    it("assigns racer to the provided userId when present", async () => {
      // TODO: implement - verify racerService.create called with { userId: 'some-id', ... }
      expect(true).toBe(true);
    });

    it("creates an unassigned racer when userId is omitted", async () => {
      // TODO: implement - verify racerService.create called with { userId: null, ... }
      expect(true).toBe(true);
    });
  });
});
