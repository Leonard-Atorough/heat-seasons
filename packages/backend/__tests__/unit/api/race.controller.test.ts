import { NextFunction, Request, Response } from "express";
import { RaceController } from "../../../src/api/race/race.controller";
import { IRaceService } from "../../../src/api/race/race.service.interface";
import { RaceResponse } from "../../../src/application/dtos";
import { races } from "../../fixtures";

function createRaceResponse(overrides: Partial<RaceResponse> = {}): RaceResponse {
  return {
    ...races.pending(),
    ...overrides,
  };
}

describe("RaceController", () => {
  // 1. Given a season query, when listing races, then the controller validates the required query param and returns a 400 when it is missing.
  // 2. Given valid race routes, when fetching, creating, updating, or deleting races, then the controller maps params and body to the service and returns thin success envelopes.
  // 3. Given unexpected race-service failures, when controller actions run, then the controller forwards the error to next.

  let raceController: RaceController;
  let mockRaceService: jest.Mocked<IRaceService>;
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockRaceService = {
      getBySeasonId: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      calculatePoints: jest.fn(),
    };

    raceController = new RaceController(mockRaceService);
    request = { params: {}, query: {}, body: {} };
    response = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns 400 when seasonId is missing from list queries", async () => {
    await raceController.getBySeasonId(request as Request, response as Response, next);

    expect(mockRaceService.getBySeasonId).not.toHaveBeenCalled();
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        status: 400,
        message: "seasonId query parameter is required",
      }),
    );
  });

  it("lists and fetches races using request query and params", async () => {
    const listedRace = createRaceResponse({ id: "race-1", seasonId: "season-1" });
    request.query = { seasonId: "season-1" };
    mockRaceService.getBySeasonId.mockResolvedValue([listedRace]);

    await raceController.getBySeasonId(request as Request, response as Response, next);

    expect(mockRaceService.getBySeasonId).toHaveBeenCalledWith("season-1");
    expect(response.status).toHaveBeenCalledWith(200);

    request.params = { id: "race-1" };
    mockRaceService.getById.mockResolvedValue(listedRace);

    await raceController.getById(request as Request, response as Response, next);

    expect(mockRaceService.getById).toHaveBeenCalledWith("race-1");
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("creates, updates, and deletes races using request data", async () => {
    const createdRace = createRaceResponse({ id: "race-2", seasonId: "season-1" });
    request.query = { seasonId: "season-1" };
    request.body = { name: "Feature Race", raceNumber: 99 };
    mockRaceService.create.mockResolvedValue(createdRace);

    await raceController.create(request as Request, response as Response, next);

    expect(mockRaceService.create).toHaveBeenCalledWith("season-1", {
      name: "Feature Race",
      raceNumber: 99,
    });
    expect(response.status).toHaveBeenCalledWith(201);

    request.params = { id: "race-2" };
    request.body = { completed: true };
    mockRaceService.update.mockResolvedValue({ ...createdRace, completed: true });

    await raceController.update(request as Request, response as Response, next);

    expect(mockRaceService.update).toHaveBeenCalledWith("race-2", { completed: true });
    expect(response.status).toHaveBeenCalledWith(200);

    mockRaceService.delete.mockResolvedValue();
    await raceController.delete(request as Request, response as Response, next);

    expect(mockRaceService.delete).toHaveBeenCalledWith("race-2");
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("forwards race-service errors to next", async () => {
    const error = new Error("race failure");
    request.query = { seasonId: "season-1" };
    mockRaceService.getBySeasonId.mockRejectedValue(error);

    await raceController.getBySeasonId(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});