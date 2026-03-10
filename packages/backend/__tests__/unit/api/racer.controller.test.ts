import { NextFunction, Request, Response } from "express";
import { RacerController } from "../../../src/api/racer/racer.controller";
import { IRacerService } from "../../../src/api/racer/racer.service.interface";
import { RacerWithStats } from "shared";
import { racers } from "../../fixtures";

function createRacerWithStats(overrides: Partial<RacerWithStats> = {}): RacerWithStats {
  return {
    ...racers.standard(),
    stats: null,
    ...overrides,
  };
}

describe("RacerController", () => {
  // 1. Given list and lookup requests, when query params or ids are provided, then the controller translates them into service inputs and returns thin envelopes.
  // 2. Given missing racer data, when the service returns null for lookup methods, then the controller returns 404 responses instead of throwing.
  // 3. Given create, update, and delete requests, when the request is valid, then the controller injects the authenticated user id where needed and forwards service errors to next.

  let racerController: RacerController;
  let mockRacerService: jest.Mocked<IRacerService>;
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRacerService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      getByUserId: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getStats: jest.fn(),
    };

    racerController = new RacerController(mockRacerService);
    request = { params: {}, query: {}, body: {}, user: { id: "user-1" } };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("parses the active filter and returns racers", async () => {
    const listedRacer = createRacerWithStats({ id: "racer-1" });
    request.query = { active: "true" };
    mockRacerService.getAll.mockResolvedValue([listedRacer]);

    await racerController.getAll(request as Request, response as Response, next);

    expect(mockRacerService.getAll).toHaveBeenCalledWith({ active: true });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        status: 200,
        data: [listedRacer],
      }),
    );
  });

  it("returns 404 when a racer lookup by id or user id does not find a racer", async () => {
    request.params = { id: "missing-racer" };
    mockRacerService.getById.mockResolvedValue(null);

    await racerController.getById(request as Request, response as Response, next);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 404,
        data: null,
      }),
    );

    request.params = { userId: "user-2" };
    request.user = { id: "user-1" };
    mockRacerService.getByUserId.mockResolvedValue(null);

    await racerController.getByUserId(request as Request, response as Response, next);

    expect(mockRacerService.getByUserId).toHaveBeenCalledWith("user-1");
    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("creates, updates, and deletes racers using request params and authenticated user context", async () => {
    const createdRacer = racers.assignedToUser("user-1", { id: "racer-1" });
    request.body = {
      userId: "forged-user",
      name: "Driver One",
      team: "Comet",
      teamColor: "#101010",
      nationality: "CA",
      age: 24,
      active: true,
    };
    mockRacerService.create.mockResolvedValue(createdRacer);

    await racerController.create(request as Request, response as Response, next);

    expect(mockRacerService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        name: "Driver One",
      }),
    );
    expect(response.status).toHaveBeenCalledWith(201);

    request.params = { id: "racer-1" };
    request.body = { team: "Nova" };
    mockRacerService.update.mockResolvedValue(racers.standard({ id: "racer-1", team: "Nova" }));

    await racerController.update(request as Request, response as Response, next);

    expect(mockRacerService.update).toHaveBeenCalledWith("racer-1", { team: "Nova" });
    expect(response.status).toHaveBeenCalledWith(200);

    mockRacerService.delete.mockResolvedValue();
    await racerController.delete(request as Request, response as Response, next);

    expect(mockRacerService.delete).toHaveBeenCalledWith("racer-1");
    expect(response.status).toHaveBeenCalledWith(204);
  });

  it("forwards unexpected racer-service errors to next", async () => {
    const error = new Error("service failed");
    mockRacerService.getAll.mockRejectedValue(error);

    await racerController.getAll(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});