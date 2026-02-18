import { Request, Response } from "express";
import { IRaceService } from "./race.service.interface.js";
import { AppError } from "src/errors/appError.js";
import { RaceResponse } from "src/models/index.js";
import { ApiResponse } from "shared/dist/api/index.js";

export class RaceController {
  constructor(private raceService: IRaceService) {}

  async getBySeasonId(req: Request, res: Response): Promise<void> {
    try {
      const { seasonId } = req.params;
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
      if (error instanceof AppError) {
        res.status(error.statusCode).json(error.toJSON());
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { raceId } = req.params;
      const race = await this.raceService.getById(raceId);

      const response: ApiResponse<RaceResponse> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: `Successfully retrieved race with ID ${raceId}`,
        data: race,
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(error.toJSON());
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const { seasonId } = req.params;
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
      if (error instanceof AppError) {
        res.status(error.statusCode).json(error.toJSON());
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { raceId } = req.params;
      const raceData = req.body;
      const updatedRace = await this.raceService.update(raceId, raceData);

      const response: ApiResponse<RaceResponse> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: `Successfully updated race with ID ${raceId}`,
        data: updatedRace,
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(error.toJSON());
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const { raceId } = req.params;
      await this.raceService.delete(raceId);

      const response: ApiResponse<null> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: `Successfully deleted race with ID ${raceId}`,
        data: null,
      };
      res.status(200).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(error.toJSON());
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  }
}
