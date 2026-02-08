import { Request, Response } from "express";
import { IRacerService } from "./racer.service.interface.js";
import { ApiResponse, RacerWithStats } from "@shared/index";

export class RacerController {
  constructor(private racerService: IRacerService) {}

  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const filters = req.query.active ? { active: req.query.active === "true" } : undefined;

      const racers = await this.racerService.getAll(filters);

      const response: ApiResponse<RacerWithStats[]> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: `Successfully retrieved ${racers.length} racers`,
        data: racers,
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    res.status(501).json({ error: "Not implemented" });
  }

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
