import { Request, Response } from "express";
import { ISeasonService } from "./season.service.interface.js";
import { ApiResponse, SeasonStatus, Season } from "@shared/index";
import { SeasonResponse } from "../../models/season.model.js";
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
        timestamp: new Date(),
        message: "Successfully retrieved seasons",
        data: seasons,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async getCurrent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const season = await this.seasonService.getActiveSeason();
      console.log("Here", season);
      const response: ApiResponse<Season> = {
        success: true,
        timestamp: new Date(),
        message: "Successfully retrieved active season",
        data: season,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
