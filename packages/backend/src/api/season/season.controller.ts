import { Request, Response } from "express";
import { ISeasonService } from "./season.service.interface.js";
import { ApiResponse } from "@shared/models.js";
import { SeasonResponse } from "../../models/season.model.js";
import { SeasonStatus } from "shared";

export class SeasonController {
  constructor(private seasonService: ISeasonService) {}

  async getAll(req: Request, res: Response): Promise<void> {
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
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  // async getCurrent(req: Request, res: Response): Promise<void> {
  //   const season = await this.seasonService.getActiveSeason();
  //   if (season) {
  //     const response: ApiResponse<SeasonResponse> = {
  //       success: true,
  //       timestamp: new Date(),
  //       message: "Successfully retrieved active season",
  //       data: season,
  //     };
  //     res.status(200).json(response);
  //   } else {
  //     res.status(404).json({ error: "No active season found" });
  //   }
  // }

  async create(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async update(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

  async delete(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }
}
