import { Request, Response } from "express";
import { ISeasonService } from "./season.service.interface.js";
import { ApiResponse, SeasonStatus, Season, SeasonParticipant } from "shared";
import { SeasonResponse } from "../../application/dtos/index.js";
import { NextFunction } from "express-serve-static-core";

export class SeasonController {
  constructor(private seasonService: ISeasonService) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const filters: { status?: SeasonStatus } = {};
      if (req.query.status && typeof req.query.status === "string") {
        filters.status = req.query.status as SeasonStatus;
      }
      const seasons = await this.seasonService.getAll(filters);
      const response: ApiResponse<SeasonResponse[]> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: seasons.length > 0 ? "Successfully retrieved seasons" : "No seasons found",
        data: seasons,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id } = req.params;
    try {
      const season = await this.seasonService.getById(id);
      const response: ApiResponse<Season> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: "Successfully retrieved season",
        data: season,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const seasonData = req.body;
      const createdSeason = await this.seasonService.create(seasonData);
      const response: ApiResponse<Season> = {
        success: true,
        status: 201,
        statusText: "Created",
        timestamp: new Date(),
        message: "Successfully created season",
        data: createdSeason,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async join(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: seasonId, racerId } = req.params;
    try {
      const participant = await this.seasonService.joinSeason(seasonId, racerId);
      const response: ApiResponse<SeasonParticipant> = {
        success: true,
        status: 201,
        statusText: "Created",
        timestamp: new Date(),
        message: "Successfully joined season",
        data: participant,
      };
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getParticipants(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: seasonId } = req.params;
    try {
      const participants = await this.seasonService.getParticipants(seasonId);
      const response: ApiResponse<SeasonParticipant[]> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: "Successfully retrieved season participants",
        data: participants,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: seasonId } = req.params;
    const updateData = req.body;

    try {
      const updatedSeason = await this.seasonService.update(seasonId, updateData);
      const response: ApiResponse<Season> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: "Successfully updated season",
        data: updatedSeason,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { id: seasonId } = req.params;
    try {
      await this.seasonService.delete(seasonId);
      const response: ApiResponse<null> = {
        success: true,
        status: 204,
        statusText: "No Content",
        timestamp: new Date(),
        message: "Successfully deleted season",
        data: null,
      };
      res.status(204).json(response);
    } catch (error) {
      next(error);
    }
  }
}
