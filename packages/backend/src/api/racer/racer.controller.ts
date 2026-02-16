import { Request, Response } from "express";
import { IRacerService } from "./racer.service.interface.js";
import { ApiResponse, Racer, RacerWithStats } from "shared";
import { AppError } from "@src/errors/appError.js";

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
    try {
      const racer = await this.racerService.getById(req.params.id);
      if (!racer) {
        res.status(404).json({ error: "Racer not found" });
        return;
      }
      res.status(200).json(racer);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const racerData = req.body;
      const newRacer = await this.racerService.create(racerData);
      const response: ApiResponse<Racer> = {
        success: true,
        status: 201,
        statusText: "Created",
        timestamp: new Date(),
        message: "Racer created successfully",
        data: newRacer,
      };
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json(error.toJSON());
        return;
      }
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const racerData = req.body;
      const updatedRacer = await this.racerService.update(req.params.id, racerData);
      res.status(200).json(updatedRacer);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      await this.racerService.delete(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
