import { NextFunction, Request, Response } from "express";
import { IRaceService } from "./race.service.interface.js";
import { AppError } from "src/Infrastructure/errors/appError.js";
import { RaceResponse } from "src/application/dtos";
import { ApiResponse } from "shared/dist/api/index.js";

export class RaceController {
  constructor(private raceService: IRaceService) {}

  async getBySeasonId(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const seasonId = req.query.seasonId as string;
      if (!seasonId) {
        res.status(400).json({
          success: false,
          status: 400,
          statusText: "Bad Request",
          message: "seasonId query parameter is required",
        });
        return;
      }
      const races = await this.raceService.getBySeasonId(seasonId);

      const response: ApiResponse<RaceResponse[]> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: `Successfully retrieved ${races.length} races for season ${seasonId}`,
        data: races,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const race = await this.raceService.getById(id);

      const response: ApiResponse<RaceResponse> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: `Successfully retrieved race with ID ${id}`,
        data: race,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { seasonId } = req.query as { seasonId: string };
      const raceData = req.body;
      const newRace = await this.raceService.create(seasonId, raceData);
      const response: ApiResponse<RaceResponse> = {
        success: true,
        status: 201,
        statusText: "Created",
        timestamp: new Date(),
        message: `Successfully created race with ID ${newRace.id}`,
        data: newRace,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const raceData = req.body;
      const updatedRace = await this.raceService.update(id, raceData);

      const response: ApiResponse<RaceResponse> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: `Successfully updated race with ID ${id}`,
        data: updatedRace,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await this.raceService.delete(id);

      const response: ApiResponse<null> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: `Successfully deleted race with ID ${id}`,
        data: null,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
