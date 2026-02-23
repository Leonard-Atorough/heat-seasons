import { NextFunction, Request, Response } from "express";
import { IRacerService } from "./racer.service.interface.js";
import { ApiResponse, Racer, RacerWithStats } from "shared";
import { AppError } from "src/Infrastructure/errors/appError.js";

export class RacerController {
  constructor(private racerService: IRacerService) {}

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const racer = await this.racerService.getById(req.params.id);
      if (!racer) {
        const response: ApiResponse<null> = {
          success: false,
          status: 404,
          statusText: "Not Found",
          timestamp: new Date(),
          message: "Racer not found",
          data: null,
        };
        res.status(404).json(response);
        return;
      }
      const response: ApiResponse<RacerWithStats> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: `Successfully retrieved racer with ID ${req.params.id}`,
        data: racer,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
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
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const racerData = req.body;
      const updatedRacer = await this.racerService.update(req.params.id, racerData);
      const response: ApiResponse<Racer> = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        message: `Successfully updated racer with ID ${req.params.id}`,
        data: updatedRacer,
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.racerService.delete(req.params.id);
      const response: ApiResponse<null> = {
        success: true,
        status: 204,
        statusText: "No Content",
        timestamp: new Date(),
        message: `Successfully deleted racer with ID ${req.params.id}`,
        data: null,
      };
      res.status(204).json(response);
    } catch (error) {
      next(error);
    }
  }
}
