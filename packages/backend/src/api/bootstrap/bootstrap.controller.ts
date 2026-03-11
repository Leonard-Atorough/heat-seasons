import { Request, Response, NextFunction } from "express";
import { IBootstrapService } from "./bootstrap.service.interface.js";
import { ApiResponse } from "shared/dist/api/ApiResponse";
import { BootstrapConfigResponse, UserResponse } from "src/application/dtos";

export class BootstrapController {
  constructor(private bootstrapService: IBootstrapService) {}

  async isSystemBootstrapped(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const isBootstrapped = await this.bootstrapService.isSystemBootstrapped();

      const response = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        data: { isBootstrapped },
      } as ApiResponse<{ isBootstrapped: boolean }>;

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async generateBootstrapToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { expirationMinutes } = req.body;
      const result = await this.bootstrapService.generateBootstrapToken(
        expirationMinutes !== undefined ? { expirationMinutes } : undefined,
      );

      const response = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        data: result,
      } as ApiResponse<BootstrapConfigResponse>;

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  async bootstrapSystem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, googleId, email, name } = req.body;
      const result = await this.bootstrapService.bootstrapSystem({ token, googleId, email, name });

      const response = {
        success: true,
        status: 200,
        statusText: "OK",
        timestamp: new Date(),
        data: result,
      } as ApiResponse<UserResponse>;

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
