import { NextFunction, Request, Response } from "express";
import { SeasonController } from "../../../src/api/season/season.controller";
import { ISeasonService } from "../../../src/api/season/season.service.interface";
import { SeasonParticipant } from "shared";
import { SeasonResponse } from "../../../src/application/dtos";
import { seasons } from "../../fixtures";

function createSeasonResponse(overrides: Partial<SeasonResponse> = {}): SeasonResponse {
  return {
    ...seasons.active(),
    ...overrides,
  };
}

describe("SeasonController", () => {
  // 1. Given list requests, when a status query is present, then the controller parses it into service filters and returns a 200 response.
  // 2. Given create and participant routes, when params and body are present, then the controller forwards them to the service and returns thin envelopes.
  // 3. Given not-yet-implemented member routes, when they are called, then the controller returns 501 responses without invoking the service.
  // 4. Given unexpected season-service failures, when implemented controller actions run, then the controller forwards the error to next.

  let seasonController: SeasonController;
  let mockSeasonService: jest.Mocked<ISeasonService>;
  let request: Partial<Request>;
  let response: Partial<Response>;
  let next: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    mockSeasonService = {
      getAll: jest.fn(),
      getById: jest.fn(),
      create: jest.fn(),
      joinSeason: jest.fn(),
      getParticipants: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    seasonController = new SeasonController(mockSeasonService);
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

  it("parses the status filter and returns seasons", async () => {
    const listedSeason = createSeasonResponse({ id: "season-1", status: "active" });
    request.query = { status: "active" };
    mockSeasonService.getAll.mockResolvedValue([listedSeason]);

    await seasonController.getAll(request as Request, response as Response, next);

    expect(mockSeasonService.getAll).toHaveBeenCalledWith({ status: "active" });
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: true,
        status: 200,
        data: [listedSeason],
      }),
    );
  });

  it("creates seasons and manages participant routes", async () => {
    const createdSeason = createSeasonResponse({ id: "season-2", status: "upcoming" });
    const joinedParticipant: SeasonParticipant = {
      seasonId: "season-2",
      racerId: "racer-1",
      registeredAt: new Date("2026-03-10T00:00:00.000Z"),
    };
    request.body = { name: "Season 2", startDate: new Date("2026-06-01T00:00:00.000Z") };
    mockSeasonService.create.mockResolvedValue(createdSeason);

    await seasonController.create(request as Request, response as Response, next);

    expect(mockSeasonService.create).toHaveBeenCalledWith(request.body);
    expect(response.status).toHaveBeenCalledWith(201);

    request.params = { id: "season-2", racerId: "racer-1" };
    mockSeasonService.joinSeason.mockResolvedValue(joinedParticipant);

    await seasonController.join(request as Request, response as Response, next);

    expect(mockSeasonService.joinSeason).toHaveBeenCalledWith("season-2", "racer-1");
    expect(response.status).toHaveBeenCalledWith(201);

    mockSeasonService.getParticipants.mockResolvedValue([joinedParticipant]);
    await seasonController.getParticipants(request as Request, response as Response, next);

    expect(mockSeasonService.getParticipants).toHaveBeenCalledWith("season-2");
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("forwards season-service errors to next", async () => {
    const error = new Error("season failed");
    mockSeasonService.getAll.mockRejectedValue(error);

    await seasonController.getAll(request as Request, response as Response, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});